import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, concatMap, distinctUntilChanged, finalize, from, map, Observable, of, Subject, switchMap, take, takeUntil, tap } from 'rxjs';


import * as L from 'leaflet';

export function instanceOfMapLocate(obj: unknown): obj is MapLocate {
  return (<MapLocate>obj).location !== undefined;
}

export interface MapLocation {
  lat: number,
  lon: number
}

export interface MapLocate {
  id: string,
  name: string,
  address: string,
  house_number: string,
  suburb: string,
  city: string,
  postcode: string,
  location: MapLocation,
}

interface MapInfoNominatim {
  name: string,
  road: string,
  house_number: string,
  suburb: string,
  city: string,
  postcode: string
}

@Injectable({
  providedIn: 'root',
})
export class MapService {
  userCoordinates?: MapLocation;

  list = new EventEmitter<MapLocate>();
  loading = new BehaviorSubject<boolean>(false); // Gerenciar estado de carregamento

  marketMarkersMap = new Map<string, { marker: L.Marker, details: MapLocate }>();
  marketMarkersGroup: L.LayerGroup = L.layerGroup();
  onMarkerClick!: (market: MapLocate) => void;

  async setUserCoordinates(): Promise<MapLocation> {
    if (this.userCoordinates) return this.userCoordinates;

    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve(this.userCoordinates = {
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            });
          },
          (error) => {
            console.error('Erro ao obter localização:', error);
            resolve(this.userCoordinates = { lat: -15.7942, lon: -47.8822 }); // Fallback para Brasília
          }
        );
      } else {
        console.error('Geolocalização não é suportada pelo navegador.');
        resolve(this.userCoordinates = { lat: -15.7942, lon: -47.8822 }); // Fallback para Brasília
      }
    });
  }

  constructor(private http: HttpClient) { }

  getMarkets2(bbox: string) {
    const query = `
      [out:json];
      (
        node["shop"~"supermarket|convenience|grocery"](${bbox});
        way["shop"~"supermarket|convenience|grocery"](${bbox});
        relation["shop"~"supermarket|convenience|grocery"](${bbox});
      );
      out center;
    `;

    return this.http.post('https://overpass-api.de/api/interpreter', query, {
      headers: { 'Content-Type': 'text/plain' }, // A API espera 'text/plain'
      responseType: 'json', // Certifique-se de que está retornando JSON
    }).pipe(
      map((response: any) => response?.elements || []), // Verifica se 'elements' existe
      catchError((error) => {
        console.error('Erro na API Overpass:', error);
        return of([]); // Retorna um array vazio em caso de erro
      })
    );
  }

  private cancelSubject = new Subject<void>(); // Usado para cancelar o Observable
  getMarkets(bbox: string) {
    const query = `
      [out:json];
      (
        node["shop"~"supermarket|convenience|grocery"](${bbox});
        way["shop"~"supermarket|convenience|grocery"](${bbox});
        relation["shop"~"supermarket|convenience|grocery"](${bbox});
      );
      out center;
    `;

    return this.http.post('https://overpass-api.de/api/interpreter', query, {
      headers: { 'Content-Type': 'text/plain' }, // A API espera 'text/plain'
      responseType: 'json', // Certifique-se de que está retornando JSON
    }).pipe(
      distinctUntilChanged(),
      take(1),
      switchMap((infoOverpass: any) => {
        const market: any[] = infoOverpass?.elements || [];

        if (!market || !Array.isArray(market)) {
          console.debug('Nenhum mercado encontrado');
          return of([]);
        }

        console.log(`Processando ${market.length} mercados`);
        return this.processOverpassData(market); // Retorna o processamento do chunk
      }),
      tap((processedMarkets: never[] | MapLocate) => {
        // Reutilizar existentes + adicionar novos
        if (instanceOfMapLocate(processedMarkets)) this.addMarkersToMap(processedMarkets);
      }),
      finalize(() => {
        this.loading.next(false); // Finaliza o estado de carregamento
        this.loadingProgress.next(0); // Reseta o progresso
      })
    ).subscribe({
      next: (result) => {
        const locate = result as MapLocate;
        this.list.emit(locate);
      },
      error: (err) => console.error('Erro no carregamento:', err),
      complete: () => console.debug('Carregamento concluído'),
    });
  }

  addMarkersToMap(market: MapLocate) {
    if (this.marketMarkersMap.has(market.id)) {
      // Marcador já existe, reutilizar
      const existingMarker = this.marketMarkersMap.get(market.id)?.marker;
      if (existingMarker) {
        // existingMarker.addTo(this.marketMarkersGroup)
        this.marketMarkersGroup.addLayer(existingMarker); // Adiciona de volta ao mapa
      }
    } else {
      // Criar novo marcador
      const newMarker = L.marker([market.location.lat, market.location.lon])
        .bindPopup(this.createPopup(market))
        .on('click', () => this.onMarkerClick(market)); // Ação no clique

      this.marketMarkersGroup.addLayer(newMarker); // Adiciona ao grupo
      this.marketMarkersMap.set(market.id, { marker: newMarker, details: market }); // Armazena no Map
    }
  }

  removeAllMarkers(): void {
    this.marketMarkersGroup.clearLayers();
  }

  private createPopup(market: MapLocate): string {
    return `
        <b>${market.name}</b>
        <br>${market.address} ${!!market.house_number ? ', ' + market.house_number : ''}
        ${market.suburb && market.city ? '<br>' + market.suburb + ', ' + market.city : ''}
        `.trim();
  }

  getNearbyMarkets(bbox: string) {
    const query = `
      [out:json];
      (
        node["shop"="supermarket"](${bbox});
        node["shop"="convenience"](${bbox});
      );
      out;
    `;
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

    return this.http.get(url);
  };

  centerMap(location: MapLocation, map: L.Map): void {
    if (map) {
      map.setView([location.lat, location.lon], map.getZoom(), {
        animate: true,
      });
    }
  }

  searchByCircle(lat: number, lon: number, radius: number): void {
    this.loading.next(true); // Inicia o estado de carregamento
    this.loadingProgress.next(0); // Reseta o progresso

    const filter = `(around:${radius},${lat},${lon})`;
    const query = `
      [out:json];
      (
        node["shop"~"supermarket|convenience|grocery"]${filter};
        way["shop"~"supermarket|convenience|grocery"]${filter};
        relation["shop"~"supermarket|convenience|grocery"]${filter};
      );
      out center;
    `;

    this.http.post('https://overpass-api.de/api/interpreter', query, {
      headers: { 'Content-Type': 'text/plain' },
      responseType: 'json',
    }).pipe(
      take(1),
      switchMap((infoOverpass: any) => {
        const market: any[] = infoOverpass?.elements || [];

        if (!market || !Array.isArray(market)) {
          console.debug('Nenhum mercado encontrado');
          return of([]);
        }

        console.debug(`Processando ${market.length} mercados`);
        return this.processOverpassData(market); // Retorna o processamento do chunk
      }),
      finalize(() => {
        console.log('finalize')
        this.loading.next(false); // Finaliza o estado de carregamento
        this.loadingProgress.next(0); // Reseta o progresso
      })
    ).subscribe({
      next: (result) => {
        const locate = result as MapLocate;
        this.list.emit(locate);
      },
      error: (err) => console.error('Erro no carregamento:', err),
      complete: () => console.debug('Carregamento concluído'),
    });
  }

  getMapLocateFromOverpass(element: any): Observable<MapLocate> {
    console.debug('elemento overpass', element);

    const mapLocation = this.getMapLocation(element);
    console.debug('mapLocation', mapLocation);

    if (!mapLocation) {
      console.debug('Sem localização válida', element);
      return of(element); // Retorna como Observable
    }

    const mapLocate = this.getMapLocate(element, mapLocation);
    console.debug('mapLocate', mapLocate);

    if (!mapLocate) {
      console.debug('Sem dados válidos de localização', element);
      return of(element); // Retorna como Observable
    }

    const marketMarker = this.marketMarkersMap.get(mapLocate.id);
    if (marketMarker) { return of(marketMarker.details); }

    console.log('getMapLocate corrigiu', marketMarker)

    // Verifica campos necessários e busca endereço adicional se incompletos
    if (!mapLocate.name || !mapLocate.address || !mapLocate.postcode) {
      console.debug('Campos incompletos', mapLocate);

      return this.getAddress2(mapLocation).pipe(
        take(1),
        map((infoNominatim) => {
          console.debug('infoNominatim', infoNominatim);

          const mapInfoNominatim = this.getMapInfoNominatim(infoNominatim);
          console.debug('mapInfoNominatim', mapInfoNominatim);

          if (!mapInfoNominatim) {
            console.debug('Sem informações adicionais no Nominatim', element);
            return element;
          }
          mapLocate.name = mapLocate.name || mapInfoNominatim.name || 'Mercado sem nome';
          mapLocate.address = mapLocate.address || mapInfoNominatim.road;
          mapLocate.house_number = mapLocate.house_number || mapInfoNominatim.house_number;
          mapLocate.suburb = mapLocate.suburb || mapInfoNominatim.suburb;
          mapLocate.city = mapLocate.city || mapInfoNominatim.city;
          mapLocate.postcode = mapLocate.postcode || mapInfoNominatim.postcode;

          console.debug('mapLocate Ajustado', mapLocate);
          return mapLocate;
        })
      );
    }

    console.debug('mapLocateFinal', mapLocate);
    return of(mapLocate); // Retorna como Observable
  }

  chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  loadingProgress = new BehaviorSubject<number>(0); // Gerencia o progresso de carregamento
  totalElements = 0; // Total de itens a processar

  processOverpassData(elements: any[]): Observable<MapLocate> {
    const chunks = this.chunkArray(elements, 10); // Divide em chunks de 10 elementos
    this.totalElements = elements.length; // Define o total de elementos para calcular o progresso
    let processedCount = 0;
    this.cancelSubject.next();

    return from(chunks).pipe(
      concatMap((chunk, index) => {
        console.debug(`Processando chunk ${index + 1}/${chunks.length}`, chunk);
        return from(chunk).pipe(
          takeUntil(this.cancelSubject.pipe(tap(() => console.log('Cancelamento disparado!')))),
          // take(1),
          concatMap((element) => this.getMapLocateFromOverpass(element).pipe(
            tap(() => {
              processedCount++; // Incrementa o contador a cada elemento processado
              const progress = Math.round((processedCount / this.totalElements) * 100);
              this.loadingProgress.next(progress); // Atualiza o progresso
            })
          ),
          ));
      })
    );
  }

  private getMapLocation(element: unknown): MapLocation | undefined {
    const type = (element as { type: string })?.type;

    if (type === 'node') {
      return {
        lat: (element as { lat: number })?.lat ?? 0,
        lon: (element as { lon: number })?.lon ?? 0,
      }
    }

    if (type === 'way' || type === 'relation') {
      const center = (element as { center: { lat: number, lon: number } })?.center;

      if (!center) return undefined;

      return {
        lat: center.lat,
        lon: center.lon,
      }
    }

    return undefined;
  }

  getMapLocate(element: unknown, location: MapLocation): MapLocate {
    const tags = (element as {
      tags: {
        name: string,
        ['addr:street']: string,
        ['addr:housenumber']: string,
        ['addr:suburb']: string,
        ['addr:city']: string,
        ['addr:postcode']: string,
      }
    })?.tags;

    const retorno: MapLocate = {
      id: (element as { id: string })?.id,
      name: tags.name || '',
      address: tags['addr:street'] || '',
      house_number: tags['addr:housenumber'] || '',
      suburb: tags['addr:suburb'] || '',
      city: tags['addr:city'] || '',
      postcode: tags['addr:postcode'] || '',
      location: location
    }

    return retorno;
  }

  getMapInfoNominatim(element: unknown): MapInfoNominatim {
    const retorno: MapInfoNominatim = {
      name: (element as { name: string })?.name || (element as { shop: string })?.shop,
      road: (element as { road: string })?.road,
      house_number: (element as { house_number: string })?.house_number,
      suburb: (element as { suburb: string })?.suburb,
      city: (element as { city: string })?.city,
      postcode: (element as { postcode: string })?.postcode,
    }

    return retorno;
  }

  getAddress2(location: MapLocation) {
    console.log('getAddress2', location)
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${location.lat}&lon=${location.lon}&format=json&addressdetails=1`;
    let displayAddress = 'Endereço não encontrado';

    return this.http.get(url, {
      headers: { 'Content-Type': 'text/plain' },
      responseType: 'json',
    }).pipe(
      map((response: any) => response?.address || {}),
      catchError(error => {
        console.error('Erro ao buscar endereço:', error);
        return of(displayAddress);
      })
    );
  }

  getAddress(location: MapLocation): Observable<string> {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${location.lat}&lon=${location.lon}&format=json&addressdetails=1`;
    let displayAddress = 'Endereço não encontrado';

    return this.http.get<{ address: { road: string, suburb: string, city: string, state: string, country: string } }>(url)
      .pipe(map((data => {
        const address = data.address;
        if (!!address) {
          const addressConvert = `${address.road || ''}, ${address.suburb || ''}, ${address.city || ''}, ${address.state || ''}, ${address.country || ''}`
          console.log('getAddress', addressConvert)
          return addressConvert;
        }

        return displayAddress;
      }),
        catchError(error => {
          console.error('Erro ao buscar endereço:', error);
          return of(displayAddress);
        })
      ));
  }
}

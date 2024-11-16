import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, map, Observable, of, switchMap, take } from 'rxjs';
import { MapLocate, MapLocation, MapService } from 'src/app/services/map.service';
import * as L from 'leaflet';

const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

L.Marker.prototype.options.icon = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

const ZOON_DEFAULT = 17;
@Component({
  selector: 'app-purchase-map',
  templateUrl: './purchase-map.component.html',
  styleUrls: ['./purchase-map.component.scss']
})
export class PurchaseMapComponent implements OnInit {
  private map!: L.Map;
  private existingMarkets: Set<string> = new Set();
  protected searchControl = new FormControl();
  marketMarkersGroup: L.LayerGroup = L.layerGroup();
  marketMarkersMap = new Map<string, { marker: L.Marker, details: MapLocate }>();

  userMarker?: L.Marker<any>;
  constructor(
    private readonly mapService: MapService
  ) { }

  ngOnInit(): void {
    if (!this.map) {
      this.initializeMap();
    }

    this.searchControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe(value => {
        this.searchMarkets(value)
      });
  }

  private async initializeMap(): Promise<void> {
    await this.mapService.setUserCoordinates();

    const lat = this.mapService?.userCoordinates?.lat ?? 0;
    const lon = this.mapService?.userCoordinates?.lon ?? 0;

    // Inicializa o mapa na localização do usuário
    this.map = L.map('map').setView([lat, lon], ZOON_DEFAULT);
    this.marketMarkersGroup.addTo(this.map);

    L.control.scale({
      position: 'topright', // Altere para 'topleft' se necessário
      metric: true,         // Exibe a escala em metros
      imperial: false,      // Não exibe a escala imperial (pés e milhas)
    }).addTo(this.map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    // Adiciona um marcador na localização do usuário
    this.userMarker = L.marker([lat, lon])
      .addTo(this.map)
      .bindPopup('Você está aqui!')
      .openPopup();

    this.getMarketsCallback();
    this.createUserLocationButton();

    this.map.on('click', (event: L.LeafletMouseEvent) => {
      this.handleMapClick(event);
    });

    this.map.on('moveend', () => this.searchMarkets(this.searchControl.value));
  }

  private createUserLocationButton = () => {
    const userMarker = this.userMarker;
    const map = this.map;

    const CenterControl = L.Control.extend({
      options: {
        position: 'topleft', // mesma posição dos botões de zoom
      },

      onAdd: function () {
        // Cria o container para o botão
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');

        // Adiciona estilo ao botão
        container.style.backgroundColor = '#fff';
        container.style.width = '30px';
        container.style.height = '30px';
        container.style.cursor = 'pointer';
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        container.style.border = '2px solid rgba(0, 0, 0, 0.2)';
        container.style.backgroundClip = 'padding-box';

        // Adiciona o ícone ao botão (usando um Unicode de ícone, ou você pode adicionar uma imagem/SVG)
        container.innerHTML = '<span style="font-size: 18px;">📍</span>';

        // Adiciona evento de clique para centralizar o mapa
        container.onclick = (event) => {
          event.stopPropagation();

          if (userMarker) {
            userMarker.openPopup();
            map.setView(userMarker.getLatLng(), ZOON_DEFAULT);
          }
        };

        return container;
      },
    });

    // Adiciona o controle ao mapa
    map.addControl(new CenterControl());
  }

  private handleMapClick(event: L.LeafletMouseEvent): void {
    const { lat, lng } = event.latlng;

    // Adiciona um marcador na posição clicada
    const newMarker = L.marker([lat, lng]).addTo(this.map);

    // Exibe o popup inicial com opções de salvar ou cancelar
    this.attachInitialPopup(newMarker, lat, lng);
  }

  // Método para anexar o popup inicial
  private attachInitialPopup(marker: L.Marker, lat: number, lng: number): void {
    this.mapService.getAddress({ lat: lat, lon: lng })
      .pipe(take(1))
      .subscribe((displayAddress) => {
        if (displayAddress === 'Erro ao buscar endereço.') marker.setPopupContent('Erro ao buscar endereço.');
        else {
          marker.bindPopup(`
        <div id="popup-content">
          <strong>Novo mercado</strong><br/>
          Endereço: ${displayAddress}<br/>
          <button id="save-marker">Salvar</button>
          <button id="cancel-marker">Cancelar</button>
        </div>
        `);

          // Evento disparado quando o popup é aberto
          marker.on('popupopen', () => {
            // Vincula eventos aos botões somente após o popup estar completamente aberto
            const saveButton = document.getElementById('save-marker');
            const cancelButton = document.getElementById('cancel-marker');

            if (saveButton) {
              saveButton.onclick = () => this.saveMarker(marker, lat, lng);
            }

            if (cancelButton) {
              cancelButton.onclick = () => {
                this.map.removeLayer(marker);
              };
            }
          });
        }

        setTimeout(() => {
          marker.openPopup();
        }, 0);
      });
  }

  private saveMarker(marker: L.Marker, lat: number, lng: number): void {
    marker.closePopup();

    this.mapService.getAddress({ lat: lat, lon: lng })
      .pipe(take(1))
      .subscribe((displayAddress) => {
        if (displayAddress === 'Erro ao buscar endereço.') marker.setPopupContent('Erro ao buscar endereço.');
        else {
          marker.bindPopup(`
          <div>
            <strong>Mercado salvo</strong><br/>
            Endereço: ${displayAddress}<br/>
            <button id="remove-marker">Remover</button>
          </div>
        `);

          marker.on('popupopen', () => {
            const removeButton = document.getElementById('remove-marker');

            if (removeButton) {
              removeButton.onclick = () => {
                this.map.removeLayer(marker);
              };
            }
          });
        }

        setTimeout(() => {
          marker.openPopup();
        }, 0);
      });
  }

  private getMarketsCallback() {
    this.marketMarkersMap.clear();
    const bounds = this.map.getBounds();
    const bbox = `${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`;

    if (this.searchControl.value) this.searchMarkets(this.searchControl.value)
    else {
      this.mapService.getMarkets(bbox).subscribe((markets: any[]) => {
        console.log('Mercados recebidos:', markets); // Inspecione os dados recebidos

        if (!markets || !Array.isArray(markets)) {
          console.warn('Nenhum mercado válido recebido.');
          return;
        }

        this.updateMarketsOnMap(markets);
      });
    }
  }

  private updateMarketsOnMap(markets: any[], resetExisting: boolean = false) {
    if (resetExisting) {
      this.removeAllMarkers();
    }

    markets.forEach(async (market) => {
      let lat: number | undefined;
      let lon: number | undefined;

      if (market.type === 'node') {
        // Objeto do tipo node
        lat = market.lat;
        lon = market.lon;
      } else if (market.type === 'way' || market.type === 'relation') {
        // Objeto do tipo way ou relation
        if (market.center) {
          lat = market.center.lat;
          lon = market.center.lon;
        }
      }

      if (lat !== undefined && lon !== undefined) {
        const marketItem: MapLocate = {
          id: market.id,
          name: market.tags.name || 'Mercado sem nome',
          address: `${market.tags['addr:street'] || ''},
                    ${market.tags['addr:housenumber'] || ''}`,
          city: market.tags['addr:city'] || '',
          postcode: market.tags['addr:postcode'] || '',
          location: { lat, lon },
        };

        const marketKey = `${lat},${lon}`;

        if (resetExisting) {
          this.existingMarkets = new Set();
        }

        console.log(this.existingMarkets)

        if (!this.existingMarkets.has(marketKey)) {
          // Adicione a coordenada ao conjunto para evitar duplicatas
          this.existingMarkets.add(marketKey);

          this.getDataMarket(marketItem).subscribe((dataMaker) => {
            const marker = L.marker([lat ?? 0, lon ?? 0], {
              // icon: this.marketIcon,
            }).bindPopup(dataMaker);
            marker.addTo(this.marketMarkersGroup);
          });
        }

        this.marketMarkersGroup.getLayers().find(layer => {
          if (layer instanceof L.Marker && layer.getLatLng().equals([lat ?? 0, lon ?? 0])) {
            this.marketMarkersMap.set(market.id, { marker: layer, details: marketItem });
          }
        });
      }
    });
  }

  highlightMarker(marketId: string): void {
    const marketData = this.marketMarkersMap.get(marketId); // Recupera o marcador pelo ID
    if (marketData) {
      marketData.marker.openPopup(); // Abre o popup do marcador
    }
  }

  unhighlightMarker(marketId: string): void {
    const marketData = this.marketMarkersMap.get(marketId); // Recupera o marcador pelo ID
    if (marketData) {
      marketData.marker.closePopup(); // Fecha o popup do marcador
    }
  }

  private removeAllMarkers(): void {
    this.marketMarkersGroup.clearLayers(); // Remove todos os marcadores
  }

  mapToArray(map: Map<string, { marker: L.Marker, details: MapLocate }>) {
    return Array.from(map.values());
  }

  private getDataMarket(market: MapLocate): Observable<((layer: L.Layer) => L.Content) | L.Content | L.Popup> {
    console.log(market)
    const addressParts = [
      (market.address || '').trim(),
      (market.city || '').trim(),
      (market.postcode || '').trim()
    ];

    // Filtra as partes vazias e junta as restantes com vírgulas
    let address = addressParts.filter(part => part !== '').join(', ').trim();

    if (address.trim().length === 1) {
      return this.mapService.getAddress(market.location)
        .pipe(take(1), switchMap(
          (displayAddress) => {
            address = displayAddress;
            // Conteúdo do popup
            const popupContent = `
            <b>${market.name || 'Mercado sem nome'}</b>
            ${address.trim().length !== 1 ? '<br>' + address.trim() : ''}
            `.trim();

            return of(popupContent);
          }
        ));
    }

    // Conteúdo do popup
    const popupContent = `
        <b>${market.name || 'Mercado sem nome'}</b>
        ${address.trim().length !== 1 ? '<br>' + address.trim() : ''}
        `.trim();

    return of(popupContent);
  }

  focusOnMarket(market: MapLocate) {
    const lat = market.location.lat;
    const lon = market.location.lon;

    // Centraliza o mapa no mercado
    this.map.setView([lat, lon]);

    // Exibe um pop-up com o nome do mercado
    this.getDataMarket(market).subscribe((dataMaker) => {
    L.marker([lat, lon])
      .addTo(this.map)
      .bindPopup(dataMaker)
      .openPopup();
    });
  }

  searchMarkets(query: string) {
    console.log('marketMarkersMap', this.marketMarkersMap)
    console.log('marketMarkersGroup', this.marketMarkersGroup)
    this.marketMarkersMap.clear();

    const currentZoom = this.map.getZoom();
    if (currentZoom < 15) {
      this.removeAllMarkers();
      this.existingMarkets = new Set();
      return;
    }

    const bounds = this.map.getBounds(); // Pega os limites visíveis do mapa
    const bbox = `${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`;

    this.mapService.getMarkets(bbox).subscribe((markets: any[]) => {
      console.log('Mercados recebidos após a busca:', markets);

      if (!markets || !Array.isArray(markets)) {
        console.warn('Nenhum mercado válido recebido.');
        return;
      }

      if (!this.searchControl.value) {
        this.updateMarketsOnMap(markets);
        // console.log('Mercados na barra lateral:', this.markets);
      } else {
        // Filtra os mercados pelo nome e pela área visível
        const filteredMarkets = markets.filter((market) => {
          // Verifica se o nome do mercado contém o texto da pesquisa
          const matchesName = market.tags.name && market.tags.name.toLowerCase().includes(query.toLowerCase());

          // Verifica se o mercado está dentro da área visível (bounding box)
          const lat = market.lat || market.center?.lat;
          const lon = market.lon || market.center?.lon;
          const isWithinBounds = lat && lon && bounds.contains([lat, lon]);

          return matchesName && isWithinBounds;
        });

        this.updateMarketsOnMap(filteredMarkets, true);
      }
    });
  }
}

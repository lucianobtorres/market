import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';

export interface MapLocation {
  lat: number,
  lon: number
}

export interface MapLocate {
  id: string,
  name: string,
  address: string,
  city: string,
  postcode: string,
  location: MapLocation,
}

@Injectable({
  providedIn: 'root',
})
export class MapService {
  userCoordinates?: MapLocation;
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
      map((response: any) => response?.elements || []), // Verifica se 'elements' existe
      catchError((error) => {
        console.error('Erro na API Overpass:', error);
        return of([]); // Retorna um array vazio em caso de erro
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
          return `${address.road || ''}, ${address.suburb || ''}, ${address.city || ''}, ${address.state || ''}, ${address.country || ''}`
        }

        return displayAddress;
      }),
        catchError(error => {
          console.error('Erro ao buscar endereço:', error);
          return of(displayAddress);
        })
      ));
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
}

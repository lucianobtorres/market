import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MapService {
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

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private readonly proxyUrl = 'https://cors-anywhere.herokuapp.com/';

  constructor(private http: HttpClient) { }

  // Método para tratar erros
  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente
      console.error('Ocorreu um erro:', error.error.message);
    } else {
      // Erro do lado do servidor
      console.error(`Erro do servidor (status: ${error.status}): ${error.message}`);
    }
    return throwError('Ocorreu um erro na busca dos dados, tente novamente.');
  }

  // Busca no OpenFoodData
  fetchOpenFoodData(barcode: string): Observable<any> {
    const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;

    return this.http.get(url).pipe(
      map((response: any) => {
        if (response.status === 1) {
          return response.product;
        } else {
          return null;
        }
      }),
      catchError(this.handleError) // Lida com erros
    );
  }

  // Busca no Digit-Eyes (como o Angular HttpClient não processa HTML diretamente, mantemos o uso de text parsing)
  fetchDigitEyesData(barcode: string): Observable<{ title: string, description: string, image: string } | null> {
    const url = `https://www.digit-eyes.com/upcCode/${barcode}.html?l=pt`;

    return this.http.get(url, { responseType: 'text' }).pipe(
      map(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const title = doc.querySelector('h5')?.innerText || 'Título não encontrado';
        const description = doc.querySelector('h2')?.innerText || 'Descrição não encontrada';
        const image = doc.querySelector('img')?.src || '';

        return { title, description, image };
      }),
      catchError(this.handleError)
    );
  }
}

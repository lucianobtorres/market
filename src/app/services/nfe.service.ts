import { Injectable } from '@angular/core';
import { BrowserMultiFormatReader, Exception, Result } from '@zxing/library';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NfeService {
  private qrReader = new BrowserMultiFormatReader();

  constructor(private http: HttpClient) {}

  /**
   * Lê um QR Code a partir de um elemento de vídeo.
   * @param videoElement Elemento HTMLVideoElement
   * @returns Promessa com o texto decodificado
   */
  decodeQrCode(videoElement: HTMLVideoElement): Promise<string> {
    return new Promise((resolve, reject) => {
      this.qrReader.decodeFromVideoDevice(
        null, // null para usar a câmera padrão
        videoElement,
        (result: Result | null, error: Exception | undefined) => {
          if (result) {
            resolve(result.getText()); // Texto do QR Code
          } else if (error) {
            console.error('Erro ao decodificar QR Code:', error);
            reject(error);
          }
        }
      );
    });
  }

  /**
   * Faz a requisição para obter o XML da nota fiscal.
   * @param url URL do QR Code da nota fiscal
   */
  getNfeXml2(url: string): Observable<string> {
    // const proxiedUrl = `/nfe${new URL(url).pathname}`;
    const proxiedUrl = 'https://cors-anywhere.herokuapp.com/';
    return this.http.get(proxiedUrl, { responseType: 'text' });
  }

  getNfeXml(url: string): Observable<string> {
    const proxiedUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    return this.http.get(proxiedUrl).pipe(
      map((response: any) => response.contents), // O XML estará dentro de 'contents'
      catchError((error) => {
        console.error('Erro ao usar o proxy:', error);
        return throwError(() => error);
      })
    );

  }

  /**
   * Extrai os itens do XML retornado.
   * @param xml XML da nota fiscal
   */
  parseNfeXml(xml: string): any[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');

    const products = doc.getElementsByTagName('prod');
    const productList = Array.from(products).map((prod) => ({
      name: prod.querySelector('xProd')?.textContent || '',
      quantity: prod.querySelector('qCom')?.textContent || '',
      unit: prod.querySelector('uCom')?.textContent || '',
      price: prod.querySelector('vProd')?.textContent || '',
    }));

    return productList;
  }
}

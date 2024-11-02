import { Injectable, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';

// @ts-ignore
import Quagga from 'quagga';

@Injectable({
  providedIn: 'root'
})
export class QuaggaService {
  private barcodeDetected = new Subject<string>();
  public barcode$ = this.barcodeDetected.asObservable();
  public isProcessingOcr: boolean = false;
  public isCameraAccessible: boolean = true;

  constructor() {}

  initializeQuagga(camera: ElementRef<HTMLElement>): void {
    Quagga.init({
      inputStream: {
        name: 'Live',
        type: 'LiveStream',
        target: camera.nativeElement,
        constraints: {
          width: 640,
          height: 480,
          frameRate: { ideal: 15, max: 15 },
          facingMode: 'environment', // Usar câmera traseira
          advanced: [
            { focusMode: "continuous" },
            { imageStabilization: true }
          ]
        }
      },
      decoder: {
        readers: ['code_128_reader', 'ean_reader', 'upc_reader'] // Formatos de código de barras
      }
    }, (err: unknown) => {
      if (err) {
        this.isCameraAccessible = false;
        console.error('Erro ao inicializar Quagga:', err);
        return;
      }

      this.isCameraAccessible = true;
      Quagga.start();
    });

    Quagga.onDetected((result: { codeResult: { code: string } }) => {
      this.barcodeDetected.next(result.codeResult.code);
    });
  }

  finalizeQuagga(): void {
    if (this.isCameraAccessible) Quagga.stop();
    this.isCameraAccessible = false;
  }
}

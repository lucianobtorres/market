import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ProductService } from 'src/app/services/product.service';

// @ts-ignore
import Quagga from 'quagga';

@Component({
  selector: 'app-barcode-scanner',
  templateUrl: './barcode-scanner.component.html',
  styleUrls: ['./barcode-scanner.component.scss']
})
export class BarcodeScannerComponent implements OnInit, OnDestroy {
  // Referências aos elementos do DOM
  @ViewChild('interactive') targetElement!: HTMLElement;

  isCameraAccessible = true;
  productName: string | null = null;
  productImageSrc: string | null = null;
  barcode: string = "";

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.initializeQuagga();
  }

  ngOnDestroy(): void {
    if (this.isCameraAccessible) Quagga.stop();
  }

  initializeQuagga(): void {
    if (!this.targetElement) {
      this.isCameraAccessible = false;
      console.error('Elemento de vídeo não encontrado');
      return;
    }

    Quagga.init({
      inputStream: {
        name: 'Live',
        type: 'LiveStream',
        target: this.targetElement,
        constraints: {
          width: 640,
          height: 480,
          facingMode: 'environment' // Usar câmera traseira
        }
      },
      decoder: {
        readers: ['code_128_reader', 'ean_reader', 'upc_reader'] // Formatos de código de barras
      }
    }, (err: unknown) => {
      if (err) {
        this.isCameraAccessible = false;
        console.error('Erro ao inicializar Quagga:', err);
        this.barcode = 'Erro ao inicializar a câmera. Por favor, insira o código manualmente.';
        return;
      }

      Quagga.start();
    });

    Quagga.onDetected((result: { codeResult: { code: string } }) => {
      const barcode = result.codeResult.code;
      this.processBarcode(barcode);
    });
  }

  onBarcodeInput(event: EventTarget | null | string | undefined): void {
    const barcodeTxt = event instanceof EventTarget ? (event as HTMLInputElement).value : event;
    this.processBarcode(`${barcodeTxt}`);
  }

  private processBarcode(barcode: string): void {
    this.barcode = barcode;

    this.productService.fetchOpenFoodData(this.barcode).subscribe(openFoodData => {
      if (openFoodData) {
        this.productName = openFoodData.product_name || 'Nome não encontrado';
        this.productImageSrc = openFoodData.image_url || null;
      } else {
        this.productService.fetchDigitEyesData(this.barcode).subscribe(digitEyesData => {
          if (digitEyesData) {
            this.productName = digitEyesData.title || 'Nome não encontrado';
            this.productImageSrc = digitEyesData.image || null;
          } else {
            this.productName = 'Produto não encontrado';
            this.productImageSrc = null;
          }
        });
      }
    });
  }
}

import { Component, OnInit, OnDestroy, ViewChild, Output, EventEmitter, ElementRef } from '@angular/core';
import { ProductService } from 'src/app/services/product.service';
import { CameraService } from 'src/app/services/camera.service';
import { Subscription } from 'rxjs';
import { FeedbackService } from 'src/app/services/feedback.service';

// @ts-ignore
import Quagga from 'quagga';

@Component({
  selector: 'app-barcode-scanner',
  templateUrl: './barcode-scanner.component.html',
  styleUrls: ['./barcode-scanner.component.scss']
})
export class BarcodeScannerComponent implements OnInit, OnDestroy {
  // Referências aos elementos do DOM
  @ViewChild('interactive') targetElement!: ElementRef<HTMLElement>;
  @ViewChild('capturedCanvas') capturedCanvas!: ElementRef<HTMLCanvasElement>;
  @Output() informarPreco = new EventEmitter<string>();
  @Output() produtoEncontrado = new EventEmitter<string>();

  public get isProcessingOcr(): boolean {
    return this.cameraService.isProcessingOcr;
  }

  // public get isCameraAccessible(): boolean {
  //   return this.cameraService.isCameraAccessible;
  // }

  isCameraAccessible = true;

  preco: string[] = [];
  productName: string | null = null;
  productImageSrc: string | null = null;
  barcode: string = "";
  subs = new Subscription();

  constructor(
    private productService: ProductService,
    private feedbackService: FeedbackService,
    private cameraService: CameraService,
  ) {
    // this.subs = this.cameraService.barcode.subscribe((barcode) => {
    //   this.processBarcode(barcode);
    //   this.feedbackService.haptic();
    // });
  }

  ngOnInit(): void {
    this.cameraService.checkCameraAvailability().subscribe((cameraAvailable: boolean) => {
      if (cameraAvailable) {
        this.initializeQuagga(this.targetElement);  // Inicia o Quagga se a câmera estiver disponível
      } else {
        this.isCameraAccessible = false;
      }
    });
  }

  initializeQuagga(camera: ElementRef<HTMLElement>): void {
    Quagga.init({
      inputStream: {
        name: 'Live',
        type: 'LiveStream',
        target: camera,
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
      this.processBarcode(result.codeResult.code);
    });
  }


  finalizeQuagga(): void {
    if (this.isCameraAccessible) Quagga.stop();
    this.isCameraAccessible = false;
  }

  ngOnDestroy(): void {
    this.finalizeQuagga();
    this.subs.unsubscribe();
  }

  onBarcodeInput(event: EventTarget | null | string | undefined): void {
    this.productImageSrc = "";
    const barcodeTxt = event instanceof EventTarget ? (event as HTMLInputElement).value : event;
    this.processBarcode(`${barcodeTxt}`);
  }

  blur(event: string) {
    if (!event) {
      this.productImageSrc = "";
      this.produtoEncontrado.emit("");
    }
  }

  private processBarcode(barcode: string): void {
    if (barcode.length < 5) return;

    this.barcode = barcode;

    this.productService.fetchOpenFoodData(this.barcode).subscribe(openFoodData => {
      if (openFoodData) {
        this.productName = openFoodData.product_name || 'Nome não encontrado';
        this.productImageSrc = openFoodData.image_url || null;
        this.emitNome();
      } else {
        this.productService.fetchDigitEyesData(this.barcode).subscribe(digitEyesData => {
          if (digitEyesData) {
            this.productName = digitEyesData.title || 'Nome não encontrado';
            this.productImageSrc = digitEyesData.image || null;
            this.emitNome();
          } else {
            this.productName = 'Produto não encontrado';
            this.productImageSrc = null;
          }
        });
      }
    });
  }

  private emitNome() {
    if (this.productName &&
      this.productName != 'Nome não encontrado' &&
      this.productName != 'Produto não encontrado') {
      this.produtoEncontrado.emit(`${this.productName}`);
    }
  }

  async scan_preco(): Promise<void> {
    // this.preco = ['12.99','12.99','12.99','12.99','12.99', ]
    // return ;
    console.log('scaneando preço')
    if (this.cameraService.isProcessingOcr) {
      console.log('aguardando processamento anterior')
      return;
    }

    await this.getVideoElement()
      .then(async video => {
        const canvas = this.capturedCanvas?.nativeElement;

        await this.cameraService.scanWithAutoFocusAndProcessing(video, canvas)
          // await this.cameraService.scanProductName(video, canvas)
          .then((preco) => {
            this.preco = preco
            this.feedbackService.haptic();
          })
          .catch((erro) => {
            console.log(erro);
          });

      }).catch((erro) => {
        console.log(erro);
      });
  }

  private getVideoElement(retryCount: number = 5, delay: number = 200): Promise<HTMLVideoElement> {
    return new Promise((resolve, reject) => {

      console.log('tentando obter worker do elemento de video...')
      const video = this.targetElement.nativeElement.querySelector('video');

      if (video) {

        console.log('elemento de video encontrado...')
        resolve(video);
      } else if (retryCount === 0) {
        console.log('Não foi possível encontrar o elemento de vídeo...')
        reject('Não foi possível encontrar o elemento de vídeo.');
      } else {
        // Tentar novamente após um pequeno delay
        setTimeout(() => {
          console.log('nova tentativa...')
          this.getVideoElement(retryCount - 1, delay).then(resolve).catch(reject);
        }, delay);
      }
    });
  }

  selectedPrices: string[] = [];

  selectPreco(preco: string): void {
    const index = this.selectedPrices.indexOf(preco);
    if (index === -1) {
      this.selectedPrices.push(preco); // Adiciona o preço selecionado
    } else {
      this.selectedPrices.splice(index, 1); // Remove o preço selecionado
    }

    if (this.selectedPrices.length > 0) {
      this.preco = []; // Limpa os preços após a seleção
    }

    this.informarPreco.emit(preco);
  }
}
import { Component, OnInit, OnDestroy, ViewChild, Output, EventEmitter, ElementRef } from '@angular/core';
import { ProductService } from 'src/app/services/product.service';
import { Subject, Subscription } from 'rxjs';
import { FeedbackService } from 'src/app/services/feedback.service';
import { CameraService } from 'src/app/services/camera.service';


// @ts-ignore
import Quagga from 'quagga';

@Component({
  selector: 'app-barcode-scanner-add',
  templateUrl: './barcode-scanner-add.component.html',
  styleUrls: ['./barcode-scanner-add.component.scss']
})
export class BarcodeScannerAddComponent implements OnInit, OnDestroy {
  // Referências aos elementos do DOM
  @ViewChild('interactive') targetElement!: ElementRef<HTMLElement>;
  @ViewChild('capturedCanvas') capturedCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barcodeInput') barcodeInput!: ElementRef<HTMLInputElement>;
  @Output() informarPreco = new EventEmitter<string>();
  @Output() produtoEncontrado = new EventEmitter<string>();

  public get isProcessingOcr(): boolean {
    return this.cameraService.isProcessingOcr;
  }

  isCameraAccessible = true;
  preco: string[] = [];
  selectedPrices: string[] = [];
  productName: string | null = null;
  productImageSrc: string | null = null;
  barcode: string = "";
  subs = new Subscription();

  constructor(
    private productService: ProductService,
    private feedbackService: FeedbackService,
    private cameraService: CameraService,
  ) {
    this.subs = this.barcode$.subscribe((barcode) => {
      this.processBarcode(barcode);
      this.feedbackService.haptic();
    });
  }

  ngOnInit(): void {
    this.cameraService.checkCameraAvailability().subscribe((cameraAvailable: boolean) => {
      const storedCameraValue = localStorage.getItem('cameraEnabled');
      this.isCameraAccessible = storedCameraValue ? JSON.parse(storedCameraValue) : false;

      if (cameraAvailable) {
        this.initializeQuagga(this.targetElement);
      }
    });
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

  async processPreco(): Promise<void> {
    // this.preco = ['12.99','12.99','12.99','12.99','12.99', ]
    // return ;
    console.debug('scaneando preço')
    if (this.cameraService.isProcessingOcr) {
      console.debug('aguardando processamento anterior')
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
            console.error(erro);
          });

      }).catch((erro) => {
        console.error(erro);
      });
  }

  private getVideoElement(retryCount: number = 5, delay: number = 200): Promise<HTMLVideoElement> {
    return new Promise((resolve, reject) => {

      console.debug('tentando obter worker do elemento de video...')
      const video = this.targetElement.nativeElement.querySelector('video');

      if (video) {

        console.debug('elemento de video encontrado...')
        resolve(video);
      } else if (retryCount === 0) {
        console.error('Não foi possível encontrar o elemento de vídeo...')
        reject('Não foi possível encontrar o elemento de vídeo.');
      } else {
        // Tentar novamente após um pequeno delay
        setTimeout(() => {
          console.debug('nova tentativa...')
          this.getVideoElement(retryCount - 1, delay).then(resolve).catch(reject);
        }, delay);
      }
    });
  }

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

  //


  private barcodeDetected = new Subject<string>();
  public barcode$ = this.barcodeDetected.asObservable();

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
        localStorage.setItem('cameraEnabled', JSON.stringify(this.isCameraAccessible));
        console.error('Erro ao inicializar Quagga:', err);
        return;
      }

      this.isCameraAccessible = true;
      localStorage.setItem('cameraEnabled', JSON.stringify(this.isCameraAccessible));
      Quagga.start();
    });

    Quagga.onDetected((result: { codeResult: { code: string } }) => {
      this.barcodeDetected.next(result.codeResult.code);
    });
  }

  finalizeQuagga(): void {
    if (this.isCameraAccessible) Quagga.stop();
  }

  limparImage() {
    this.barcode = this.productImageSrc = '';
    if (this.barcodeInput) {
      this.barcodeInput.nativeElement.value = '';
    }
  }
}

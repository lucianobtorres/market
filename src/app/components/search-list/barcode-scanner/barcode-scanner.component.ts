import { Component, OnInit, OnDestroy, ViewChild, Output, EventEmitter, ElementRef } from '@angular/core';
import { ProductService } from 'src/app/services/product.service';
import { CameraService } from 'src/app/services/camera.service';
import { Subscription } from 'rxjs';
import { FeedbackService } from 'src/app/services/feedback.service';

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

  public get isProcessingOcr() {
    return this.cameraService.isProcessingOcr;
  }

  public get isCameraAccessible() {
    return this.cameraService.isCameraAccessible;
  }

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
    this.subs = this.cameraService.barcode.subscribe((barcode) => {
      this.processBarcode(barcode);
      this.feedbackService.haptic();
    });
  }

  ngOnInit(): void {
    this.cameraService.checkCameraAvailability().subscribe((cameraAvailable: boolean) => {
      if (cameraAvailable) {
        this.cameraService.initializeQuagga(this.targetElement);  // Inicia o Quagga se a câmera estiver disponível
      }
    });
  }

  ngOnDestroy(): void {
    this.cameraService.finalizeQuagga();
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

import { Component, OnInit, OnDestroy, ViewChild, Output, EventEmitter, ElementRef } from '@angular/core';
import { ProductService } from 'src/app/services/product.service';

// @ts-ignore
import Quagga from 'quagga';
import { from, Observable } from 'rxjs';
import { createWorker } from 'tesseract.js';

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

  isProcessingOcr = false;
  isCameraAccessible = true;
  preco: string[] = [];
  productName: string | null = null;
  productImageSrc: string | null = null;
  barcode: string = "";

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.checkCameraAvailability().subscribe((cameraAvailable: boolean) => {
      if (cameraAvailable) {
        this.initializeQuagga();  // Inicia o Quagga se a câmera estiver disponível
      } else {
        this.isCameraAccessible = false;  // Alterna para o input manual se a câmera não estiver disponível
      }
    });
  }

  ngOnDestroy(): void {
    if (this.isCameraAccessible) Quagga.stop();
  }

  private checkCameraAvailability(): Observable<boolean> {
    return from(
      navigator.mediaDevices.enumerateDevices().then(devices => {
        const videoInputDevices = devices.filter(device => device.kind === 'videoinput');
        return videoInputDevices.length > 0;
      })
    );
  }

  initializeQuagga(): void {
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
    this.preco = ['1,25', '2,99']
    return;
    console.log('scaneando preço')
    if (this.isProcessingOcr) {

      console.log('aguardando processamento anterior')
      return;
    }

    this.isProcessingOcr = true;
    console.log('processando...')

    await this.getVideoElement()
      .then(async video => {
        console.log('processando video...', video);
        const canvas = this.capturedCanvas?.nativeElement;

        if (video && canvas) {
          console.log('video && canvas encontrado...');

          // Ajustar dimensões do canvas
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            console.log('desenhando a imagem no canvas...');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Processa o frame com OCR
            const worker = await createWorker({
              logger: m => console.log(m),
            });

            console.log('carregando worker para leitura...');
            await worker.load();
            await worker.loadLanguage('por');
            await worker.initialize('por');

            // Realiza o reconhecimento de texto
            const { data: { text } } = await worker.recognize(canvas);
            console.log('imagem reconhecida...');

            // Melhora o texto extraído
            const cleanedText = this.cleanExtractedText(text);
            this.extractPriceFromText(cleanedText);

            console.log('finalizando worker...');
            await worker.terminate();
            this.isProcessingOcr = false;

          }
        } else {
          this.isProcessingOcr = false;
        }
      }).catch((erro) => {
        console.log(erro);
        this.isProcessingOcr = false;
      });

      this.isProcessingOcr = false;
  }

  private getVideoElement(retryCount: number = 5, delay: number = 200): Promise<HTMLVideoElement> {
    return new Promise((resolve, reject) => {

      console.log('tentando obter worker do elemento de video...')
      const video = this.targetElement.nativeElement.querySelector('video');

      if (video) {

        console.log('elemento de video encontrado...')
        resolve(video);
      } else if (retryCount === 0) {
        this.isProcessingOcr = false;
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

  // Função para limpar o texto reconhecido
  private cleanExtractedText(text: string): string {
    // Remove caracteres especiais e múltiplos espaços
    return text.replace(/[^0-9R$\s.,]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private extractPriceFromText(text: string): void {
    console.log('extraindo preço...', text);

    // Regex para capturar todos os preços
    const priceMatches = text.match(/R?\$\s?\d+,\d{2}|(?<!R\$)\d+,\d{2}/g);

    if (priceMatches && priceMatches.length > 0) {
      const uniquePrices = Array.from(new Set(priceMatches.map(price => price.trim())));
      console.log('Preços encontrados:', uniquePrices);
      this.preco = uniquePrices; // Armazena como array de preços
    } else {
      console.log('preço não encontrado');
    }
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

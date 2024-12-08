import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NfeService } from '../../services/nfe.service';
import { BrowserQRCodeReader, IScannerControls } from '@zxing/browser';


@Component({
  selector: 'app-qr-code-reader',
  templateUrl: './qr-code-reader.component.html',
  styleUrls: ['./qr-code-reader.component.scss'],
})
export class QrCodeReaderComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  qrCodeReader: BrowserQRCodeReader = new BrowserQRCodeReader();
  scannerControls: IScannerControls | null = null;
  videoInputDevices: MediaDeviceInfo[] = [];
  currentDeviceId: string | null = null;
  errorMessage: string | null = null;
  errorMessage2: string | null = null;

  currentZoom: number = 2; // Zoom inicial

  xmlData: string = '';
  productList: any[] = [];

  constructor(private nfeService: NfeService) { }

  // async ngOnInit(): Promise<void> {
  ngOnInit(): void {
    // await this.getVideoDevices();
    this.startScanner();
  }

  ngOnDestroy(): void {
    // Limpa o scanner ao sair
    this.stopScanner();
  }

  async getVideoDevices(): Promise<void> {
    try {
      this.videoInputDevices = await BrowserQRCodeReader.listVideoInputDevices();
      if (this.videoInputDevices.length > 0) {
        this.currentDeviceId = this.videoInputDevices[0].deviceId; // Começa com a primeira câmera disponível
        this.startScanner();
      } else {
        this.errorMessage = 'No video input devices found';
      }
    } catch (error: any) {
      console.error('Error listing video devices:', error);
      this.errorMessage = 'Failed to list video devices';
    }
  }

  async startScanner(): Promise<void> {
    try {
      // if (this.currentDeviceId === null) return;
      const videoConstraints = {
        video: {
          facingMode: 'environment',
          zoom: this.currentZoom // Define o zoom inicial
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(videoConstraints);
      this.videoElement.nativeElement.srcObject = stream;

      this.scannerControls = await this.qrCodeReader.decodeFromVideoDevice(
        undefined,
        this.videoElement.nativeElement,
        async (result, error) => {
          if (result) {
            const qrCodeUrl = result.getText();
            this.errorMessage = 'QR Code detected:' + result.getText();
            // const qrCodeUrl = await this.nfeService.decodeQrCode(this.videoElement.nativeElement);
            this.stopScanner(); // Para o scanner após detectar o QR Code

            window.open(qrCodeUrl, "_blank")
            var iframe = document.createElement('iframe');
            iframe.src = qrCodeUrl;
            document.body.appendChild(iframe);

            iframe.onload = function () {
              var contentDoc = iframe.contentDocument || iframe.contentWindow?.document;
              console.log(contentDoc?.documentElement.outerHTML);
            };

            // this.nfeService.getNfeXml(qrCodeUrl).subscribe({
            //   next: (xml) => {
            //     this.errorMessage = xml;
            //     this.xmlData = xml;
            //     this.productList = this.nfeService.parseNfeXml(xml);
            //   },
            //   error: (err) => this.errorMessage = 'Erro ao buscar XML:' + JSON.stringify(err),
            // });
          }
          if (error) {
            this.errorMessage = 'Decode error:' + error;
          }
        }
      );
    } catch (error: any) {
      // console.error('Error starting scanner:', error);
      this.errorMessage = error.message || 'Failed to start scanner';
    }
  }


  stopScanner(): void {
    if (this.scannerControls) {
      this.scannerControls.stop();
      this.scannerControls = null;
    }
  }

  changeZoom(level: number): void {
    this.currentZoom = level;
    this.startScanner(); // Reinicia o scanner com o novo zoom
  }

  switchCamera(): void {
    const currentIndex = this.videoInputDevices.findIndex(device => device.deviceId === this.currentDeviceId);
    const nextIndex = (currentIndex + 1) % this.videoInputDevices.length; // Alterna para o próximo dispositivo
    this.currentDeviceId = this.videoInputDevices[nextIndex].deviceId;
    this.startScanner();
  }

}

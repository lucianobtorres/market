import { Component, OnInit } from '@angular/core';

// @ts-ignore
import Quagga from 'quagga';

@Component({
  selector: 'app-barcode-scanner',
  templateUrl: './barcode-scanner.component.html',
  styleUrls: ['./barcode-scanner.component.scss']
})
export class BarcodeScannerComponent implements OnInit {

  ngOnInit(): void {
    this.initializeQuagga();
  }

  ngOnDestroy(): void {
    Quagga.stop();
  }

  initializeQuagga(): void {
    const targetElement = document.querySelector('#interactive') as HTMLElement;

    if (!targetElement) {
      console.error('Elemento de vídeo não encontrado');
      return;
    }

    Quagga.init({
      inputStream: {
        name: 'Live',
        type: 'LiveStream',
        target: targetElement,
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
        console.error('Erro ao inicializar Quagga:', err);
        const barcodeResultElement = document.getElementById('barcode-result');
        if (barcodeResultElement) {
          barcodeResultElement.innerText = 'Erro ao inicializar a câmera.';
        }
        return;
      }

      Quagga.start();

      // Estiliza o vídeo gerado pelo Quagga
      const videoElement = document.querySelector('#interactive video') as HTMLVideoElement;
      if (videoElement) {
        videoElement.style.position = 'absolute';
        videoElement.style.top = '50%';
        videoElement.style.left = '50%';
        videoElement.style.width = 'auto';
        videoElement.style.height = '100%';
        videoElement.style.transform = 'translate(-50%, -50%)';
      }
    });

    // Quando o código de barras for detectado
    Quagga.onDetected(this.onBarcodeDetected.bind(this));
  }

  async onBarcodeDetected(result: { codeResult: { code: string } }): Promise<void> {
    const barcode = result.codeResult.code;
    const barcodeResultElement = document.getElementById('barcode-result');
    const productImage = document.getElementById('product-image') as HTMLImageElement;
    const productInfo = document.getElementById('product-info');

    if (barcodeResultElement) {
      barcodeResultElement.innerText = `Cód. Barras: ${barcode}`;
    }

    const openFoodData = await this.fetchOpenFoodData(barcode);
    if (openFoodData && productInfo && productImage) {
      const productName = openFoodData.product_name || 'Nome não encontrado';
      const productImageSrc = openFoodData.image_url || '';

      productInfo.innerText = `Produto: ${productName}`;
      productImage.src = productImageSrc;
      productImage.style.display = productImageSrc ? 'block' : 'none';
    } else {
      const digitEyesData = await this.fetchDigitEyesData(barcode);
      if (digitEyesData && productInfo && productImage) {
        const productName = digitEyesData.title || 'Nome não encontrado';
        const productImageSrc = digitEyesData.image || '';

        productInfo.innerText = `Produto: ${productName}`;
        productImage.src = productImageSrc;
        productImage.style.display = productImageSrc ? 'block' : 'none';
      } else {
        if (productInfo) {
          productInfo.innerText = 'Produto não encontrado.';
        }
        if (productImage) {
          productImage.style.display = 'none';
        }
      }
    }
  }

  async fetchOpenFoodData(barcode: string): Promise<any> {
    const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 1) {
      return data.product;
    } else {
      return null;
    }
  }

  async fetchDigitEyesData(barcode: string): Promise<{ title: string, description: string, image: string } | null> {
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const url = `${proxyUrl}https://www.digit-eyes.com/upcCode/${barcode}.html?l=pt`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const title = doc.querySelector('h5')?.innerText || 'Título não encontrado';
      const description = doc.querySelector('h2')?.innerText || 'Descrição não encontrada';
      const image = doc.querySelector('img')?.src || '';

      return { title, description, image };
    } catch (error) {
      console.error('Erro ao buscar no Digit-Eyes:', error);
      return null;
    }
  }
}

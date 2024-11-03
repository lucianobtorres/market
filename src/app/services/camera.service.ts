import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { createWorker } from 'tesseract.js';

@Injectable({
  providedIn: 'root',
})
export class CameraService {
  private barcode$ = new BehaviorSubject<string>('');
  get barcode(): Observable<string> {
    return this.barcode$.asObservable();
  }

  isProcessingOcr = false;
  productName: string | null = null;

  public checkCameraAvailability(): Observable<boolean> {
    return from(
      navigator.mediaDevices.enumerateDevices().then(devices => {
        const videoInputDevices = devices.filter(device => device.kind === 'videoinput');
        return videoInputDevices.length > 0;
      })
    );
  }

  // Função para limpar o texto reconhecido
  private cleanExtractedText(text: string): string {
    // Remove caracteres especiais e múltiplos espaços
    return text.replace(/[^0-9R$\s.,]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private extractPriceFromText(text: string): string[] {
    console.info('extraindo preço...', text);

    // Regex para capturar todos os preços
    const priceMatches = text.match(/R?\$\s?\d+,\d{2}|(?<!R\$)\d+,\d{2}/g);

    if (priceMatches && priceMatches.length > 0) {
      const uniquePrices = Array.from(new Set(priceMatches.map(price => price.trim())));
      console.info('Preços encontrados:', uniquePrices);
      return uniquePrices;
    }

    console.error('preço não encontrado');
    return [];
  }

  async scan_preco(
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement): Promise<string[]> {
    return new Promise(async (resolve, reject) => {
      if (this.isProcessingOcr) {
        reject('aguardando processamento anterior');
      }

      if (!video || !canvas) {
        reject('video ou canvas não encontrados');
      }

      this.isProcessingOcr = true;
      console.info('processando video...', video);

      // Ajustar dimensões do canvas
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        console.info('desenhando a imagem no canvas...');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Processa o frame com OCR
        const worker = await createWorker({
          logger: m => console.info(m),
        });

        console.info('carregando worker para leitura...');
        await worker.load();
        await worker.loadLanguage('por');
        await worker.initialize('por');

        // Realiza o reconhecimento de texto
        const { data: { text } } = await worker.recognize(canvas);
        console.info('imagem reconhecida...');

        // Melhora o texto extraído
        const cleanedText = this.cleanExtractedText(text);
        const preco = this.extractPriceFromText(cleanedText);

        console.info('finalizando worker...');
        await worker.terminate();

        this.isProcessingOcr = false;
        resolve(preco);
      }
    })
  }

  async scanWithAutoFocusAndProcessing(
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement): Promise<string[]> {
    return new Promise(async (resolve, reject) => {
      if (this.isProcessingOcr) {
        reject('aguardando processamento anterior');
      }

      // Temporizador para dar estabilidade
      await new Promise(resolve => setTimeout(resolve, 500));

      if (!video || !canvas) {
        reject('video ou canvas não encontrados');
      }

      this.isProcessingOcr = true;
      console.info('processando video...', video);

      const cropWidth = video.videoWidth * 0.5;
      const cropHeight = video.videoHeight * 0.5;
      const offsetX = (video.videoWidth - cropWidth) / 2;
      const offsetY = (video.videoHeight - cropHeight) / 2;

      canvas.width = cropWidth;
      canvas.height = cropHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        console.info('desenhando a imagem no canvas...');
        ctx.filter = 'contrast(1.5) brightness(1.2)'; // Filtro de contraste e brilho
        ctx.drawImage(video, offsetX, offsetY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

        // Processa o frame com OCR
        const worker = await createWorker({
          logger: m => console.info(m),
        });

        console.info('carregando worker para leitura...');
        await worker.load();
        await worker.loadLanguage('por');
        await worker.initialize('por');

        // Realiza o reconhecimento de texto
        const { data: { text } } = await worker.recognize(canvas);
        console.info('imagem reconhecida...');

        // Melhora o texto extraído
        const cleanedText = this.cleanExtractedText(text);
        const preco = this.extractPriceFromText(cleanedText);

        console.info('finalizando worker...');
        await worker.terminate();

        this.isProcessingOcr = false;
        resolve(preco);
      }
    })
  }

  async scanProductName(
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement): Promise<string> {
    return new Promise(async (resolve, reject) => {
      if (this.isProcessingOcr) {
        reject('aguardando processamento anterior');
      }

      // Temporizador para dar estabilidade
      await new Promise(resolve => setTimeout(resolve, 500));

      if (!video || !canvas) {
        reject('video ou canvas não encontrados');
      }

      this.isProcessingOcr = true;
      console.info('processando video...', video);

      const cropWidth = video.videoWidth * 0.5;
      const cropHeight = video.videoHeight * 0.5;
      const offsetX = (video.videoWidth - cropWidth) / 2;
      const offsetY = (video.videoHeight - cropHeight) / 2;

      canvas.width = cropWidth;
      canvas.height = cropHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        console.info('desenhando a imagem no canvas...');
        ctx.filter = 'contrast(1.5) brightness(1.2)'; // Filtro de contraste e brilho
        ctx.drawImage(video, offsetX, offsetY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

        // Processa o frame com OCR
        const worker = await createWorker({
          logger: m => console.info(m),
        });

        console.info('carregando worker para leitura...');
        await worker.load();
        await worker.loadLanguage('por');
        await worker.initialize('por');

        // Realiza o reconhecimento de texto
        const { data: { text } } = await worker.recognize(canvas);
        console.info('imagem reconhecida...');

        const productName = this.extractProductNameFromText(text);

        console.info('finalizando worker...');
        await worker.terminate();

        this.isProcessingOcr = false;
        resolve(productName);
      }
    })
  }

  private extractProductNameFromText(text: string): string {
    // Remover caracteres especiais que não são relevantes
    const sanitizedText = text.replace(/[^\w\s]/g, '').split(/\s+/);

    // Lista de palavras comuns a serem ignoradas
    const commonWords = ["por", "kg", "un", "g", "und", "de", "a", "o", "e", "um", "uma"];

    // Filtrar apenas palavras que têm tamanho médio, ignorando comuns
    const potentialNames = sanitizedText.filter(word =>
      word.length > 2 && word.length < 15 && !commonWords.includes(word.toLowerCase())
    );

    // Pega a sequência de palavras mais longa, presumindo que seja o nome do produto
    return potentialNames.slice(0, 3).join(" ") || "Nome não encontrado";
  }
}

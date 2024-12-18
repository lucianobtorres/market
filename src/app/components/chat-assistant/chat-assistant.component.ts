import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, OnInit, Optional, Output, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AgentService } from 'src/app/services/agente/agente.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export interface ChatMessage {
  text: string;
  type: 'user' | 'assistant';
}

@Component({
  selector: 'app-chat-assistant',
  templateUrl: './chat-assistant.component.html',
  styleUrls: ['./chat-assistant.component.scss']
})
export class ChatAssistantComponent implements OnInit, AfterViewInit {
  @Output() closeEmit = new EventEmitter<void>();
  messages: ChatMessage[] = [];
  userInput: string = '';
  @ViewChild('container', { static: true }) chatContainer!: ElementRef;
  messageSafe!: SafeHtml;

  constructor(
    private agente: AgentService,
    private sanitizer: DomSanitizer,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { contextMessage: string },
  ) { }

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  ngOnInit(): void {
    const savedMessages = localStorage.getItem('chatHistory');
    this.messages = savedMessages ? JSON.parse(savedMessages) : [];
    if (this.data && this.data.contextMessage.length) this.messages.push({ text: this.data.contextMessage, type: 'assistant' });
  }

  async sendMessage(): Promise<void> {
    if (!this.userInput.trim()) return;

    // Adicionar mensagem do usuário
    this.messages.push({ text: this.userInput, type: 'user' });

    // Simular uma resposta inicial do assistente
    const response = await this.agente.getAssistantResponse(this.userInput);
    this.messages.push({ text: response, type: 'assistant' });

    // Salvar no localStorage
    localStorage.setItem('chatHistory', JSON.stringify(this.messages));

    // Limpar o input
    this.userInput = '';
    setTimeout(() => {
      this.scrollToBottom();
    });
  }

  getSafeMessage(message: string) {
    if (!message.length) return message;
    else return this.sanitizer.bypassSecurityTrustHtml(message);
  }

  private scrollToBottom() {
    // this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    //   this.chatContainer.nativeElement.scrollTo({
    //     top: this.chatContainer.nativeElement.scrollHeight,
    //     behavior: 'smooth',
    // });
    const element = this.chatContainer.nativeElement;
    const start = element.scrollTop;
    const end = element.scrollHeight;
    const duration = 500; // Duração em ms
    const startTime = performance.now();
    function step(currentTime: number): void {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      element.scrollTop = start + (end - start) * progress;

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);

  }
}

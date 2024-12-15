import { Component, ElementRef, EventEmitter, Inject, Input, OnInit, Optional, Output, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ChatAssistantModalDialogComponent } from './chat-assistant-modal-dialog/chat-assistant-modal-dialog.component';
import { NlpService } from 'src/app/services/agente/nlp.service';
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
export class ChatAssistantComponent implements OnInit {
  @Output() closeEmit = new EventEmitter<void>();
  messages: ChatMessage[] = [];
  userInput: string = '';
  @ViewChild('messageInner', { static: true }) messageInner!: ElementRef;
  messageSafe!: SafeHtml;

  constructor(
    private dialog: MatDialog,
    private nlp: NlpService,
    private agente: AgentService,
    // private sanitizer: DomSanitizer,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { contextMessage: string },
  ) { }

  ngOnInit(): void {
    const savedMessages = localStorage.getItem('chatHistory');
    this.messages = savedMessages ? JSON.parse(savedMessages) : [];
    if (this.data && this.data.contextMessage.length) this.messages.push({ text: this.data.contextMessage, type: 'assistant' });

    // let msgs = '';
    // this.messages.forEach(element => {
    //   msgs += element.text;
    // });

    // if (msgs.length) this.messageSafe = this.sanitizer.bypassSecurityTrustHtml(msgs);
  }

  async sendMessage(): Promise<void> {
    if (!this.userInput.trim()) return;

    // Adicionar mensagem do usuário
    this.messages.push({ text: this.userInput, type: 'user' });

    // Simular uma resposta inicial do assistente
    const response = await this.getAssistantResponse(this.userInput);
    this.messages.push({ text: response, type: 'assistant' });

    // Salvar no localStorage
    localStorage.setItem('chatHistory', JSON.stringify(this.messages));

    // Limpar o input
    this.userInput = '';
    scrollToBottom();
  }

  async getAssistantResponse(input: string): Promise<string> {
    const suggestions = await this.nlp.processInput(input);
    return suggestions.map((s) => s.text).join(' | ');
  }
}

// Função para rolar para baixo
function scrollToBottom() {
  // chatContainer.scrollTop = chatContainer.scrollHeight;
}

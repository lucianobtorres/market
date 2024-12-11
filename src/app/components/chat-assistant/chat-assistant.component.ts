import { Component, EventEmitter, Inject, Input, OnInit, Optional, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ChatAssistantModalDialogComponent } from './chat-assistant-modal-dialog/chat-assistant-modal-dialog.component';

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

  constructor(
    private dialog: MatDialog,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { contextMessage: string },
  ) { }

  ngOnInit(): void {
    const savedMessages = localStorage.getItem('chatHistory');
    this.messages = savedMessages ? JSON.parse(savedMessages) : [];
    if (this.data && this.data.contextMessage.length) this.messages.push({ text: this.data.contextMessage, type: 'assistant' });
  }

  sendMessage(): void {
    if (!this.userInput.trim()) return;

    // Adicionar mensagem do usuário
    this.messages.push({ text: this.userInput, type: 'user' });

    // Simular uma resposta inicial do assistente
    const response = this.getAssistantResponse(this.userInput);
    this.messages.push({ text: response, type: 'assistant' });

    // Salvar no localStorage
    localStorage.setItem('chatHistory', JSON.stringify(this.messages));

    // Limpar o input
    this.userInput = '';
  }

  getAssistantResponse(input: string): string {
    // Respostas fixas por enquanto
    const responses: { [key: string]: string } = {
      'o que está faltando': 'Estou verificando os itens de reposição...',
      'o que tenho na dispensa': 'Aqui estão os itens da sua dispensa...',
      'ajuda': 'Posso te ajudar com: listar itens, gerenciar a dispensa ou gerar uma lista de compras.',
    };

    // Buscar a resposta com base no input (case insensitive)
    const normalizedInput = input.toLowerCase();
    for (const key of Object.keys(responses)) {
      if (normalizedInput.includes(key)) {
        return responses[key];
      }
    }

    return 'Desculpe, não entendi sua pergunta. Tente perguntar algo sobre sua lista ou dispensa.';
  }
}

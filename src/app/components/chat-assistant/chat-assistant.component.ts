import { Component, EventEmitter, Inject, Input, OnInit, Optional, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ChatAssistantModalDialogComponent } from './chat-assistant-modal-dialog/chat-assistant-modal-dialog.component';
import { NlpService } from 'src/app/services/agente/nlp.service';
import { AgentService } from 'src/app/services/agente/agente.service';

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
    private nlp: NlpService,
    private agente: AgentService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { contextMessage: string },
  ) { }

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
    const response = await this.getAssistantResponse(this.userInput);
    this.messages.push({ text: response, type: 'assistant' });

    // Salvar no localStorage
    localStorage.setItem('chatHistory', JSON.stringify(this.messages));

    // Limpar o input
    this.userInput = '';
  }

  getAssistantResponse2(input: string): string {
    const normalizedInput = input.toLowerCase();

    let contextType: string | undefined;
    let context: any;

    // Respostas fixas por enquanto
    const responses: { [key: string]: string } = {
      'o que está faltando': 'Estou verificando os itens de reposição...',
      'o que tenho na dispensa': 'Aqui estão os itens da sua dispensa...',
      'ajuda': 'Posso te ajudar com: listar itens, gerenciar a dispensa ou gerar uma lista de compras.',
    };

    // Buscar a resposta com base no input (case insensitive)
    for (const key of Object.keys(responses)) {
      if (normalizedInput.includes(key)) {
        return responses[key];
      }
    }

    return 'Desculpe, não entendi sua pergunta. Tente perguntar algo sobre sua lista ou dispensa.';
  }

  async getAssistantResponse(input: string): Promise<string> {
    const suggestions = await this.nlp.processInput(input);
    return suggestions.map((s) => s.text).join(' | ');
  }

}

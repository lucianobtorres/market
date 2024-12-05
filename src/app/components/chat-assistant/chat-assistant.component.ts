import { Component, OnInit } from '@angular/core';

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
  messages: ChatMessage[] = [];
  userInput: string = '';

  ngOnInit(): void {
    // Carregar o histórico do localStorage
    const savedMessages = localStorage.getItem('chatHistory');
    this.messages = savedMessages ? JSON.parse(savedMessages) : [];
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

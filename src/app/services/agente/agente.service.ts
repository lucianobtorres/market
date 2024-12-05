import { Injectable } from "@angular/core";
import { PantrySuggestionStrategy } from "./pantry-suggestion-strategy";
import { HistorySuggestionStrategy } from "./history-suggestion-strategy";
import { QuickActionsSuggestionStrategy } from "./quick-actions-suggestion-strategy";
import { TipsSuggestionStrategy } from "./tips-suggestion-strategy";
import { ChatMessage } from "src/app/components/chat-assistant/chat-assistant.component";


@Injectable({
  providedIn: 'root',
})
export class AgentService {
  private strategies: SuggestionStrategy[] = [];
  messages: ChatMessage[] = [];

  interactions: Set<string> = new Set();

  constructor() {
    this.strategies = [
      new PantrySuggestionStrategy(),
      new HistorySuggestionStrategy(),
      new QuickActionsSuggestionStrategy(),
      new TipsSuggestionStrategy(),
    ];

    const savedMessages = localStorage.getItem('chatHistory');
    this.messages = savedMessages ? JSON.parse(savedMessages) : [];

    this.messages.forEach(async item => {
      if (item.type === "assistant") {
        const hash = await generateHash(item.text);
        this.interactions.add(hash)
      }
    });
  }

  generateSuggestions(context: any): Suggestion[] {
    const suggestions: Suggestion[] = [];

    this.strategies.forEach((strategy) => {
      suggestions.push(...strategy.generate(context));
    });

    const dynamicLimit = this.calculateDynamicLimit(context);
    return suggestions.slice(0, dynamicLimit); // Retorna somente até o limite calculado
  }
  private calculateDynamicLimit(context: any): number {
    let limit = 3; // Limite base
    if (context.pantryCriticalItems?.length > 5) limit += 2;
    if (context.listEmpty) limit += 1;
    if (context.recentPurchases?.length > 3) limit += 1;
    return Math.min(limit, 6);
  }

  // Verifica se uma interação já foi registrada
  async hasInteracted(key: ChatMessage): Promise<boolean> {
    const hash = await generateHash(key.text);
    const result= this.interactions.has(hash);
    return result;
  }

  // Registra uma nova interação
  async recordInteraction(key: ChatMessage) {
    const hash = await generateHash(key.text);
    this.interactions.add(hash);
    this.messages.push(key);
    localStorage.setItem('chatHistory', JSON.stringify(this.messages));
  }
}

// Tipo de dados para sugestões
export interface Suggestion {
  text: string;
  linkText: string;
  action: () => void;
}

export interface SuggestionStrategy {
  generate(context: any): Suggestion[];
}
function generateHash(text: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Convertendo o texto para um ArrayBuffer
    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    // Gerando o hash com SHA-256
    crypto.subtle.digest('SHA-256', data)
      .then((hashBuffer) => {
        // Convertendo o ArrayBuffer para uma string hexadecimal
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
        resolve(hashHex);
      })
      .catch(reject);
  });
}

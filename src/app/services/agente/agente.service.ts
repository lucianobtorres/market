import { Injectable } from "@angular/core";
import { PantryContext, PantrySuggestionStrategy } from "./pantry-suggestion-strategy";
import { HistoryContext, HistorySuggestionStrategy } from "./history-suggestion-strategy";
import { ChatMessage } from "src/app/components/chat-assistant/chat-assistant.component";
import { ListContext, ListSuggestionStrategy } from "./list-suggestion-strategy";
import { NlpService } from "./nlp.service";


export const suggestionClass = 'suggestion-link';
export type ContextStrategy = Partial<HistoryContext & ListContext & PantryContext>;

@Injectable({
  providedIn: 'root',
})
export class AgentService {
  private strategies: SuggestionStrategy[] = [];
  messages: ChatMessage[] = [];

  interactions: Set<string> = new Set();

  constructor(
    private nlp: NlpService,
  ) {
    this.strategies = [
      new ListSuggestionStrategy(),
      new PantrySuggestionStrategy(),
      new HistorySuggestionStrategy(),
    ];

    nlp.registerStrategy(new PantrySuggestionStrategy());
    nlp.registerStrategy(new HistorySuggestionStrategy());
    nlp.registerStrategy(new ListSuggestionStrategy());

    const savedMessages = localStorage.getItem('chatHistory');
    this.messages = savedMessages ? JSON.parse(savedMessages) : [];

    this.messages.forEach(async item => {
      if (item.type === "assistant") {
        const hash = await generateHash(item.text);
        this.interactions.add(hash)
      }
    });
  }

  generateSuggestions(context: ContextStrategy): Suggestion[] {
    const suggestions: Suggestion[] = [];

    this.strategies.forEach((strategy) => {
      suggestions.push(...strategy.generate(context));
    });

    const dynamicLimit = this.calculateDynamicLimit(context);

    const shuffledSuggestions = suggestions.sort(() => Math.random() - 0.5);

    return shuffledSuggestions.slice(0, dynamicLimit);
  }

  getSuggestionsHtml(suggestions: Suggestion[]): string {
    return suggestions.map(suggestion => {
      const regex = new RegExp(`(${suggestion.linkText})`, 'gi');
      let replacedText = suggestion.text;

      // Verifica se o linkText está presente no texto
      if (!regex.test(suggestion.text)) {
        // Se não estiver, adiciona o link no final do texto
        replacedText += ` <span class="${suggestionClass}" (click)="handleAction('${suggestion.linkText}')">${suggestion.linkText}</span>`;
      } else {
        // Substitui o linkText pelo link correspondente
        replacedText = replacedText.replace(regex, `<span class="${suggestionClass}" (click)="handleAction('${suggestion.linkText}')">$1</span>`);
      }

      return `<p>${replacedText}</p>`;
    }).join('');
  }

  handleAction(linkText: string, suggestions: Suggestion[]): void {
    console.log('handleAction')
    // Encontre a ação correspondente e execute
    const suggestion = suggestions.find(s => s.linkText?.toLowerCase() === linkText.toLowerCase());
    if (suggestion && suggestion.action) {
      suggestion.action();
    }
  }

  private calculateDynamicLimit(context: ContextStrategy): number {
    let limit = 3;

    this.strategies.forEach((strategy) => {
      limit += strategy.calculateDynamicLimit(context);
    });

    return Math.min(limit, 6);
  }

  // Verifica se uma interação já foi registrada
  async hasInteracted(key: ChatMessage): Promise<boolean> {
    const hash = await generateHash(key.text);
    const result = this.interactions.has(hash);
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
  linkText?: string;
  action?: () => void;
}

export interface Intent {
  name: string,
  entities: string[],
  examples: string[]
}

export interface SuggestionStrategy {
  intents: Intent[];

  generate(context: any): Suggestion[];
  calculateDynamicLimit(context: ContextStrategy): number
  canHandle(intent: string): boolean;
  execute(intent: string, entities: { [key: string]: any }): Promise<Suggestion[]>;
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

import { Injectable } from "@angular/core";
import { PantrySuggestionStrategy } from "./strategies/pantry-suggestion-strategy";
import { HistorySuggestionStrategy } from "./strategies/history-suggestion-strategy";
import { ChatMessage } from "src/app/components/chat-assistant/chat-assistant.component";
import { ListSuggestionStrategy } from "./strategies/list-suggestion-strategy";
import { NlpService } from "./nlp.service";
import { ContextStrategy, Suggestion, SuggestionStrategy } from "./strategies/suggestion-strategy";


export const suggestionClass = 'suggestion-link';

@Injectable({
  providedIn: 'root',
})
export class AgentService {
  messages: ChatMessage[] = [];

  interactions: Set<string> = new Set();

  constructor(
    private nlp: NlpService,
  ) {
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

    this.nlp.strategies.forEach((strategy) => {
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

      if (!regex.test(suggestion.text)) {
        if (suggestion.linkText?.length) {
          replacedText += ` <span class="${suggestionClass}" (click)="handleAction('${suggestion.linkText}')">${suggestion.linkText}</span>`;
        }
      } else {
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

    this.nlp.strategies.forEach((strategy) => {
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

  async getAssistantResponse(input: string): Promise<string> {
    const suggestions = await this.nlp.processInput(input);
    return this.getSuggestionsHtml(suggestions);
  }
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

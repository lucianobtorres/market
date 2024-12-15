import { Injectable } from "@angular/core";
import { ContextStrategy, Intent, Suggestion, SuggestionStrategy } from "./agente.service";


@Injectable({
  providedIn: 'root',
})
export class NlpService {
  private strategies: SuggestionStrategy[] = [];
  private intents: Intent[] = [];

  registerStrategy(strategy: SuggestionStrategy): void {
    this.strategies.push(strategy);
    this.intents.push(...strategy.intents);
  }

  async processInput(input: string): Promise<Suggestion[]> {
    // Passo 1: Identificar intenção
    const { intent, entities } = this.detectIntentAndEntities(input);

    if (!intent) {
      return [{ text: 'Desculpe, não entendi sua pergunta.' }];
    }

    // Passo 2: Encontrar a estratégia correspondente
    const strategy = this.strategies.find((s) => s.canHandle(intent));
    if (!strategy) {
      return [{ text: 'Não sei como responder isso no momento.' }];
    }

    // Passo 3: Executar a estratégia
    return strategy.execute(intent, entities);
  }

  private detectIntentAndEntities(input: string): { intent: string; entities: { [key: string]: any } } {
    console.log('detectIntentAndEntities', this.intents)
    const normalizedInput = input.toLowerCase();

    for (const intent of this.intents) {
      for (const example of intent.examples) {
        const regex = new RegExp(`\\b${example}\\b`, 'i');
        if (regex.test(normalizedInput)) {
          const entities = this.extractEntities(normalizedInput, intent.entities);
          console.log(intent.name, entities)
          return { intent: intent.name, entities };
        }
      }

      // Verifica coringas e padrões mais flexíveis
      const genericRegex = new RegExp(`(\\b${intent.name.replace('_', '\\b')})|(${intent.name.replace('_', '|')})`, 'i');
      console.log('genericRegex', genericRegex)
      if (genericRegex.test(normalizedInput)) {
        const entities = this.extractEntities(normalizedInput, intent.entities);
        console.log(intent.name, entities)
        return { intent: intent.name, entities };
      }
    }

    return { intent: '', entities: {} };
  }

  private extractEntities(input: string, entityNames: string[]): { [key: string]: any } {
    const entities: { [key: string]: any } = {};
    for (const entityName of entityNames) {
      const regex = new RegExp(`\\b${entityName}\\b`, 'i');
      const match = regex.exec(input);
      if (match) {
        entities[entityName] = match[0];
      }
    }
    return entities;
  }

}

import { Injectable } from "@angular/core";
import { SuggestionStrategy, Intent, Suggestion } from "./strategies/suggestion-strategy";


@Injectable({
  providedIn: 'root',
})
export class NlpService {
  strategies: SuggestionStrategy[] = [];
  private intents: Intent[] = [];
  private conversationContext: {
    lastIntent?: string;
    lastEntities?: { [key: string]: any };
    lastExample?: string;
  } = {};

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
    return strategy.chatResponse(intent, entities, input);
  }

  private detectIntentAndEntities(input: string): { intent: string; entities: { [key: string]: any }, example: string } {
    const normalizedInput = input.toLowerCase();

    for (const intent of this.intents) {
      for (const example of intent.examples) {
        const regex = new RegExp(example.replace(/\$\{pseudo_quantity\}/g, "(\\d+)"), "i");
        const match = regex.exec(normalizedInput);

        if (match) {
          const entities: { [key: string]: any } = {};

          // Captura entidades do regex
          if (intent.entities && match.length > 1) {
            intent.entities.forEach((entity, index) => {
              entities[entity] = match[index + 1]; // Aqui já está extraído, como "arro" em vez de "arroz"
            });
          }

          // Atualiza o contexto
          this.conversationContext = { lastIntent: intent.name, lastEntities: entities, lastExample: example };
          return { intent: intent.name, entities, example };
        }
      }
    }

    // Se nenhuma intenção for encontrada, tenta usar o contexto
    if (this.conversationContext.lastIntent) {
      const previousEntities = this.conversationContext.lastEntities || {};
      const inferredEntities = this.inferEntitiesFromContext(normalizedInput, previousEntities);
      if (Object.keys(inferredEntities).length > 0) {
        return {
          intent: this.conversationContext.lastIntent,
          entities: inferredEntities,
          example: this.conversationContext.lastExample || ''
        };
      }
    }

    return { intent: '', entities: {}, example: '' }; // Caso nenhuma intenção seja encontrada
  }

  private inferEntitiesFromContext(input: string, previousEntities: { [key: string]: any }): { [key: string]: any } {
    const inferredEntities: { [key: string]: any } = {};

    // Busca palavras que podem corresponder a entidades anteriores
    for (const [key, value] of Object.entries(previousEntities)) {
      if (input.includes(value.slice(0, 3))) { // Exemplo: "arro" contém "arr"
        inferredEntities[key] = value;
      }
    }

    return inferredEntities;
  }
}

import { Injectable } from "@angular/core";
import { ContextStrategy, Intent, Suggestion, SuggestionStrategy } from "./agente.service";
import { db } from "src/app/db/model-db";
import { liveQuery } from "dexie";


@Injectable({
  providedIn: 'root',
})
export class NlpService {
  private strategies: SuggestionStrategy[] = [];
  private _itens: string[] = [];
  get itens() {
    return this._itens;
  }

  private intents: Intent[] = [];
  private conversationContext: {
    lastIntent?: string;
    lastEntities?: { [key: string]: any };
  } = {};

  constructor() {
    liveQuery(() => db.inventory.toArray()).subscribe(itens => {
      console.log(itens)
      this._itens = itens.map(x => x.name.toLowerCase());
    });
  }

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
    const normalizedInput = input.toLowerCase();

    for (const intent of this.intents) {
      for (const example of intent.examples) {
        const regex = new RegExp(example, "i");
        const match = regex.exec(normalizedInput);

        console.log(match)
        if (match) {
          const entities: { [key: string]: any } = {};

          // Captura entidades do regex
          if (intent.entities && match.length > 1) {
            console.log(intent.entities)
            intent.entities.forEach((entity, index) => {
              entities[entity] = match[index + 1]; // Aqui já está extraído, como "arro" em vez de "arroz"
            });
          }

          // Ajusta a entidade com fuzzy matching
          if (entities['itemName']) {
            const closestItem = this.getClosestItem(entities['itemName'], this.itens);
            console.log(this.itens, closestItem)
            entities['itemName'] = closestItem || entities['itemName']; // Substitui pelo match mais próximo
          }

          // Atualiza o contexto
          this.conversationContext = { lastIntent: intent.name, lastEntities: entities };
          return { intent: intent.name, entities };
        }
      }
    }

    // Se nenhuma intenção for encontrada, tenta usar o contexto
    if (this.conversationContext.lastIntent) {
      const previousEntities = this.conversationContext.lastEntities || {};
      const inferredEntities = this.inferEntitiesFromContext(normalizedInput, previousEntities);
      if (Object.keys(inferredEntities).length > 0) {
        return { intent: this.conversationContext.lastIntent, entities: inferredEntities };
      }
    }

    return { intent: '', entities: {} }; // Caso nenhuma intenção seja encontrada
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

  private getClosestItem(query: string, items: string[]): string | null {
    let bestMatch = null;
    let highestScore = 0;

    for (const item of items) {
      const similarity = this.calculateSimilarity(query, item);
      if (similarity > highestScore && similarity > 0.6) { // Ajuste o limite de similaridade
        highestScore = similarity;
        bestMatch = item;
      }
    }

    return bestMatch;
  }

  private calculateSimilarity(a: string, b: string): number {
    const distance = this.levenshteinDistance(a, b);
    return 1 - distance / Math.max(a.length, b.length);
  }

  private levenshteinDistance(a: string, b: string): number {
    const matrix = Array.from({ length: a.length + 1 }, (_, i) => Array(b.length + 1).fill(0));

    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
        );
      }
    }

    return matrix[a.length][b.length];
  }
}

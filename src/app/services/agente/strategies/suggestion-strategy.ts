import { HistoryContext } from "./history-suggestion-strategy";
import { ListContext } from "./list-suggestion-strategy";
import { PantryContext } from "./pantry-suggestion-strategy";

export type ContextStrategy = Partial<HistoryContext & ListContext & PantryContext>;

export const pseudo_entity = "(?:\\b(?:e|ou)\\s+)?([\\wÀ-ÿ]+(?:\\s+[\\wÀ-ÿ]+)*)";

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

export abstract class SuggestionStrategy {
  intents: Intent[] = [];

  abstract generate(context: any): Suggestion[];
  abstract calculateDynamicLimit(context: ContextStrategy): number
  abstract canHandle(intent: string): boolean;
  abstract chatResponse(intent: string, entities: { [key: string]: any }): Promise<Suggestion[]>;

  protected getClosestTherm(input: string, items: string[], threshold: number = 0.6): string[] {
    const normalizedItems = items.map(this.normalizeItemName);
    const matches: { item: string; similarity: number }[] = [];

    normalizedItems.forEach((item, index) => {
      const similarity = this.calculateSimilarity(input, item);
      if (similarity >= threshold) {
        matches.push({ item: items[index], similarity });
      }
    });

    // Ordena por maior similaridade
    matches.sort((a, b) => b.similarity - a.similarity);

    return matches.map(match => match.item);
  }

  private normalizeItemName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, ' ') // Remove espaços extras
      .trim(); // Mantém os conectores para nomes compostos
  }

  private  calculateSimilarity(a: string, b: string): number {
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

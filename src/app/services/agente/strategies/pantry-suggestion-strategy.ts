import { db } from "src/app/db/model-db";
import { Inventory, nameof } from "src/app/models/interfaces";
import { liveQuery } from "dexie";
import { pseudo_entity, Suggestion, SuggestionStrategy } from "./suggestion-strategy";

export class PantryContext {
  pantryEmpty: boolean = false;
  pantryCriticalItems: { name: string; }[] = [];
  averageConsumptionRate?: boolean;
  hasDuplicates?: boolean;
}

const intentOptions = [
  'check_pantry',
  'check_item',
  'add_items',
  'manage_duplicates',
  'seasonal_items',
  'adjust_dispense',
] as const;

type intentOption = (typeof intentOptions)[number];

export class PantrySuggestionStrategy extends SuggestionStrategy {
  private pantryCriticalItems: Inventory[] = [];
  private hasDuplicates: boolean = false;
  private averageConsumptionRate: number | null = null;
  private isPantryEmpty = false;

  private _itens: string[] = [];
  get itens() {
    return this._itens;
  }

  constructor() {
    super();

    this.initializeIntents();

    liveQuery(() => db.inventory.toArray()).subscribe(items => {
      this.updatePantryCriticalItems(items);
      this.updateHasDuplicates(items);
      this.updateAverageConsumptionRate(items);
      this.isPantryEmpty = items.length <= 0;
      this._itens = items.map(x => x.name.toLowerCase());
    });
  }

  private initializeIntents() {
    this.intents = [
      {
        name: "check_pantry",
        entities: [],
        examples: [
          "o que tem na dispensa",
          "preciso verificar a dispensa",
        ]
      },
      {
        name: "check_item",
        entities: ["itemName"],
        examples: [
          `tem ${pseudo_entity} na dispensa`,
          `tem ${pseudo_entity}`,
          `comprei ${pseudo_entity}`,
          `(?:e|ou) ${pseudo_entity}`
        ]
      }
    ];
  }

  canHandle(intent: intentOption): boolean {
    return intentOptions.includes(intent);
  }

  calculateDynamicLimit(context: PantryContext): number {
    let limit = 0;
    if (this.pantryCriticalItems?.length > 5) limit += 2;

    return limit;
  }

  generate(context: PantryContext): Suggestion[] {
    const suggestions: Suggestion[] = [];

    // Sugestões caso a dispensa esteja vazia
    if (this.isPantryEmpty) {
      suggestions.push(...this.suggestAddItems());
    }

    // Sugestões para itens críticos
    if (this.pantryCriticalItems.length > 0) {
      this.pantryCriticalItems.forEach(item => {
        suggestions.push({
          text: `O item ${item.name} está acabando.`,
          linkText: "Reabasteça agora.",
          action: () => console.log(`Ação: Reabastecer ${item.name}`),
        });
      });
    }

    // Sugestões baseadas no consumo médio
    if (this.averageConsumptionRate !== null) {
      suggestions.push({
        text: "Baseado no seu consumo, recomendamos reabastecer itens frequentes.",
        linkText: "Adicionar itens sugeridos",
        action: () => console.log("Ação: Adicionar itens sugeridos baseados no consumo médio"),
      });
    }

    // Sugestões para itens duplicados
    if (this.hasDuplicates) {
      suggestions.push(...this.suggestManageDuplicates());
    }

    return suggestions;
  }

  async chatResponse(intent: intentOption, entities: { [key: string]: any }): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];
    if (entities['itemName']) {
      const closestItems = this.getClosestTherm(entities['itemName'], this.itens);
      if (closestItems.length === 1) {
        entities['itemName'] = closestItems[0];
      } else if (closestItems.length > 1) {
        const itemOptions = closestItems.join(', '); // Ex.: "leite condensado, leite desnatado"
        entities['itemName'] = itemOptions || entities['itemName']; // Substitui pelo melhor match
      }
    }

    switch (intent) {
      case 'check_pantry':
        suggestions.push(await this.suggestPantryOverview());
        break;

      case 'check_item':
        if (entities['itemName']) {
          const itemName = entities['itemName'].toLowerCase();
          const itemSuggestion = await this.suggestItemStatus(itemName);
          suggestions.push(itemSuggestion);
        } else {
          suggestions.push({ text: "Por favor, forneça um nome de item para verificar." });
        }
        break;

      case 'add_items':
        suggestions.push(...this.suggestAddItems());
        break;

      case 'manage_duplicates':
        suggestions.push(...this.suggestManageDuplicates());
        break;

      case 'seasonal_items':
        suggestions.push(...this.suggestSeasonalItems());
        break;

      case 'adjust_dispense':
        suggestions.push(...this.suggestAdjustDispense());
        break;

      default:
        suggestions.push(...this.generate({} as PantryContext));
    }

    return suggestions;
  }

  private suggestPantryOverview(): Suggestion {
    return {
      text: `Você tem ${this.itens.length} itens na dispensa.`,
      linkText: "itens na dispensa",
      action: () => console.log(` ${this.itens.length}`),
    };
  }

  private async suggestItemStatus(itemName: string): Promise<Suggestion> {
    const item = await db.inventory
      .where(nameof<Inventory>('name'))
      .equalsIgnoreCase(itemName)
      .first();

    if (item) {
      const isCritical = item.currentQuantity <= (item.consumptionRate ?? 1) * 3;
      const text = isCritical
        ? `Você tem ${item.currentQuantity} unidades de ${item.name}, mas está acabando.`
        : `Você tem ${item.currentQuantity} unidades de ${item.name} na dispensa.`;
      return { text };
    } else {
      return { text: `Não encontrei ${itemName} na sua dispensa.` };
    }
  }

  private suggestAddItems(): Suggestion[] {
    return [{
      text: "Sua dispensa ainda está vazia. ",
      linkText: "Adicione itens à dispensa.",
      action: () => console.log("Ação: Abrir tela de adicionar itens na dispensa"),
    }];
  }

  private suggestManageDuplicates(): Suggestion[] {
    return [{
      text: "Existem itens duplicados na dispensa.",
      linkText: "Consolidar itens",
      action: () => console.log("Ação: Consolidar itens duplicados"),
    }];
  }

  private suggestSeasonalItems(): Suggestion[] {
    return [{
      text: "Identificamos que itens sazonais podem ser úteis. ",
      linkText: "Ver sugestões sazonais",
      action: () => console.log("Ação: Mostrar itens sazonais sugeridos"),
    }];
  }

  private suggestAdjustDispense(): Suggestion[] {
    return [{
      text: "Reveja os itens marcados como 'não repor' para ajustar sua dispensa.",
      linkText: "ajustar sua dispensa",
      action: () => console.log("Ação: Gerenciar itens 'não repor'"),
    }];
  }

  private updatePantryCriticalItems(items: Inventory[]): void {
    this.pantryCriticalItems = items.filter(item => item.currentQuantity <= (item.consumptionRate ?? 1) * 3);
  }

  private updateHasDuplicates(items: Inventory[]): void {
    const itemNames = new Set<string>();
    this.hasDuplicates = items.some(item => {
      if (itemNames.has(item.name.toLowerCase())) {
        return true;
      } else {
        itemNames.add(item.name.toLowerCase());
        return false;
      }
    });
  }

  private updateAverageConsumptionRate(items: Inventory[]): void {
    const totalConsumption = items.reduce((sum, item) => sum + (item.consumptionRate ?? 1), 0);
    const count = items.length;
    this.averageConsumptionRate = count > 0 ? totalConsumption / count : null;
  }
}

import { db } from "src/app/db/model-db";
import { Inventory } from "src/app/models/interfaces";
import { liveQuery } from "dexie";
import { pseudo_entity, pseudo_quantity, Suggestion, SuggestionStrategy } from "./suggestion-strategy";

export class PantryContext {
  pantryEmpty: boolean = false;
  pantryCriticalItems: { name: string; }[] = [];
  averageConsumptionRate?: boolean;
  hasDuplicates?: boolean;
}

const intentOptions = [
  // Intenções que terão respostas ou ações atualmente
  'check_pantry',
  'check_item',
  'add_items',
  'manage_duplicates',
  'adjust_dispense',
  'optimize_stock',

  // Intenções futuras com respostas explicativas
  'suggest_recipes',
  'track_expiration',
  'food_preferences',
  'promo_items',
  'seasonal_items',

] as const;

type intentOption = (typeof intentOptions)[number];

export class PantrySuggestionStrategy extends SuggestionStrategy {
  private pantryCriticalItems: Inventory[] = [];
  private hasDuplicates: boolean = false;
  private averageConsumptionRate: number | null = null;
  private isPantryEmpty = false;
  itens!: Inventory[];
  private _itensNames: string[] = [];
  get itensNames() {
    return this._itensNames;
  }

  constructor() {
    super();

    this.initializeIntents();

    liveQuery(() => db.inventory.toArray()).subscribe(items => {
      this.updatePantryCriticalItems(items);
      this.updateHasDuplicates(items);
      this.updateAverageConsumptionRate(items);
      this.isPantryEmpty = items.length <= 0;
      this._itensNames = items.map(x => x.name.trim().toLowerCase());
      this.itens = items;
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
          "qual é o status da dispensa",
          "como está meu estoque",
          "tem algo sobrando na dispensa"
        ]
      },
      {
        name: "check_item",
        entities: ["itemName"],
        examples: [
          `tem ${pseudo_entity} na dispensa`,
          `tem ${pseudo_entity}`,
          `comprei ${pseudo_entity}`,
          `(?:e|ou) ${pseudo_entity}`,
          `quantidade de ${pseudo_entity}`,
          `como está o estoque de ${pseudo_entity}`,
          `tem muito ${pseudo_entity} ou está acabando`
        ]
      },
      {
        name: "add_items",
        entities: ["itemName", "quantity"],
        examples: [
          `adicione ${pseudo_entity}`,
          `preciso colocar ${pseudo_entity}`,
          `coloque ${pseudo_entity} na dispensa`,
          `adicione ${pseudo_entity}, quantidade ${pseudo_quantity}`
        ]
      },
      {
        name: "manage_duplicates",
        entities: ["itemName"],
        examples: [
          `mescle itens duplicados`,
          `tem itens duplicados na lista`,
          `consolide itens semelhantes`,
          `verifique duplicidade de ${pseudo_entity}`,
          `há duplicados no estoque?`,
          `remova itens duplicados`,
          `unifique os itens de ${pseudo_entity}`
        ]
      },
      {
        name: "adjust_dispense",
        entities: ["itemName", "quantity"],
        examples: [
          `ajuste ${pseudo_entity} para ${pseudo_quantity}`,
          `atualize o estoque de ${pseudo_entity}`,
          `mude a quantidade de ${pseudo_entity}`,
          `corrija ${pseudo_entity} na dispensa`
        ]
      },
      {
        name: "seasonal_items",
        entities: [],
        examples: [
          "tem algo de temporada que posso usar",
          "sugira itens para o verão",
          "tem algo de época na dispensa",
          "quais são os itens sazonais disponíveis"
        ]
      },
      {
        name: "suggest_recipes",
        entities: [],
        examples: [
          "sugira receitas",
          "tem algo que posso cozinhar com o que tenho",
          "que receitas posso fazer com minha dispensa",
          "receitas disponíveis com meus itens"
        ]
      },
      {
        name: "track_expiration",
        entities: ["itemName"],
        examples: [
          `tem algo para vencer na dispensa`,
          `qual a validade de ${pseudo_entity}`,
          `tem algum produto vencendo em breve`,
          `verifique datas de validade`
        ]
      },
      {
        name: "optimize_stock",
        entities: [],
        examples: [
          "tem algo em excesso na dispensa",
          "o que estou acumulando na dispensa",
          "quais itens são raramente usados",
          "como posso otimizar meu estoque"
        ]
      },
      {
        name: "food_preferences",
        entities: ["preferenceType"],
        examples: [
          "ajuste minha dispensa para opções vegetarianas",
          "tenho intolerância à lactose, sugira alterações",
          "personalize minha dispensa com base nas preferências alimentares",
          "meus hábitos alimentares mudaram"
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
          text: `O item ${item.name.trim()} está acabando.`,
          linkText: "Reabasteça agora.",
          action: () => console.log(`Ação: Reabastecer ${item.name.trim()}`),
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

  private detectDuplicates(): { itemName: string; count: number }[] {
    const itemCounts = this.itens.reduce((acc, item) => {
      const key = item.name.trim().toLowerCase();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    return Object.entries(itemCounts)
      .filter(([_, count]) => count > 1)
      .map(([itemName, count]) => ({ itemName, count }));
  }

  private async handleAdjustDispense(itemName: string, quantity: number): Promise<Suggestion> {
    const item = this.itens
      .find(x => x.name.trim().toLowerCase() === itemName.trim().toLowerCase());

    if (item) {
      // Atualiza a quantidade no banco de dados
      await db.inventory.update(item.id!, { currentQuantity: quantity });

      return {
        text: `A quantidade de ${itemName} foi ajustada para ${quantity}.`,
        action: () => console.log(`Ação: Ajustado ${itemName} para ${quantity}`),
      };
    } else {
      return {
        text: `Não foi possível encontrar ${itemName} na sua dispensa. Deseja adicioná-lo?`,
        linkText: "Adicionar item",
        action: () => console.log("Ação: Adicionar novo item à dispensa"),
      };
    }
  }

  async chatResponse(intent: intentOption, entities: { [key: string]: any }, inputExample: string): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];

    if (entities['itemName']) {
      const closestItems = this.getClosestTherm(entities['itemName'], this.itensNames);
      if (closestItems.length === 1) {
        entities['itemName'] = closestItems[0];
      } else if (closestItems.length > 1) {
        const itemOptions = closestItems.join(', '); // Ex.: "leite condensado, leite desnatado"
        entities['itemName'] = itemOptions || entities['itemName']; // Substitui pelo melhor match
      }
    }

    switch (intent) {
      case 'check_pantry':
        suggestions.push(await this.suggestPantryOverview(inputExample));
        break;

      case 'check_item':
        if (entities['itemName']) {
          const itemName = entities['itemName'].toLowerCase();
          const itemSuggestion = this.suggestItemStatus(itemName);
          suggestions.push(itemSuggestion);
        } else {
          suggestions.push({ text: "Por favor, forneça um nome de item para verificar." });
        }
        break;

      case 'add_items':
        let suggestion = {
          text: "Sua dispensa ainda está vazia. ",
          linkText: "Adicione itens à dispensa.",
          action: () => console.log("Ação: Abrir tela de adicionar itens na dispensa"),
        }

        if (this.itens.length) {
          if (entities['itemName']) {
            const itemName = entities['itemName'].toLowerCase();
            let quantity = 1;
            if (entities['quantity']) {
              quantity = parseInt(entities['quantity'], 10);
            }

            suggestion = {
              text: `Você deseja adicionar ${quantity} unidades de ${itemName} à dispensa.`,
              linkText: "Adicionar itens",
              action: () => console.log(`Adicionar ${quantity} unidades de ${itemName} à dispensa`),
            }
          } else {
            suggestion = { text: "Por favor, forneça o nome do item que deseja adicionar.", linkText: '', action: () => { } }
          }
        }
        suggestions.push(suggestion);
        break;

      case 'manage_duplicates':
        suggestions.push(...this.suggestManageDuplicates());
        break;

      case 'adjust_dispense':
        if (entities['itemName'] && entities['quantity']) {
          const itemName = entities['itemName'];
          const quantity = Number(entities['quantity']);
          suggestions.push(await this.handleAdjustDispense(itemName, quantity));
        } else {
          suggestions.push({ text: "Por favor, forneça o nome do item e a nova quantidade para ajustar a dispensa." });
        }
        break;

      case 'seasonal_items':
        suggestions.push(...this.suggestSeasonalItems());
        break;

      case 'suggest_recipes':
        suggestions.push(...this.suggestRecipes());
        break;

      case 'track_expiration':
        suggestions.push(...this.suggestTrackExpiration());
        break;

      case 'optimize_stock':
        suggestions.push(...this.suggestOptimizeStock());
        break;

      case 'food_preferences':
        suggestions.push(...this.suggestFoodPreferences());
        break;

      default:
        suggestions.push(...this.generate({} as PantryContext));
    }

    return suggestions;
  }

  private suggestPantryOverview(inputExample: string): Suggestion {
    const totalItems = this.itensNames.length;
    const itemDetails = this.itens.map(item => `${item.name.trim()} (${item.currentQuantity} ${item.unit})`)
      .slice(0, 5)
      .join(', ');

    const itemsSummary = itemDetails.length ? itemDetails : "nenhum item encontrado";
    console.log(itemsSummary)
    let responseText = '';

    switch (inputExample) {
      case "o que tem na dispensa":
        responseText = `Você tem ${totalItems} itens na dispensa. Aqui estão alguns dos itens: ${itemsSummary}.`;
        break;
      case "preciso verificar a dispensa":
        responseText = ` Você possui ${totalItems} itens na dispensa. Veja alguns dos itens: ${itemsSummary}.`;
        break;
      case "qual é o status da dispensa":
        responseText = `O status da sua dispensa é: você possui ${totalItems} itens. Aqui estão alguns dos itens disponíveis: ${itemsSummary}.`;
        break;
      case "como está meu estoque":
        responseText = `Seu estoque atualmente tem ${totalItems} itens. Confira alguns dos itens disponíveis: ${itemsSummary}.`;
        break;
      // case "tem algo sobrando na dispensa":
      //   responseText = `Sim, você tem ${totalItems} itens na dispensa. Aqui estão alguns deles: ${itemsSummary}.`;
      //   break;
      default:
        responseText = `Aqui estão os itens disponíveis na sua dispensa: ${itemDetails || "nenhum item encontrado"}.`;
    }

    return {
      text: `Você tem ${totalItems} itens na dispensa. Aqui estão alguns dos itens que você possui: ${itemsSummary}.`,
      linkText: "dispensa",
      action: () => console.log(`Total de itens: ${totalItems}, Detalhes: ${itemDetails}`),
    };
  }

  private suggestItemStatus(itemName: string): Suggestion {
    const item = this.itens.find(x => x.name.trim() === itemName.trim());

    if (item) {
      const isCritical = item.currentQuantity <= (item.consumptionRate ?? 1) * 3;
      const text = isCritical
        ? `Você tem ${item.currentQuantity} unidades de ${item.name.trim()}, mas está acabando. Consider comprar mais.`
        : `Você tem ${item.currentQuantity} unidades de ${item.name.trim()} na dispensa.`;
      return { text };
    } else {
      return { text: `Não encontrei ${itemName} na sua dispensa. Talvez você queira adicionar este item à sua lista de compras.` };
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
    const duplicates = this.detectDuplicates();
    if (duplicates.length === 0) {
      return [{
        text: "Nenhum item duplicado encontrado na dispensa.",
        linkText: "Verificar novamente",
        action: () => console.log("Ação: Reexecutar verificação de duplicados"),
      }];
    }

    const duplicateNames = duplicates.map(d => `${d.itemName} (${d.count} vezes)`).join(", ");

    return [{
      text: "Existem itens duplicados na dispensa: ${duplicateNames}.",
      linkText: "Consolidar itens duplicados",
      action: () => console.log("Ação: Consolidar itens duplicados"),
    }];
  }

  private suggestAdjustDispense(): Suggestion[] {
    return [{
      text: "Ajuste a quantidade dos itens na sua dispensa para manter tudo organizado.",
      linkText: "Ajustar dispensa",
      action: () => console.log("Ação: Abrir tela de ajuste de dispensa"),
    }];
  }

  private suggestSeasonalItems(): Suggestion[] {
    return [{
      text: "Que legal você mencionar isso! Em breve, nossa aplicação vai trazer sugestões de itens sazonais, ajudando você a aproveitar produtos frescos e de qualidade na época certa do ano. Fique de olho, novidades incríveis estão chegando!",
      linkText: "",
      action: () => { },
    }];
  }

  private suggestRecipes(): Suggestion[] {
    return [{
      text: "Ótima ideia! Estamos preparando uma funcionalidade que vai sugerir receitas deliciosas com base nos itens disponíveis na sua dispensa. Imagine ter inspiração para suas refeições de forma prática e personalizada? Está quase saindo do forno!",
      linkText: "",
      action: () => { },
    }];
  }

  private suggestTrackExpiration(): Suggestion[] {
    return [{
      text: "Estamos trabalhando para que você nunca mais perca um item por vencimento! Em breve, o app vai ajudar a rastrear a validade dos produtos da sua dispensa, garantindo mais economia e menos desperdício. Mal podemos esperar para lançar isso!",
      linkText: "",
      action: () => { },
    }];
  }

  private suggestOptimizeStock(): Suggestion[] {
    return [{
      text: "Essa é uma funcionalidade que estamos ansiosos para compartilhar! Em breve, nosso app vai sugerir maneiras inteligentes de otimizar seu estoque, ajudando a equilibrar compras e uso eficiente. Prepare-se para organizar como nunca antes!",
      linkText: "",
      action: () => { },
    }];
  }

  private suggestFoodPreferences(): Suggestion[] {
    return [{
      text: "Adoramos a ideia! Em breve, o app vai permitir configurar suas preferências alimentares para oferecer sugestões personalizadas e alinhar suas escolhas com seu estilo de vida. Será um grande passo para tornar sua experiência ainda mais única!",
      linkText: "",
      action: () => { },
    }];
  }

  private updatePantryCriticalItems(items: Inventory[]): void {
    this.pantryCriticalItems = items.filter(item => item.currentQuantity <= (item.consumptionRate ?? 1) * 3);
  }

  private updateHasDuplicates(items: Inventory[]): void {
    const itemNames = new Set<string>();
    this.hasDuplicates = items.some(item => {
      if (itemNames.has(item.name.trim().toLowerCase())) {
        return true;
      } else {
        itemNames.add(item.name.trim().toLowerCase());
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

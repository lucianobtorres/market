import { db } from "src/app/db/model-db";
import { Inventory, nameof } from "src/app/models/interfaces";
import { Suggestion } from "./suggestion-strategy";

const item = "(?:\\b(?:e|ou)\\s+)?([^\\s]+)";
// const item = "(.+?)";
class PantryContext {
  pantryEmpty: boolean = false;
  pantryCriticalItems: { name: string; }[] = [];
  averageConsumptionRate?: boolean;
  hasDuplicates?: boolean;
}

type intentOption = 'check_pantry' | 'check_item';

// class PantrySuggestionStrategy2 extends SuggestionStrategy {
class PantrySuggestionStrategy2 {
  intents = [
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
        `tem ${item} na dispensa`,
        `tem ${item}`,
        `comprei ${item}`,
        `(?:e|ou) ${item}`
      ]
    }
  ];
  entities = [
    {
      name: "itemName",
      type: "string",
      description: "Qualquer item na dispensa",
      pattern: "\\b(leite|arroz|feijão|banana|...|outrosItensPossiveis)\\b"
    }
  ]


  generate(context: PantryContext): Suggestion[] {
    const suggestions: Suggestion[] = [];

    // Sugestões caso a dispensa esteja vazia
    if (context.pantryEmpty) {
      suggestions.push({
        text: "Sua dispensa está vazia. ",
        linkText: "Adicione itens.",
        action: () => console.log("Ação: Abrir tela de adicionar itens"),
      });
    }

    // Sugestões para itens críticos
    if (context.pantryCriticalItems && context.pantryCriticalItems.length > 0) {
      context.pantryCriticalItems.forEach(item => {
        suggestions.push({
          text: `O item ${item.name} está acabando. `,
          linkText: "Reabasteça agora.",
          action: () => console.log(`Ação: Reabastecer ${item.name}`),
        });
      });
    }

    // Sugestões baseadas no consumo médio
    if (context.averageConsumptionRate) {
      suggestions.push({
        text: "Baseado no seu consumo, recomendamos reabastecer itens frequentes.",
        linkText: "Adicionar itens sugeridos",
        action: () => console.log("Ação: Adicionar itens sugeridos baseados no consumo médio"),
      });
    }

    // Sugestões para itens duplicados
    if (context.hasDuplicates) {
      suggestions.push({
        text: "Existem itens duplicados na dispensa.",
        linkText: "Consolidar itens",
        action: () => console.log("Ação: Consolidar itens duplicados"),
      });
    }

    if (!context.pantryEmpty) {

      // Sugestões gerais
      suggestions.push(
        {
          text: "Reveja os itens marcados como 'não repor' para ajustar sua dispensa.",
          linkText: "ajustar sua dispensa",
          action: () => console.log("Ação: Gerenciar itens 'não repor'"),
        },
        {
          text: "Identificamos que itens sazonais podem ser úteis. ",
          linkText: "Ver sugestões sazonais",
          action: () => console.log("Ação: Mostrar itens sazonais sugeridos"),
        }
      );
    }

    return suggestions;
  }

  calculateDynamicLimit(context: PantryContext): number {
    let limit = 0;
    if (context.pantryCriticalItems?.length > 5) limit += 2;

    return limit;
  }


  canHandle(intent: intentOption): boolean {
    return ['check_pantry', 'check_item'].includes(intent);
  }

  async execute(intent: intentOption, entities: { [key: string]: any }): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];

    if (intent === 'check_pantry') {
      const pantryItems = await db.inventory.toArray();
      suggestions.push({
        text: `Você tem ${pantryItems.length} itens na dispensa.`,
        action: () => { }
      });
    }

    if (intent === 'check_item' && entities['itemName']) {
      console.log(entities)
      const itemName = entities['itemName'].toLowerCase();
      const item = await db.inventory
        .where(nameof<Inventory>('name'))
        .equalsIgnoreCase(itemName)
        .first();

      if (item) {
        const isCritical = item.currentQuantity <= (item.consumptionRate ?? 1) * 3;
        const text = isCritical
          ? `Você tem ${item.currentQuantity} unidades de ${item.name}, mas está acabando.`
          : `Você tem ${item.currentQuantity} unidades de ${item.name} na dispensa.`;
        suggestions.push({ text });
      } else {
        suggestions.push({ text: `Não encontrei ${itemName} na sua dispensa.` });
      }
    }

    return suggestions;
  }
}

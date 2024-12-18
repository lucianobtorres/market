import { db } from "src/app/db/model-db";
import { SuggestionStrategy, Suggestion } from "./suggestion-strategy";

export class HistoryContext {
  recentPurchases: { items: { name: string; }[]; }[] = [];
  hasSomeHistory: boolean = false;
}

type intentOption = 'last_purchase' | 'purchase_frequency';

export class HistorySuggestionStrategy extends SuggestionStrategy {

  constructor() {
    super();
    this.intents = [{
      name: "last_purchase",
      entities: ["item"],
      examples: [
        "quando comprei leite pela última vez",
        "última compra de arroz",
        "último item comprado"
      ]
    },
    {
      name: "purchase_frequency",
      entities: ["item"],
      examples: [
        "com que frequência compro leite",
        "quantas vezes comprei arroz",
        "histórico de compras de itens"
      ]
    }]
  }
  generate(context: HistoryContext): Suggestion[] {
    const suggestions: Suggestion[] = [];
    if (context.hasSomeHistory) {
      suggestions.push(
        {
          text: "Ajuste o valor dos itens comprados para enriquecer suas informações históricas.",
          linkText: "itens comprados",
          action: () => console.log("Ação: Abrir histórico"),
        },
        {
          text: "Use o mapa para encontrar mercados próximos.",
          linkText: "mapa",
          action: () => console.log("Ação: Abrir mapa"),
        },
        {
          text: "Veja as diferenças de preços entre suas compras.",
          linkText: "diferenças de preços",
          action: () => console.log("Ação: Abrir gráfico de preços"),
        },
        {
          text: "Confira o valor pago em um item específico",
          linkText: "valor pago",
          action: () => console.log("Ação: Abrir histórico detalhado do item"),
        },
        {
          text: "Edite as informações do local de compra e data no histórico.",
          linkText: "local de compra e data",
          action: () => console.log("Ação: Editar local e data do histórico"),
        },
        {
          text: "Acesse os detalhes de cada compra e edite itens registrados incorretamente.",
          linkText: "edite itens registrados incorretamente",
          action: () => console.log("Ação: Editar informações do item no histórico"),
        },
        {
          text: "Consulte a média de gastos com base no histórico.",
          linkText: "média de gastos",
          action: () => console.log("Ação: Exibir cálculo da média de gastos"),
        },
        // {
        //   text: "Sugerimos uma nova análise de ",
        //   linkText: "datas ideais para reabastecimento.",
        //   action: () => console.log("Ação: Calcular e sugerir data de recompra"),
        // },
        // {
        //   text: "Identifique padrões de consumo nos ",
        //   linkText: "itens recorrentes.",
        //   action: () => console.log("Ação: Exibir padrões de consumo no histórico"),
        // },
        // {
        //   text: "Explore as ",
        //   linkText: "promoções sazonais para economizar.",
        //   action: () => console.log("Ação: Exibir promoções sazonais baseadas no histórico"),
        // },
        // {
        //   text: "Defina metas de ",
        //   linkText: "economia mensal com base no histórico.",
        //   action: () => console.log("Ação: Sugerir metas baseadas no gráfico de gastos"),
        // },
        // {
        //   text: "Marque itens recorrentes para serem incluídos automaticamente na ",
        //   linkText: "lista de reposição.",
        //   action: () => console.log("Ação: Marcar item como recorrente"),
        // },
      );
    }

    if (context.recentPurchases?.length > 0) {
      const recentSuggestions = context.recentPurchases.slice(0, 3).map((purchase) => ({
        text: `Você comprou ${purchase.items[0]?.name} recentemente. `,
        linkText: "Adicionar à lista.",
        action: () => console.log(`Ação: Adicionar ${purchase.items[0]?.name} à lista`),
      }));

      suggestions.push(...recentSuggestions);
    }

    return suggestions;
  }

  calculateDynamicLimit(context: HistoryContext): number {
    let limit = 0;
    if (context.recentPurchases?.length > 3) limit += 1;

    return limit;
  }

  canHandle(intent: intentOption): boolean {
    return ['last_purchase', 'purchase_frequency'].includes(intent);
  }

  async chatResponse(intent: intentOption, entities: { [key: string]: any }): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];

    if (intent === 'last_purchase' && entities['itemName']) {
      const itemName = entities['itemName'].toLowerCase();
      const purchases = await db.purchasesHistory
        .filter((h) => h.items.some((i) => i.name.toLowerCase() === itemName))
        .toArray();

      if (purchases.length > 0) {
        const lastPurchase = purchases.sort(
          (a, b) => new Date(b.dateCompleted).getTime() - new Date(a.dateCompleted).getTime()
        )[0];
        suggestions.push({
          text: `Você comprou ${itemName} pela última vez em ${new Date(
            lastPurchase.dateCompleted
          ).toLocaleDateString()}.`,
        });
      } else {
        suggestions.push({ text: `Não encontrei registros de compra para ${itemName}.` });
      }
    }

    return suggestions;
  }

}

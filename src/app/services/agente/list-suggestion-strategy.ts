import { db } from "src/app/db/model-db";
import { Intent, Suggestion, SuggestionStrategy } from "./agente.service";

export class ListContext {
  hasSomeHistory: boolean = false;
  hasOpenLists: boolean = false;
  hasItemsToBuy: boolean = false;
  listCount: number = 0
}

type intentOption = 'check_list' | 'check_item';

export class ListSuggestionStrategy implements SuggestionStrategy {
  intents: Intent[] = [];
  generate(context: ListContext): Suggestion[] {
    const suggestions: Suggestion[] = [];

    context.hasOpenLists = context.listCount !== 0;

    // Sugestões caso o usuário não tenha listas abertas
    if (!context.hasOpenLists) {
      suggestions.push(
        {
          text: "Crie uma nova lista para começar a organizar suas compras. ",
          linkText: "nova lista",
          action: () => console.log("Ação: Criar nova lista"),
        },
        {
          text: "Importe uma lista compartilhada por outra pessoa. ",
          linkText: "Importe uma lista",
          action: () => console.log("Ação: Importar lista"),
        }
      );

      if (context.hasSomeHistory) {
        suggestions.push(
          {
            text: "Use a reposição da dispensa para gerar uma nova lista automaticamente. ",
            linkText: "gerar uma nova lista",
            action: () => console.log("Ação: Gerar lista da dispensa"),
          }
        );
      }
    }

    // Sugestões caso o usuário tenha listas abertas, mas nenhum item a comprar
    if (context.hasOpenLists && !context.hasItemsToBuy) {
      suggestions.push(
        {
          text: "Finalize as listas abertas para enviar os itens comprados para a dispensa. ",
          linkText: "Finalize as listas",
          action: () => console.log("Ação: Finalizar listas abertas"),
        },
        {
          text: "Verifique as listas abertas para remover itens desnecessários. ",
          linkText: "listas abertas",
          action: () => console.log("Ação: Editar listas abertas"),
        }
      );
    }

    // Sugestões gerais para incentivar boas práticas
    if (context.listCount > 3) {
      suggestions.push(
        {
          text: "Você tem várias listas abertas. ",
          linkText: "Busque consolidá-las em uma única lista.",
          action: () => console.log("Ação: Consolidar listas abertas"),
        }
      );
    }

    if (context.hasOpenLists) {
      suggestions.push(
        {
          text: "Envie os itens comprados para a dispensa para melhorar o acompanhamento de suas compras. ",
          linkText: "dispensa",
          action: () => console.log("Ação: Enviar itens comprados para a dispensa"),
        },
        {
          text: "Marque os itens como comprados diretamente na sua lista. ",
          linkText: "como comprados",
          action: () => console.log("Ação: Marcar itens como comprados"),
        }
      );
    }

    return suggestions;
  }

  calculateDynamicLimit(context: ListContext): number {
    let limit = 0;

    if (context.listCount === 0) limit += 1;
    return limit;
  }

  canHandle(intent: intentOption): boolean {
    return ['check_list', 'check_item'].includes(intent);
  }

  async execute(intent: intentOption, entities: { [key: string]: any }): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];

    if (intent === 'check_list' && entities['itemName']) {
      const itemName = entities['itemName'].toLowerCase();
      const lists = await db.lists.toArray();

      if (lists.length > 0) {
        suggestions.push({
          text: `Você tem ${lists.length} listas.`,
        });
      } else {
        suggestions.push({ text: `Você está sem listas .` });
      }
    }

    return suggestions;
  }
}

import { Suggestion, SuggestionStrategy } from "./agente.service";

export class PantrySuggestionStrategy implements SuggestionStrategy {
  generate(context: any): Suggestion[] {
    if (context.pantryEmpty) {
      return [
        {
          text: "Sua dispensa está vazia. ",
          linkText: "Adicione itens.",
          action: () => console.log("Ação: Abrir tela de adicionar itens")
        }
      ];
    }

    return context.pantryCriticalItems.map((item: { name: any; }) =>({
      text: `O item ${item.name} está acabando. `,
      linkText: "Reabasteça agora.",
      action: () => console.log(`Ação: Reabastecer ${item.name}`)
    }));
  }
}

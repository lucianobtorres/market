import { Suggestion, SuggestionStrategy } from "./agente.service";

export class QuickActionsSuggestionStrategy implements SuggestionStrategy {
  generate(): Suggestion[] {
    return [
      {
        text: "Quer organizar melhor sua lista? ",
        linkText: "Adicione novos itens.",
        action: () => console.log("Ação: Adicionar novos itens")
      }
    ];
  }
}

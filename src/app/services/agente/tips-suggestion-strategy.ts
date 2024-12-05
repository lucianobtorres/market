import { Suggestion, SuggestionStrategy } from "./agente.service";

export class TipsSuggestionStrategy implements SuggestionStrategy {
  generate(): Suggestion[] {
    return [
      {
        text: "Use o ",
        linkText: "mapa para encontrar mercados próximos.",
        action: () => console.log("Ação: Abrir mapa")
      }
    ];
  }
}

import { Suggestion, SuggestionStrategy } from "./agente.service";

export class HistorySuggestionStrategy implements SuggestionStrategy {
  generate(context: any): Suggestion[] {
    if (context.recentPurchases.length > 0) {
      return context.recentPurchases.slice(0, 3).map((purchase: { items: { name: any; }[]; }) => ({
        text: `Você comprou ${purchase.items[0]?.name} recentemente. `,
        linkText: "Adicionar à lista.",
        action: () => console.log(`Ação: Adicionar ${purchase.items[0]?.name} à lista`)
      }));
    }
    return [];
  }
}

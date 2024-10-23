import { ItemUnit } from "./item-unit";

export type CombinedItem = (BoughtItems & Partial<ShoppingItem>) | (ShoppingItem & Partial<BoughtItems>);

export interface ItemShoppingList {
  shopping: ShoppingList,
  itens: ShoppingItem[]
}

export interface ShoppingList {
  id?: number,
  nome: string,
}

export interface BoughtItems extends ConfigItems {
  adding: boolean,
  dataCompra: Date,
}

export interface ShoppingItem extends ConfigItems {
  quantidade?: number;
  preco?: number;
  completed: boolean;
}

export interface ConfigItems {
  id?: number;
  nome: string;
  notas?: string;
  unidade: ItemUnit;
  shoppingListId: number | undefined;
}

export interface IHistoricoCompras {
  id?: number;
  comprado: boolean;
  item: string;
  data: string;
}

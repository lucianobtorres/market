import { ItemUnit } from "./item-unit";

export type CombinedItem = (BoughtItems & Partial<ShoppingItem>) | (ShoppingItem & Partial<BoughtItems>);

export interface NotificationModel {
  id?: number;
  title?: string;
  message: string;
  read: boolean;
  timestamp: Date;
}

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
  shoppingListId: number;
}

export interface ConfigItems {
  id?: number;
  nome: string;
  notas?: string;
  unidade: ItemUnit;
}

export interface IHistoricoCompras {
  id?: number;
  comprado: boolean;
  item: string;
  data: string;
}

export interface VersionDB {
  id?: number;
  version: number | undefined;
}

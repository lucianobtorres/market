import { ItemUnit } from "./item-unit";

export type CombinedItem = (Purchases & Partial<Items>) | (Items & Partial<Purchases>);

export interface NotificationModel {
  id?: number;
  title?: string;
  message: string;
  read: boolean;
  timestamp: Date;
}

export interface ItemShoppingList {
  lists: Lists,
  itens: Items[]
}

export interface Lists {
  id?: number;
  name: string;
  createdDate: Date;
  share?: string;
  status: 'active' | 'completed';
}

export interface Purchases extends ConfigItems {
  adding: boolean;
  purchaseDate: Date;
}

export interface Items extends ConfigItems {
  price?: number;
  listId: number;
  isPurchased: boolean;
  addedDate: Date;

}

export interface ConfigItems {
  id?: number;
  name: string;
  notas?: string;
  quantity?: number;
  unit: ItemUnit;
}

export interface PurchaseHistory {
  id?: number;
  listId: number;
  dateCompleted: Date;
  items: Array<{
    itemId: number;
    name: string;
    quantity: number;
    unit: string;
    price?: number;
  }>;
}


export interface VersionDB {
  id?: number;
  version: number | undefined;
}

import Dexie, { Table } from 'dexie';
import { ShoppingItem, BoughtItems, ShoppingList, NotificationModel } from '../models/interfaces';
import { CURRENT_DATABASE_VERSION, Migrations } from './migrations';


export interface VersionDB {
  id?: number;
  version: number | undefined;
}

export class ModelDB extends Dexie {
  notifications!: Table<NotificationModel, number>;
  shoppingLists!: Table<ShoppingList, number>;
  shoppingItems!: Table<ShoppingItem, number>;
  boughtItems!: Table<BoughtItems, number>;

  //versionDB!: Table<VersionDB, number>;
  //historicoCompras!: Table<IHistoricoCompras, number>;

  constructor() {
    super('Model-DB');

    this.version(CURRENT_DATABASE_VERSION).stores({
      //versions: '++id, version',
      //historicoCompras: '++id, compra, produto, data',
      notifications: '++id, title, message, read, timestamp',
      shoppingItems: '++id, nome, notas, quantidade, unidade, preco, completed, shoppingListId',
      boughtItems: '++id, nome, notas, quantidade, unidade, preco, completed, dataCompra',
      shoppingLists: '++id, nome',
    });

    Migrations.createMigrations(this);
  }
}

export const db = new ModelDB();

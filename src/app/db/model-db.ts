import { Items, Purchases, Lists, NotificationModel, PurchaseHistory, Inventory, ProductMapping } from '../models/interfaces';
import { Migrations } from './migrations';
import Dexie, { Table } from 'dexie';


export interface VersionDB {
  id?: number;
  version: number | undefined;
}

export class ModelDB extends Dexie {
  versionDB!: Table<VersionDB, number>;
  notifications!: Table<NotificationModel, number>;

  lists!: Table<Lists, number>;
  items!: Table<Items, number>;
  purchases!: Table<Purchases, number>;
  purchasesHistory!: Table<PurchaseHistory, number>;
  inventory!: Table<Inventory, number>;
  productMappings!: Table<ProductMapping, number>;

  constructor() {
    super('Model-DB');

    console.debug('Versão 1 do banco')
    this.version(1).stores({
      versionDB: '++id, version',

      notifications: '++id, title, message, read, timestamp',

      // Preserva as tabelas antigas temporariamente para migração dos dados
      shoppingItems: '++id, nome, notas, quantidade, unidade, preco, completed, shoppingListId',
      boughtItems: '++id, nome, notas, quantidade, unidade, preco, completed, dataCompra',
      shoppingLists: '++id, nome',
    })

    console.debug('Versão 2 do banco')
    this.version(2).stores({
      versionDB: '++id, version',

      notifications: '++id, title, message, read, timestamp',

      lists: '++id, name, createdDate, status',
      items: '++id, name, quantity, unit, listId, isPurchased, addedDate',
      purchases: '++id, name, quantity, unit, listId, purchaseDate',

      //Preserva as tabelas antigas temporariamente para migração dos dados
      shoppingItems: '++id, nome, notas, quantidade, unidade, preco, completed, shoppingListId',
      boughtItems: '++id, nome, notas, quantidade, unidade, preco, completed, dataCompra',
      shoppingLists: '++id, nome',

    }).upgrade(async (tx) => {
      // Adiciona um controle inicial de versão se não existir
      const existingVersion = await tx.table('versionDB').get(1);
      if (!existingVersion) {
        console.debug('adicionando controle de versão na versão 2')
        await tx.table('versionDB').add({ id: 1, version: 1 });
      }
    });

    console.debug('Versão 3 do banco')
    this.version(3).stores({
      versionDB: '++id, version',

      notifications: '++id, title, message, read, timestamp',

      lists: '++id, name, createdDate, status',
      items: '++id, name, quantity, unit, listId, isPurchased, addedDate',
      purchases: '++id, name, quantity, unit, listId, purchaseDate',
      purchasesHistory: '++id, listId, dateCompleted, items',
    });

    console.debug('Versão 4 do banco')
    this.version(4).stores({
      versionDB: '++id, version',

      notifications: '++id, title, message, read, timestamp',

      lists: '++id, name, createdDate, status, share',
      items: '++id, name, quantity, unit, listId, isPurchased, addedDate',
      purchases: '++id, name, quantity, unit, listId, purchaseDate',
      purchasesHistory: '++id, listId, dateCompleted, items',
    });

    console.debug('Versão 5 do banco')
    this.version(5).stores({
      versionDB: '++id, version',

      notifications: '++id, title, message, read, timestamp',

      lists: '++id, name, createdDate, status, share',
      items: '++id, name, quantity, unit, listId, isPurchased, addedDate',
      purchases: '++id, name, quantity, unit, listId, purchaseDate',
      purchasesHistory: '++id, listId, dateCompleted, items, store',
      inventory: '++id, name, category, initialQuantity, currentQuantity, unit, lastRestockedDate, estimatedDepletionDate, consumptionRate',
    });

    console.debug('Versão 6 do banco')
    this.version(6).stores({
      versionDB: '++id, version',

      notifications: '++id, title, message, read, timestamp',

      lists: '++id, name, createdDate, status, share',
      items: '++id, name, quantity, unit, listId, isPurchased, addedDate',
      purchases: '++id, name, quantity, unit, listId, purchaseDate',
      purchasesHistory: '++id, listId, dateCompleted, items, store',
      inventory: '++id, name, category, initialQuantity, currentQuantity, unit, lastRestockedDate, estimatedDepletionDate, consumptionRate',
      productMappings: "++id, userDefined, baseProduct, synonyms, exclusions"
    });

    Migrations.createMigrations(this);
  }
}

export const db = new ModelDB();

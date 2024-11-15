import { Injectable } from '@angular/core';
import { Inventory, PurchaseItem, PurchaseHistory } from '../../models/interfaces';
import { DBRepository } from 'src/app/models/db.repository';
import { db } from 'src/app/db/model-db';
import { ToastService } from '../toast.service';
import { addDays } from 'date-fns';

const PERIODO_PADRAO = 7;

export interface PurchaseRecord {
  id?: number;
  date?: Date;
  quantity?: number;
  price?: number;
  store?: string;
  deletar?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class InventoryService extends DBRepository<Inventory> {
  constructor(ts: ToastService) {
    super(ts);
    this.table = db.inventory;
  }

  async insertInventory(historico: PurchaseHistory) {
    for (const element of historico.items) {
      const itemSameNameDispensa = await this.table
        .where('name')
        .equals(element.name!)
        .toArray();

      if (itemSameNameDispensa.length) {
        this.updateItemDispensa(itemSameNameDispensa[0], element);
      } else {
        this.addItemDispensa(element);
      }
    }
  }

  addItemDispensa(element: PurchaseItem) {
    const hoje = new Date();
    const itemDispensa: Inventory = {
      name: element.name,
      category: "teste",
      initialQuantity: 0,
      currentQuantity: element.quantity ?? 1,
      unit: element.unit,
      lastRestockedDate: hoje,
      estimatedDepletionDate: addDays(hoje, PERIODO_PADRAO),
      consumptionRate: (element.quantity ?? 1) / PERIODO_PADRAO
    };

    this.table.add(itemDispensa);
  }

  updateItemDispensa(itemDispensa: Inventory, element: PurchaseItem) {
    const hoje = new Date();
    itemDispensa.initialQuantity = itemDispensa.currentQuantity;
    itemDispensa.currentQuantity = element.quantity ?? 1;
    itemDispensa.unit = element.unit;
    itemDispensa.lastRestockedDate = hoje;
    itemDispensa.estimatedDepletionDate = addDays(hoje, PERIODO_PADRAO);
    itemDispensa.consumptionRate = (element.quantity ?? 1) / PERIODO_PADRAO;

    this.table.update(itemDispensa.id!, itemDispensa);
  }

  async getPurchaseHistoryForItem(itemName: string): Promise<PurchaseRecord[]> {
    // Procura todas as compras no histórico que contenham o item especificado
    const purchaseHistory = await this.getHistoryFromName(itemName);

    console.info('historico: ' + itemName, purchaseHistory)
    // Extrai informações relevantes de cada compra que contém o item
    const itemHistory: PurchaseRecord[] = purchaseHistory.map(purchase => {
      const item = purchase.items.find(it => it.name.toLowerCase() === itemName.toLowerCase());
      return {
        id: purchase.id ?? 0,
        date: purchase.dateCompleted,
        quantity: item ? item.quantity : 0,
        price: item ? item.price : 0,
        store: purchase.store
      };
    });

    return itemHistory;
  }

  private async getHistoryFromName(itemName: string): Promise<PurchaseHistory[]> {
    return await db.purchasesHistory
      .toArray()
      .then((history) => history.filter((purchase) => purchase.items.some((item) => item.name.toLowerCase() === itemName.toLowerCase())
      ).sort((a, b) => a.dateCompleted.getTime() - b.dateCompleted.getTime())
      );
  }

  async getLastPrice(itemName: string): Promise<number | undefined> {
    console.info('Obter último Preçp: ', itemName)
    const purchasesHistory = await this.getHistoryFromName(itemName);

    if (!purchasesHistory?.length) { return undefined; }

    const purchaseHistory = purchasesHistory[purchasesHistory.length - 1];
    return purchaseHistory?.items.find(item => item.name === itemName)?.price;
  }

  async updateItemInHistory(purchaseHistoryId: number, name: string, updatedItem: PurchaseRecord) {
    console.info('Atualizando: ', updatedItem, 'Id: ', purchaseHistoryId)
    const purchaseHistory = await db.purchasesHistory.get(purchaseHistoryId);

    if (purchaseHistory) {
      console.info(purchaseHistory)
      const updatedItems = purchaseHistory.items.map(item =>
        item.name === name ? { ...item, ...updatedItem } : item
      );

      console.info(purchaseHistory)
      await db.purchasesHistory.update(purchaseHistoryId, { items: updatedItems });
    }
  }

  async removeItemFromHistory(purchaseHistoryId: number, name: string) {
    console.info('Removendo: ', name, 'Id: ', purchaseHistoryId)
    const purchaseHistory = await db.purchasesHistory.get(purchaseHistoryId);

    if (purchaseHistory) {
      console.info(purchaseHistory)
      const updatedItems = purchaseHistory.items.filter(item => item.name !== name);
      console.info(updatedItems)
      await db.purchasesHistory.update(purchaseHistoryId, { items: updatedItems });
    }
  }
}

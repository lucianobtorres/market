import { Injectable } from '@angular/core';
import { Inventory, PurchaseItem, PurchaseHistory } from '../../models/interfaces';
import { DBRepository } from 'src/app/models/db.repository';
import { db } from 'src/app/db/model-db';
import { ToastService } from '../toast.service';
import { addDays } from 'date-fns';

const PERIODO_PADRAO = 7;

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
}

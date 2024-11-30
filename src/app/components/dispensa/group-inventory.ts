import { Inventory } from "src/app/models/interfaces";
import { ItemUnit } from "src/app/models/item-unit";

export class groupInventory {
  get id(): number | undefined {
    return this.itens.length
      ? this.itens[0].id
      : undefined;
  }

  get name(): string {
    return this.itens.length
      ? this.itens[0].name
      : '';
  }

  get category(): string {
    return this.itens.length
      ? this.itens[0].category
      : '';
  }

  get initialQuantity(): number {
    return this.itens.length
      ? this.itens[0].initialQuantity
      : 0;
  }

  get quantityVariacoes(): number {
    return this.itens.reduce((total, item) => {
      if (item.currentQuantity) {
        return total + (item.currentQuantity ?? 0);
      }
      return total;
    }, 0);
  }

  get productQuantity(): number {
    return this.itens.length
      ? this.itens[0].currentQuantity
      : 0;
  }

  get variacoesQuantity(): number {
    return this.currentQuantity - this.productQuantity;
  }

  get currentQuantity(): number {
    return this.itens.reduce((total, item) => {
      if (item.currentQuantity) {
        return total + (item.currentQuantity ?? 0);
      }
      return total;
    }, 0);
  }

  get unit(): ItemUnit {
    return this.itens.length
      ? this.itens[0].unit
      : ItemUnit.UNID;
  }

  get lastRestockedDate(): Date {
    return this.itens.length
      ? this.itens[0].lastRestockedDate
      : new Date();
  }

  get estimatedDepletionDate(): Date | null {
    return this.itens.length
      ? this.itens[0].estimatedDepletionDate
      : new Date();
  }

  get consumptionRate(): number | null {
    return this.itens.length
      ? this.itens[0].consumptionRate
      : 0;
  }
  inCurrentList: boolean = false; // Propriedade adicional

  itens: Inventory[] = [];
}

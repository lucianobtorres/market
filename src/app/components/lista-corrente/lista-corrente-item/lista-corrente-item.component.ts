import { Component, Input, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Items } from 'src/app/models/interfaces';
import { ItemsService } from 'src/app/services/db/items.service';
import { ValorEditComponent } from '../../shared/valor-edit/valor-edit.component';
import { UtilsNumber } from 'src/app/utils/utils-number';
import { InventoryService } from 'src/app/services/db/inventory.service';

@Component({
  selector: 'app-lista-corrente-item',
  templateUrl: './lista-corrente-item.component.html',
  styleUrls: ['./lista-corrente-item.component.scss'],
})
export class ListaCorrenteItemComponent implements OnInit {
  @Input() item!: Items;
  lastPrice: number | undefined;
  get showLastPrice() {
    return this.lastPrice && Number(UtilsNumber.convertValueToDecimal(this.item.price)) !== Number(UtilsNumber.convertValueToDecimal(this.lastPrice));
  }
  get grow() {
    return Number(UtilsNumber.convertValueToDecimal(this.item.price)) > Number(UtilsNumber.convertValueToDecimal(this.lastPrice));
  }

  constructor(
    private readonly dbService: ItemsService,
    private readonly bottomSheet: MatBottomSheet,
    private readonly inventoryService: InventoryService,
  ) { }

  async ngOnInit(): Promise<void> {
    this.lastPrice = await this.inventoryService.getLastPrice(this.item.name);
  }

  toggleItemComprado(event: Event) {
    event.stopPropagation();
    this.item.isPurchased = !this.item.isPurchased;
    this.dbService.update(
      this.item.id!,
      this.item,
      this.item.isPurchased
        ? `${this.item.name} comprado..`
        : `${this.item.name} devolvido..`);
  }

  removeItem(event: Event) {
    event.stopPropagation();
    this.dbService.delete(this.item.id!);
  }

  editItem(event: Event): void {
    event.stopPropagation();
    const bottomSheetRef = this.bottomSheet.open(ValorEditComponent, {
      data: { item: this.item },
      // disableClose: true
    });

    bottomSheetRef.afterDismissed().subscribe(result => {
      if (result) {
        Object.assign(this.item, result);
      }
    });
  }

  public getPrice = (value: number | string | undefined) => {
    if (!value) return undefined;
    return UtilsNumber.convertValueToDecimal(`${value}`);
  }
}

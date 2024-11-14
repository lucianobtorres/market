import { Component, EventEmitter, Inject, Input, OnInit, Optional, Output, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { BehaviorSubject } from 'rxjs';
import { InventoryService, PurchaseRecord } from 'src/app/services/db/inventory.service';
import { UtilArray } from 'src/app/utils/utils-array';


@Component({
  selector: 'app-purchase-history-modal',
  templateUrl: './purchase-history-modal.component.html',
  styleUrls: ['./purchase-history-modal.component.scss']
})
export class PurchaseHistoryModalComponent implements OnInit {
  @ViewChild(MatTable) table!: MatTable<PurchaseRecord>;
  @Output() closeEmit = new EventEmitter<void>();
  purchases: PurchaseRecord[] = [];
  purchases$ = new BehaviorSubject<PurchaseRecord[]>([]);
  @Input() itemName!: string;
  displayedColumns: string[] = ['date', 'quantity', 'price', 'store', 'remove'];
  constructor(
    private inventoryService: InventoryService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { itemName: string },
  ) { }

  async ngOnInit(): Promise<void> {
    if (this.data) {
      this.itemName = this.data.itemName;
    }

    this.purchases = await this.inventoryService.getPurchaseHistoryForItem(this.itemName);
    this.purchases$.next(this.purchases);
  }

  removePurchase(purchase: PurchaseRecord) {
    purchase.deletar = true
    const itens = this.purchases$.value.filter(x => !x.deletar);
    this.purchases$.next(itens);

    this.table.dataSource = this.purchases$;
  }

  async salvar() {
    console.log(this.purchases$, this.purchases)
    for (const element of this.purchases) {
      if (element.deletar) await this.inventoryService.removeItemFromHistory(element.id!, this.itemName);
      else await this.inventoryService.updateItemInHistory(element.id!, this.itemName, element);
    }
    this.closeEmit.emit();
  }
}

import { Component, EventEmitter, Inject, Input, OnInit, Optional, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { InventoryService, PurchaseRecord } from 'src/app/services/db/inventory.service';


@Component({
  selector: 'app-purchase-history-modal',
  templateUrl: './purchase-history-modal.component.html',
  styleUrls: ['./purchase-history-modal.component.scss']
})
export class PurchaseHistoryModalComponent implements OnInit {
  @Output() closeEmit = new EventEmitter<void>();
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

    const purchases = await this.inventoryService.getPurchaseHistoryForItem(this.itemName);
    this.purchases$.next(purchases);
  }

  close() {
    // this.dialogRef.close(this.purchases$.value); // retorna o array atualizado
  }
  removePurchase(purchase: PurchaseRecord) {
    const index = this.purchases$.value.indexOf(purchase);
    if (index >= 0) {
      this.purchases$.next(this.purchases$.value.splice(index, 1));
    }
  }

}

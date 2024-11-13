import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { PurchaseHistoryModalComponent } from '../purchase-history-modal.component';

@Component({
  selector: 'app-purchase-history-modal-dialog',
  template: '<app-purchase-history-modal (closeEmit)="close()"></app-purchase-history-modal>'
})
export class PurchaseHistoryModalDialogComponent {
  constructor(private readonly dialogRef: MatDialogRef<PurchaseHistoryModalComponent>) { }

  close() {
    this.dialogRef.close();
  }
}

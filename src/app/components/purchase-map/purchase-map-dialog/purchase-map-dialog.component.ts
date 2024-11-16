import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { PurchaseMapComponent } from '../purchase-map.component';

@Component({
  selector: 'app-purchase-map-dialog',
  template: '<app-purchase-map (closeEmit)="close()"></app-purchase-map>'
})
export class PurchaseMapDialogComponent {
  constructor(private readonly dialogRef: MatDialogRef<PurchaseMapComponent>) { }

  close() {
    this.dialogRef.close();
  }
}

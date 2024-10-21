import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-shopping-dialog',
  template: '<app-shopping-list (closeEmit)="close()"></app-shopping-list>'
})
export class ShoppingDialogComponent {
  constructor(private readonly dialogRef: MatDialogRef<ShoppingDialogComponent>) { }

  close() {
    this.dialogRef.close();
  }
}

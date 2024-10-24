import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styles: [`mat-dialog-actions {
    justify-content: flex-end;
  }`]
})
export class ConfirmDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string }) { }

  onNoClick(): void {
    this.dialogRef.close(false); // Fecha sem confirmar
  }

  onConfirmClick(): void {
    this.dialogRef.close(true); // Fecha confirmando
  }
}

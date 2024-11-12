import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogArgs {
  message?: string,
  action?: string,
  cancel?: string,
  class?: 'primary' | 'accent' | 'warn'
}

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogArgs) {
    this.data = Object.assign(
      {
        message: 'Continuar?',
        action: 'Confirmar',
        cancel: 'Cancelar',
        class: 'primary'
      },
      data
    );

    this.dialogRef.addPanelClass('rounded-container');
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  onConfirmClick(): void {
    this.dialogRef.close(true);
  }
}

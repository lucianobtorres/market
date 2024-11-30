import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { VariacoesModalComponent } from '../variacoes-modal.component';

@Component({
  template: '<app-variacoes-modal (closeEmit)="close()"></app-variacoes-modal>'
})
export class VariacoesModalDialogComponent {
  constructor(private readonly dialogRef: MatDialogRef<VariacoesModalComponent>) { }

  close() {
    this.dialogRef.close();
  }
}

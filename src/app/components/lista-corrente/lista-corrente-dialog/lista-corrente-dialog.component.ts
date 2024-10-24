import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-lista-corrente-dialog',
  template: '<app-lista-corrente (closeEmit)="close()"></app-lista-corrente>'
})
export class ListaCorrenteDialogComponent {
  constructor(private readonly dialogRef: MatDialogRef<ListaCorrenteDialogComponent>) { }

  close() {
    this.dialogRef.close();
  }
}

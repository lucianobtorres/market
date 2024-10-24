import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-search-dialog',
  template: '<app-search-list (closeEmit)="close()"></app-search-list>'
})
export class SearchDialogComponent {
  constructor(private readonly dialogRef: MatDialogRef<SearchDialogComponent>) { }

  close() {
    this.dialogRef.close();
  }
}

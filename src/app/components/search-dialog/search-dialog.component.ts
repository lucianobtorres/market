import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-search-dialog',
  templateUrl: './search-dialog.component.html',
  styleUrls: ['./search-dialog.component.scss']
})
export class SearchDialogComponent {
  constructor(
    private readonly dialogRef: MatDialogRef<SearchDialogComponent>,
  ) { }

  close() {
    this.dialogRef.close();
  }
}

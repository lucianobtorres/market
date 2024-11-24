import { Component, Inject } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { PurchaseHistory } from 'src/app/models/interfaces';
import { PurchaseHistoryService } from 'src/app/services/db/purchases-history.service';
import { TimeValue } from '../../time-picker/time-picker.component';
import { PurchaseRecord } from 'src/app/services/db/inventory.service';
import { PurchaseMapDialogComponent } from '../../purchase-map/purchase-map-dialog/purchase-map-dialog.component';
import { MatDialog } from '@angular/material/dialog';


interface FormEdicaoHistorico {
  data: FormControl<Date>;
  hora: FormControl<TimeValue>;
}

@Component({
  selector: 'app-form-edit-history',
  templateUrl: './form-edit-history.component.html',
  styleUrls: ['./form-edit-history.component.scss']
})
export class FormLEditHistoricoComponent {
  editForm!: FormGroup<FormEdicaoHistorico>;
  item: PurchaseHistory;

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialog: MatDialog,
    private readonly dbService: PurchaseHistoryService,
    private readonly bottomSheetRef: MatBottomSheetRef<FormLEditHistoricoComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: { item: PurchaseHistory }
  ) {
    this.item = data.item;
    this.setValues();
  }


  private setValues() {
    this.editForm = this.fb.group({
      data: this.fb.nonNullable.control(this.item.dateCompleted, Validators.required),
      hora: this.fb.nonNullable.control(TimeValue.createWithDate(this.item.dateCompleted), Validators.required),
    });
  }

  async saveCurrentItem() {
    if (this.editForm.valid) {
      const data = this.editForm.value.data;
      const hora = this.editForm.value.hora;

      if (!data || ! hora) return;

      const updatedItem: PurchaseHistory = {
        dateCompleted: new Date(data.getFullYear(), data.getMonth(), data.getDate(), hora.hora, hora.minuto),
        listId: this.item.listId,
        items: this.item.items
      };

      await this.dbService.update(this.item.id!, updatedItem);
    }
  }

  close(): void {
    this.bottomSheetRef.dismiss();
  }


  openMapDialog(purchase: PurchaseRecord) {
    const dialogRef = this.dialog.open(PurchaseMapDialogComponent, {
      data: { purchase },
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      panelClass: 'full-screen-dialog',
    });

    dialogRef.afterClosed().subscribe(async (_) => {
      // this.closeDiag();
    });
  }
}

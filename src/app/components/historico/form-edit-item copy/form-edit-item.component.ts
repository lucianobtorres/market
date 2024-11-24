import { AfterViewInit, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { ItemUnit } from 'src/app/models/item-unit';
import { PurchaseItem } from 'src/app/models/interfaces';
import { UtilsNumber } from 'src/app/utils/utils-number';
import { PurchaseHistoryService } from 'src/app/services/db/purchases-history.service';
import { InventoryService } from 'src/app/services/db/inventory.service';


interface FormEdicaoItemHistorico {
  nome: FormControl<string>;
  quantidade: FormControl<number>;
  unidade: FormControl<ItemUnit | null>;
  preco: FormControl<number | null>;
  anotacao: FormControl<string | null>;
}

@Component({
  selector: 'app-form-edit-item',
  templateUrl: './form-edit-item.component.html',
  styleUrls: ['./form-edit-item.component.scss']
})
export class FormLEditItemHistoricoComponent implements AfterViewInit{
  editForm!: FormGroup<FormEdicaoItemHistorico>;
  expanded = false;
  units = Object.values(ItemUnit);

  @ViewChild("campoFoco") campoFoco!: ElementRef;
  historyID: number;

  public get valorCalculado() {
    return (UtilsNumber.convertValueToDecimal(this.editForm.value.preco?.toString()) ?? 0) * (this.editForm.controls.quantidade?.value ?? 1);
  }

  public get item(): PurchaseItem {
    return this.itemsList[this.currentIndex];
  }

  itemsList: PurchaseItem[] = [];
  private _currentIndex = 0;
  public get currentIndex() {
    return this._currentIndex;
  }
  public set currentIndex(value) {
    this._currentIndex = value;
    this.setValues();
  }

  constructor(
    private readonly fb: FormBuilder,
    private readonly dbService: PurchaseHistoryService,
    private inventoryService: InventoryService,
    private readonly bottomSheetRef: MatBottomSheetRef<FormLEditItemHistoricoComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: { id: number, itemsList: PurchaseItem[], currentIndex: number }
  ) {
    this.historyID = data.id;
    this.itemsList = data.itemsList;
    this.currentIndex = data.currentIndex;
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const inputElement = this.campoFoco.nativeElement;
      inputElement.select();
      inputElement.focus();
    }, 200);
  }


  private setValues() {
    const data: PurchaseItem = this.item;
    const preco = UtilsNumber.convertValueToDecimal(`${data.price}`);
    this.editForm = this.fb.group({
      nome: this.fb.nonNullable.control(data.name, Validators.required),
      quantidade: this.fb.nonNullable.control(data.quantity || 1, [Validators.required, Validators.min(1)]),
      unidade: [data.unit || 'un' as ItemUnit, Validators.required],
      preco: [Number(preco ?? 0), [Validators.min(0)]],
      anotacao: [data.notas || '']
    });
  }

  async saveCurrentItem() {
    if (this.editForm.valid) {
      const updatedItem: PurchaseItem = {
        name: this.editForm.value.nome ?? '',
        quantity: this.editForm.value.quantidade ?? 1,
        price: UtilsNumber.convertValueToDecimal(this.editForm.value.preco?.toString()),
        unit: this.editForm.value.unidade ?? ItemUnit.UNID,
        notas: this.editForm.value.anotacao ?? undefined,
        purchaseDate: this.item.purchaseDate,
        adding: true,
      };

      await this.inventoryService.updateItemInHistory(this.historyID!, updatedItem.name, updatedItem);
      this.itemsList[this.currentIndex] = updatedItem;
    }
  }

  close(): void {
    this.bottomSheetRef.dismiss();
  }

  goToPreviousItem() {
    this.saveCurrentItem();
    if (this.hasPreviousItem()) {
      this.currentIndex--;
    }
  }

  goToNextItem() {
    this.saveCurrentItem();
    if (this.hasNextItem()) {
      this.currentIndex++;
    }
  }

  hasPreviousItem() {
    return this.currentIndex > 0;
  }

  hasNextItem() {
    return this.currentIndex < this.itemsList.length - 1;
  }

  isEditing = false;

  enableEditing() {
    this.isEditing = true;
  }

  updateName(editingName: string) {
    if (editingName.trim() !== '') {
      this.editForm.controls.nome.setValue(editingName);
    }

    this.isEditing = false;
  }

  increase(event: Event) {
    event.stopPropagation();
    this.editForm.value.quantidade;
    this.editForm.controls.quantidade.setValue((this.editForm.value.quantidade ?? 0) + 1);
  }

  decrease(event: Event) {
    event.stopPropagation();
    if (this.editForm.value.quantidade === 1) return;

    this.editForm.controls.quantidade.setValue((this.editForm.value.quantidade ?? 0) - 1);
  }
}

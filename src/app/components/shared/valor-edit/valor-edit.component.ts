import { AfterViewInit, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { ItemUnit } from 'src/app/models/item-unit';
import { Items } from 'src/app/models/interfaces';
import { ItemsService } from 'src/app/services/db/items.service';


export interface FormEdicaoValor {
  quantidade: FormControl<number>;
  unidade: FormControl<ItemUnit | null>;
  preco: FormControl<number | null>;
}

@Component({
  selector: 'app-valor-edit',
  templateUrl: './valor-edit.component.html',
  styleUrls: ['./valor-edit.component.scss']
})
export class ValorEditComponent implements AfterViewInit {
  editForm!: FormGroup<FormEdicaoValor>;
  units = Object.values(ItemUnit);

  @ViewChild("campoFoco") campoFoco!: ElementRef;
  public get item(): Items {
    return this.itemsList[this.currentIndex];
  }

  itemsList: Items[] = [];
  private _currentIndex = 0;
  public get valorCalculado() {
    return (this.editForm.controls.preco?.value ?? 0) * (this.editForm.controls.quantidade?.value ?? 1);
  }

  public get currentIndex() {
    return this._currentIndex;
  }

  public set currentIndex(value) {
    this._currentIndex = value;
    this.setValues();
  }

  @ViewChild('bottomSheetContent') bottomSheetContent!: ElementRef;

  constructor(
    private readonly fb: FormBuilder,
    private readonly dbService: ItemsService,
    private readonly bottomSheetRef: MatBottomSheetRef<ValorEditComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: { item: Items }
  ) {
    this.itemsList = [data.item];
    this.currentIndex = 0;
  }


  ngAfterViewInit(): void {
    setTimeout(() => {
      const inputElement = this.campoFoco.nativeElement;
      inputElement.select();
      inputElement.focus();
    }, 2000);
  }

  private setValues() {
    const data: Items = this.item;
    this.editForm = this.fb.group({
      quantidade: this.fb.nonNullable.control(data.quantity || 1, [Validators.required, Validators.min(1)]),
      unidade: [data.unit || ItemUnit.UNID, Validators.required],
      preco: [data.price || 0, [Validators.min(0)]],
    });
  }

  saveCurrentItem() {
    if (this.editForm.valid) {
      const updatedItem: Items = {
        id: this.item.id,
        isPurchased: this.item.isPurchased,
        name: this.item.name ?? '',
        quantity: this.editForm.value.quantidade ?? 1,
        price: this.editForm.value.preco ?? undefined,
        unit: this.editForm.value.unidade ?? ItemUnit.UNID,
        notas: this.item.notas,
        listId: this.item.listId,
        addedDate: this.item.addedDate,
      };

      this.dbService.update(this.item.id!, updatedItem, 'atualizado..');
      this.itemsList[this.currentIndex] = updatedItem;
    }
  }

  save(): void {
    this.saveCurrentItem();
  }

  close(): void {
    this.bottomSheetRef.dismiss();
  }
}

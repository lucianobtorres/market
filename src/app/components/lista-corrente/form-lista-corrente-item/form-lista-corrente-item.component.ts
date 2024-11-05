import { AfterViewInit, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { ItemUnit } from 'src/app/models/item-unit';
import { Items } from 'src/app/models/interfaces';
import { ItemsService } from 'src/app/services/db/items.service';


export interface FormEdicaoShopping {
  nome: FormControl<string>;
  quantidade: FormControl<number>;
  unidade: FormControl<ItemUnit | null>;
  preco: FormControl<number | null>;
  anotacao: FormControl<string | null>;
}

@Component({
  selector: 'app-form-lista-corrente-item',
  templateUrl: './form-lista-corrente-item.component.html',
  styleUrls: ['./form-lista-corrente-item.component.scss']
})
export class FormListaCorrenteItemComponent implements AfterViewInit {
  editForm!: FormGroup<FormEdicaoShopping>;
  expanded = false;
  units = Object.values(ItemUnit);

  @ViewChild("campoFoco") campoFoco!: ElementRef;
  public get item(): Items {
    return this.itemsList[this.currentIndex];
  }

  itemsList: Items[] = [];
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
    private readonly dbService: ItemsService,
    private readonly bottomSheetRef: MatBottomSheetRef<FormListaCorrenteItemComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: { itemsList: Items[], currentIndex: number }
  ) {
    this.itemsList = data.itemsList;
    this.currentIndex = data.currentIndex;
  }

  ngAfterViewInit(): void {
    const inputElement = this.campoFoco.nativeElement;
    inputElement.select();
  }

  private setValues() {
    const data: Items = this.item;
    this.editForm = this.fb.group({
      nome: this.fb.nonNullable.control(data.name, Validators.required),
      quantidade: this.fb.nonNullable.control(data.quantity || 1, [Validators.required, Validators.min(1)]),
      unidade: [data.unit || 'un' as ItemUnit, Validators.required],
      preco: [data.price || 0, [Validators.min(0)]],
      anotacao: [data.notas || '']
    });
  }

  saveCurrentItem() {
    if (this.editForm.valid) {
      const updatedItem: Items = {
        id: this.item.id,
        isPurchased: this.item.isPurchased,
        name: this.editForm.value.nome ?? '',
        quantity: this.editForm.value.quantidade ?? 1,
        price: this.editForm.value.preco ?? undefined,
        unit: this.editForm.value.unidade ?? ItemUnit.UNIDADE,
        notas: this.editForm.value.anotacao ?? undefined,
        listId: this.item.listId,
        addedDate: this.item.addedDate,
      };

      this.dbService.update(this.item.id!, updatedItem, 'atualizado..');
      this.itemsList[this.currentIndex] = updatedItem;
    }
  }

  toggleExpand() {
    this.expanded = !this.expanded;
  }

  save(): void {
    this.saveCurrentItem();
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
}

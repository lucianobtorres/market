import { Component, Inject } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { ItemUnit } from 'src/app/models/shopping-item';
import { ShoppingItem } from 'src/app/models/interfaces';


export interface FormEdicaoShopping {
  nome: FormControl<string>;
  quantidade: FormControl<number>;
  unidade: FormControl<ItemUnit | null>;
  preco: FormControl<number | null>;
  anotacao: FormControl<string | null>;
}

@Component({
  selector: 'app-shopping-list-edit',
  templateUrl: './shopping-list-edit.component.html',
  styleUrls: ['./shopping-list-edit.component.scss']
})
export class ShoppingListEditComponent {
  editForm!: FormGroup<FormEdicaoShopping>;
  expanded = false;
  units = Object.values(ItemUnit);

  public get item(): ShoppingItem {
    return this.itemsList[this.currentIndex];
  }

  itemsList: ShoppingItem[] = [];
  private _currentIndex = 0;
  public get currentIndex() {
    return this._currentIndex;
  }

  public set currentIndex(value) {
    this._currentIndex = value;
    this.setValues();
  }

  constructor(
    private fb: FormBuilder,
    private bottomSheetRef: MatBottomSheetRef<ShoppingListEditComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: { itemsList: ShoppingItem[], currentIndex: number }
  ) {
    this.itemsList = data.itemsList;
    this.currentIndex = data.currentIndex;
  }

  private setValues() {
    const data: ShoppingItem = this.item;
    this.editForm = this.fb.group({
      nome: this.fb.nonNullable.control(data.nome, Validators.required),
      quantidade: this.fb.nonNullable.control(data.quantidade || 1, [Validators.required, Validators.min(1)]),
      unidade: [data.unidade || 'un' as ItemUnit, Validators.required],
      preco: [data.preco || 0, [Validators.min(0)]],
      anotacao: [data.notas || '']
    });
  }

  saveCurrentItem() {
    if (this.editForm.valid) {
      const updatedItem: ShoppingItem = {
        id: this.item.id,
        completed: this.item.completed,
        nome: this.editForm.value.nome ?? '',
        quantidade: this.editForm.value.quantidade ?? 1,
        preco: this.editForm.value.preco ?? undefined,
        unidade: this.editForm.value.unidade ?? undefined,
        notas: this.editForm.value.anotacao ?? undefined,
      };

      this.itemsList[this.currentIndex] = updatedItem;
    }
  }

  // Alterna para o estado expandido
  toggleExpand() {
    this.expanded = !this.expanded;
  }

  save(): void {
    this.saveCurrentItem();
  }

  close(): void {
    this.bottomSheetRef.dismiss();
  }

  // Navegar para o item anterior
  goToPreviousItem() {
    this.saveCurrentItem();
    if (this.hasPreviousItem()) {
      this.currentIndex--;
    }
  }

  // Navegar para o próximo item
  goToNextItem() {
    this.saveCurrentItem();
    if (this.hasNextItem()) {
      this.currentIndex++;
    }
  }

  // Verifica se há item anterior
  hasPreviousItem() {
    return this.currentIndex > 0;
  }

  // Verifica se há próximo item
  hasNextItem() {
    return this.currentIndex < this.itemsList.length - 1;
  }
}

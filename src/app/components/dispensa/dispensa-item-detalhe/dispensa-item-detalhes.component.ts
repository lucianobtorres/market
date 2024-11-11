import { Component, Inject } from '@angular/core';
import { Inventory, Lists } from 'src/app/models/interfaces';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { ItemUnit } from 'src/app/models/item-unit';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ItemListService } from 'src/app/services/item-list.service';
import { db } from 'src/app/db/model-db';
import { ItemsService } from 'src/app/services/db/items.service';

export interface FormEdicaoInventory {
  nome: FormControl<string>;
}

@Component({
  selector: 'app-dispensa-item-detalhes',
  templateUrl: './dispensa-item-detalhes.component.html',
  styleUrls: ['./dispensa-item-detalhes.component.scss']
})
export class DispensaItemDetalhesComponent {
  editForm!: FormGroup<FormEdicaoInventory>;
  itemDispensa!: Inventory;
  lists: Lists[] = [];

  groupedInventory: { [unit: string]: any[] } = {};

  constructor(
    private readonly fb: FormBuilder,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: Inventory,
    private readonly bottomSheetRef: MatBottomSheetRef<DispensaItemDetalhesComponent>,
    private readonly dbService: ItemsService,
    private readonly listsService: ItemListService
  ) {
    this.itemDispensa = data;
  }

  isEditing = false;

  ngOnInit(): void {
    this.listsService.listas$.subscribe((listas) => {
      this.lists = listas.filter(x => x.lists.status !== 'completed').map(x => x.lists);
    });
    this.setValues();
  }

  private setValues() {
    const data: Inventory = this.itemDispensa;
    this.editForm = this.fb.group({
      nome: this.fb.nonNullable.control(data.name, Validators.required)
    });
  }

  enableEditing() {
    this.isEditing = true;
  }

  updateName(editingName: string) {
    if (editingName.trim() !== '') {
      this.editForm.controls.nome.setValue(editingName);
    }

    this.isEditing = false;
  }

  async addToList(item: Inventory, listaId: number) {
    if (this.editForm.valid) {
      const itensList = await db.items
        .where('listId')
        .equals(listaId!)
        .toArray();

      const itemFound = itensList.find(x => x.name === item.name);
      if (!itemFound) {
        this.dbService.add({
          name: this.itemDispensa.name,
          addedDate: new Date(),
          listId: listaId,
          unit: item.unit,
          isPurchased: false
        });
      } else {
        this.dbService.update(itemFound.id!, {
          quantity: (itemFound.quantity ?? 0) + 1
        });
      }
    }
  }

  close(): void {
    this.bottomSheetRef.dismiss();
  }

  increase(event: Event) {
    event.stopPropagation();
    // this.qtdChanged.emit(true);
  }

  decrease(event: Event) {
    event.stopPropagation();
    // this.qtdChanged.emit(false);
  }
}

import { Component, Inject } from '@angular/core';
import { Inventory, Lists } from 'src/app/models/interfaces';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ItemListService } from 'src/app/services/item-list.service';
import { db } from 'src/app/db/model-db';
import { ItemsService } from 'src/app/services/db/items.service';
import { MatDialog } from '@angular/material/dialog';
import { PurchaseHistoryModalComponent } from '../../purchase-history-modal/purchase-history-modal.component';
import { InventoryService } from 'src/app/services/db/inventory.service';
import { Utils } from 'src/app/utils/util';
import { PurchaseHistoryModalDialogComponent } from '../../purchase-history-modal/purchase-history-modal-dialog/purchase-history-modal-dialog.component';

export interface FormEdicaoInventory {
  nome: FormControl<string>;
}

@Component({
  selector: 'app-dispensa-item-detalhes',
  templateUrl: './dispensa-item-detalhes.component.html',
  styleUrls: ['./dispensa-item-detalhes.component.scss']
})
export class DispensaItemDetalhesComponent {
  isHistOpen = false;
  editForm!: FormGroup<FormEdicaoInventory>;
  itemDispensa!: Inventory;
  lists: Lists[] = [];

  groupedInventory: { [unit: string]: any[] } = {};

  constructor(
    private readonly fb: FormBuilder,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: Inventory,
    private readonly bottomSheetRef: MatBottomSheetRef<DispensaItemDetalhesComponent>,
    private readonly itemService: ItemsService,
    private readonly listsService: ItemListService,
    private readonly dbService: InventoryService,
    private dialog: MatDialog
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
        this.itemService.add({
          name: this.itemDispensa.name,
          addedDate: new Date(),
          listId: listaId,
          unit: item.unit,
          isPurchased: false,
          quantity: 1
        });
      } else {
        this.itemService.update(itemFound.id!, {
          quantity: (itemFound.quantity ?? 0) + 1
        });
      }
    }
  }

  async addToNewList(item: Inventory) {
    if (this.editForm.valid) {
      const listaId = await db.lists.add({ name: "Nova Lista", status: 'active', createdDate: new Date });
      this.addToList(item, listaId);
    }
  }

  close(): void {
    this.bottomSheetRef.dismiss();
  }

  increase(event: Event) {
    event.stopPropagation();
    this.itemDispensa.currentQuantity++;
    this.dbService.update(this.itemDispensa.id!, this.itemDispensa);
  }

  decrease(event: Event) {
    event.stopPropagation();
    if (this.itemDispensa.currentQuantity === 0) return;

    this.itemDispensa.currentQuantity--;
    this.dbService.update(this.itemDispensa.id!, this.itemDispensa);
  }

  isMobile(): boolean {
    return Utils.isMobile();
  }

  async openPurchaseHistoryModal(itemName: string) {
    if (this.isMobile()) {

    const dialogRef = this.dialog.open(PurchaseHistoryModalDialogComponent, {
      data: { itemName },
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      panelClass: 'full-screen-dialog',
    });

    dialogRef.afterClosed().subscribe((updatedPurchases) => {
      this.closeHist();
    });
  } else {
    // Abre o painel lateral em telas grandes
    this.isHistOpen = true;
  }
  }

  closeHist() {
    this.isHistOpen = false;
  }
}

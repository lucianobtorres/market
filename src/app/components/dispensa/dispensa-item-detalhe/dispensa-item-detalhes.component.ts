import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { Inventory, Lists } from 'src/app/models/interfaces';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ItemListService } from 'src/app/services/item-list.service';
import { db } from 'src/app/db/model-db';
import { ItemsService } from 'src/app/services/db/items.service';
import { MatDialog } from '@angular/material/dialog';
import { InventoryService } from 'src/app/services/db/inventory.service';
import { UtilsMobile } from 'src/app/utils/utils-mobile';
import { PurchaseHistoryModalDialogComponent } from '../../purchase-history-modal/purchase-history-modal-dialog/purchase-history-modal-dialog.component';
import { BehaviorSubject } from 'rxjs';
import { UtilsNumber } from 'src/app/utils/utils-number';
import { VariacoesModalDialogComponent } from '../../variacoes-modal/variacoes-modal-dialog/variacoes-modal-dialog.component';
import { notReposicao } from '../dispensa.component';


export interface FormEdicaoInventory {
  nome: FormControl<string>;
}

@Component({
  selector: 'app-dispensa-item-detalhes',
  templateUrl: './dispensa-item-detalhes.component.html',
  styleUrls: ['./dispensa-item-detalhes.component.scss']
})
export class DispensaItemDetalhesComponent {
  @Output() closeVars = new EventEmitter<void>();
  @Output() desagrupar = new EventEmitter<string>();
  isVariacoesOpen = false;
  isHistOpen = false;
  editForm!: FormGroup<FormEdicaoInventory>;
  lastPrice$ = new BehaviorSubject<number>(0);
  itemDispensa!: Inventory;
  qtdVariacoes = 0;
  lists: Lists[] = [];
  isGrouped: boolean = false;
  groupedInventory: { [unit: string]: any[] } = {};
  autoReposicao = false;

  get qtdVariacoesFormatted(): string | null {
    if (this.qtdVariacoes == null) {
      return null;
    }
    return Number.isInteger(this.qtdVariacoes)
      ? this.qtdVariacoes.toString()
      : this.qtdVariacoes.toFixed(1);
  }

  constructor(
    private readonly fb: FormBuilder,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: { item: Inventory, qtdVars: number, grouped: boolean },
    private readonly bottomSheetRef: MatBottomSheetRef<DispensaItemDetalhesComponent>,
    private readonly itemService: ItemsService,
    private readonly listsService: ItemListService,
    private readonly dbService: InventoryService,
    private dialog: MatDialog
  ) {
    this.itemDispensa = data.item;
    this.qtdVariacoes = data.qtdVars;
    this.isGrouped = data.grouped || false;
    this.autoReposicao = this.itemDispensa.category !== notReposicao;
  }

  isEditing = false;

  async ngOnInit(): Promise<void> {
    this.listsService.listas$.subscribe((listas) => {
      this.lists = listas.filter(x => x.lists.status !== 'completed').map(x => x.lists);
    });

    await this.defineLastPrice();
    // await this.loadBaseProducts();
    this.setValues();
  }

  private async defineLastPrice() {
    const lastPrice = await this.dbService.getLastPrice(this.itemDispensa.name);
    const priceConverted = UtilsNumber.convertValueToDecimal(lastPrice);
    this.lastPrice$.next(priceConverted ?? 0);
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
    return UtilsMobile.isMobile();
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

      dialogRef.afterClosed().subscribe(async (_) => {
        this.closeHist();
      });
    } else {
      this.isHistOpen = true;
    }
  }

  async openVariacoesModal(itemName: string) {
    if (this.isMobile()) {

      const dialogRef = this.dialog.open(VariacoesModalDialogComponent, {
        data: { itemName },
        width: '100vw',
        height: '100vh',
        maxWidth: '100vw',
        panelClass: 'full-screen-dialog',
      });

      dialogRef.afterClosed().subscribe(async (_) => {
        this.closeVariacoes();
      });
    } else {
      this.isVariacoesOpen = true;
    }
  }

  async closeVariacoes() {
    await this.defineLastPrice();
    this.isVariacoesOpen = false;
    this.closeVars.emit();
  }

  async closeHist() {
    await this.defineLastPrice();
    this.isHistOpen = false;
    this.closeVars.emit();
  }

  onAutoReposicaoChange() {
    this.itemDispensa.category = this.itemDispensa.category !== notReposicao
      ? notReposicao
      : '';

    this.dbService.update(this.itemDispensa.id!, this.itemDispensa);
  }

  // allBaseProducts: string[] = []; // Carregado do banco
  // filteredProducts: string[] = [];
  // selectedBaseProduct: string = '';

  // loadBaseProducts() {
  //   // Carrega produtos base (ex.: "Leite", "Cereal")
  //   db.productMappings.toArray().then((mappings) => {
  //     this.allBaseProducts = mappings.map((m) => m.baseProduct);
  //   });
  // }
  // filterProducts(value: string) {
  //   const filterValue = value.toLowerCase();
  //   this.filteredProducts = this.allBaseProducts.filter((product) =>
  //     product.toLowerCase().includes(filterValue)
  //   );
  // }
  // handleBlur() {
  //   if (!this.allBaseProducts.includes(this.selectedBaseProduct)) {
  //     // Cria nova classificação
  //     this.createNewMapping(this.selectedBaseProduct);
  //   }
  // }
  // createNewMapping(baseProduct: string) {
  //   db.productMappings.put({
  //     userDefined: true,
  //     baseProduct,
  //     synonyms: [],
  //     exclusions: [],
  //   });
  // }
  // approveClassification(product) {
  //   const mapping = this.getMappingByCategory(product.suggestedCategory);
  //   if (mapping) {
  //     mapping.synonyms.push(product.name);
  //     db.productMappings.put(mapping);
  //   }
  // }

  // rejectClassification(product) {
  //   const mapping = this.getMappingByCategory(product.suggestedCategory);
  //   if (mapping) {
  //     mapping.exclusions.push(product.name);
  //     db.productMappings.put(mapping);
  //   }
  // }
}

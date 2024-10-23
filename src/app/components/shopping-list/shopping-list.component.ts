import { Component, EventEmitter, Inject, Input, OnInit, Optional, Output } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ShoppingListEditComponent } from '../shopping-list-edit/shopping-list-edit.component';
import { ShoppingItem, ShoppingList } from 'src/app/models/interfaces';

import { db } from 'src/app/db/model-db';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { SearchDialogComponent } from '../search-dialog/search-dialog.component';
import { Utils } from 'src/app/utils/util';
import { ItemShoppingListService } from 'src/app/services/item-shopping-list.service';

@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.scss']
})

export class ShoppingListComponent implements OnInit {
  @Input() idLista: number = 0;
  @Output() closeEmit = new EventEmitter<void>();
  private list: ShoppingList = {} as ShoppingList;
  private items: ShoppingItem[] = [];

  get listNome(): string {
    return this.list.nome;
  }

  get itemListWait(): ShoppingItem[] {
    return this.items.filter(x => !x.completed);
  }

  get itemListDone(): ShoppingItem[] {
    return this.items.filter(x => x.completed);
  }

  get subtotalValue(): number {
    return this.itemListDone.reduce((total, item) => {
      if (item.preco) {
        return total + item.preco * (item.quantidade || 1);
      }
      return total;
    }, 0);
  }

  get totalValue(): number {
    return this.items.reduce((total, item) => {
      if (item.preco) {
        return total + item.preco * (item.quantidade || 1);
      }
      return total;
    }, 0);
  }

  constructor(
    @Optional() private readonly dialog: MatDialog,
    private readonly bottomSheet: MatBottomSheet,
    private readonly itemShoppingListService: ItemShoppingListService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any // Aqui você recebe os dados

  ) { }

  ngOnInit(): void {
    if (this.data) {
      this.idLista = this.data.idLista;
    }
    this.itemShoppingListService.listas$.subscribe((listas) => {
      if (listas.length) {
        const selectedList = listas.find(x => x.shopping.id === this.idLista);

        if (selectedList) {
          this.list = selectedList.shopping;
          this.items = selectedList.itens;
        }
      }
    });
  }

  openSearch(): void {
    if (this.isMobile()) {
      const dialogRef = this.dialog.open(SearchDialogComponent, {
        width: '100vw',
        height: '100vh',
        maxWidth: '100vw',
        panelClass: 'full-screen-dialog',
      });

      dialogRef.afterClosed().subscribe((result: unknown) => {
        this.closeSearch();
      });
    } else {
      // Abre o painel lateral em telas grandes
      this.isSearchOpen = true;
    }
  }

  addItem() {
    this.openSearch();
  }
  isSearchOpen = false; // Controle para saber se o painel de busca está aberto

  closeSearch() {
    this.isSearchOpen = false;
  }

  isMobile(): boolean {
    return Utils.isMobile();
  }

  editItem(item: ShoppingItem, items: ShoppingItem[], index: number): void {
    const bottomSheetRef = this.bottomSheet.open(ShoppingListEditComponent, {
      data: { itemsList: items, currentIndex: index },
      // disableClose: true
    });

    bottomSheetRef.afterDismissed().subscribe(result => {
      if (result) {
        Object.assign(item, result);
      }
    });
  }

  private startX = 0;
  private currentX = 0;
  private isSwiping = false;
  private threshold = 75; // Limite de deslocamento para ativar o comportamento de swipe

  // Captura a posição inicial do toque
  onTouchStart(event: TouchEvent, item: ShoppingItem): void {
    this.startX = event.touches[0].clientX;
    this.isSwiping = true;
  }

  // Captura o movimento durante o swipe e aplica o deslocamento visual
  onTouchMove(event: TouchEvent, item: any): void {
    if (!this.isSwiping) return;

    this.currentX = event.touches[0].clientX;
    const deltaX = this.currentX - this.startX;

    // Aplica o deslocamento temporário ao item sendo swipado
    if (deltaX > 0) { // Swipe para a direita
      item.translateX = deltaX;

      // Mostra o ícone de completado se o swipe ultrapassar o threshold
      item.showCompleteIcon = deltaX > this.threshold;
    }
  }

  // Finaliza o swipe e decide se o item deve ser marcado como completado
  onTouchEnd(item: any): void {
    const deltaX = this.currentX - this.startX;

    // Se o swipe for maior que o threshold, marca o item como completado
    if (deltaX > this.threshold) {
      this.completeItem(item);
    }

    // Reseta o estado do swipe e a posição visual do item
    item.translateX = 0;
    item.showCompleteIcon = false; // Esconde o ícone após o swipe
    this.isSwiping = false;
  }

  completeItem(item: ShoppingItem): void {
    item.completed = !item.completed;
    db.shoppingItems.update(item.id!, item);
  }

  isEditing = false;
  editingName: string = '';

  enableEditing() {
    this.isEditing = true;
    this.editingName = this.list.nome;
  }

  updateName() {
    if (this.editingName.trim() !== '') {
      this.list.nome = this.editingName;
      db.shoppingLists.update(this.list.id!, this.list);
    }

    this.isEditing = false;
  }
}

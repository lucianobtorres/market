import { Component, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ShoppingListEditComponent } from '../shopping-list-edit/shopping-list-edit.component';
import { ShoppingItem } from 'src/app/models/interfaces';
import { ShoppingItemService } from 'src/app/services/shopping-item.service';

import { db } from 'src/app/db/model-db';
import { liveQuery } from 'dexie';
import { MatDialog } from '@angular/material/dialog';
import { SearchListComponent } from '../search-list/search-list.component';
import { SearchDialogComponent } from '../search-dialog/search-dialog.component';

@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.scss']
})

export class ShoppingListComponent implements OnInit {
  public itemsShopping$ = liveQuery(() => db.shoppingItems.toArray());
  private items: ShoppingItem[] = [];

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
    private readonly dbService: ShoppingItemService,
    private readonly dialog: MatDialog,
    private readonly bottomSheet: MatBottomSheet,
  ) { }

  ngOnInit(): void {
    this.itemsShopping$.subscribe((itens) => {
      this.items = itens;
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
    return window.innerWidth < 768;
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
}

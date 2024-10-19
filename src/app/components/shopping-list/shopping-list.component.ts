import { Component, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ShoppingListEditComponent } from '../shopping-list-edit/shopping-list-edit.component';
import { ShoppingItem } from 'src/app/models/interfaces';
import { ShoppingItemService } from 'src/app/services/shopping-item.service';

import { db } from 'src/app/db/model-db';
import { liveQuery } from 'dexie';
import { MatDialog } from '@angular/material/dialog';
import { SearchItemsComponent } from '../search-items/search-items.component';

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
    const dialogRef = this.dialog.open(SearchItemsComponent, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      panelClass: 'full-screen-dialog'
    });

    dialogRef.afterClosed().subscribe((result: unknown) => {
      console.log(result, 'Search dialog closed');
      const newItem: ShoppingItem = {
        nome: 'New Item',
        quantidade: 1,
        completed: false,
      };
      this.dbService.add(newItem);
      this.items.push(newItem);
      this.editItem(newItem, this.itemListWait, this.itemListWait.indexOf(newItem));
    });
  }

  addItem() {
    this.openSearch();
  }

  editItem(item: ShoppingItem, items: ShoppingItem[], index: number): void {
    const bottomSheetRef = this.bottomSheet.open(ShoppingListEditComponent, {
      data: { itemsList: items, currentIndex: index },
      disableClose: true
    });

    bottomSheetRef.afterDismissed().subscribe(result => {
      if (result) {
        Object.assign(item, result);
      }
    });
  }
}

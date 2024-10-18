import { Component, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ShoppingListEditComponent } from '../shopping-list-edit/shopping-list-edit.component';
import { ShoppingItem } from 'src/app/models/interfaces';

import { db } from 'src/app/db/model-db';
import { liveQuery } from 'dexie';

@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.scss']
})

export class ShoppingListComponent implements OnInit {
  public itemsShopping$ = liveQuery(() => db.shoppingItems.toArray());
  private items: ShoppingItem[] = [];

  public get itemListWait(): ShoppingItem[] {
    return this.items.filter(x => !x.completed);
  }

  public get itemListDone(): ShoppingItem[] {
    return this.items.filter(x => x.completed);
  }

  get totalValue(): number {
    return this.items.reduce((total, item) => {
      if (item.preco) {
        return total + item.preco * (item.quantidade || 1);
      }
      return total;
    }, 0);
  }

  constructor(private bottomSheet: MatBottomSheet) { }

  ngOnInit(): void {
    this.itemsShopping$.subscribe((itens) => {
      this.items = itens;
    });
  }

  addItem() {
    const newItem: ShoppingItem = {
      id: this.items.length + 1,
      nome: 'New Item',
      quantidade: 1,
      completed: false,
    };
    this.items.push(newItem);
    this.editItem(newItem, this.items.indexOf(newItem));
  }

  removeItem(id: number) {
    this.items = this.items.filter(item => item.id !== id);
  }

  editItem(item: ShoppingItem, index: number): void {
    const bottomSheetRef = this.bottomSheet.open(ShoppingListEditComponent, {
      data: { itemsList: this.items, currentIndex: index },
      disableClose: true
    });

    bottomSheetRef.afterDismissed().subscribe(result => {
      if (result) {
        // Atualiza o item com os novos valores
        Object.assign(item, result);
      }
    });
  }
}

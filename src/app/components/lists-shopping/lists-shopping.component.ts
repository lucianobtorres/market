import { Component } from '@angular/core';
import { liveQuery } from 'dexie';
import { db } from 'src/app/db/model-db';
import { ItemShoppingList, ShoppingItem, ShoppingList } from 'src/app/models/interfaces';

@Component({
  selector: 'app-lists-shopping',
  templateUrl: './lists-shopping.component.html',
  styleUrls: ['./lists-shopping.component.scss'],
})
export class ListsShoppingComponent {
  public listasShopping$ = liveQuery(() => db.shoppingLists.toArray());
  public itensShopping$ = liveQuery(() => db.shoppingItems.toArray());
  public listas: ShoppingList[] = [];
  public itens: ShoppingItem[] = [];
  public itensList: ItemShoppingList[] = [];

  ngOnInit(): void {
    this.itensShopping$.subscribe((itens) => {
      this.itens = itens;
    });

    this.listasShopping$.subscribe((itens) => {
      this.listas = itens;

      this.listas.map(shop => {
        const itensFromList: ShoppingItem[] = this.itens.filter(x => x.shoppingListId === shop.id) ?? [];
        this.itensList.push({
          shopping: shop,
          itens: itensFromList
        });
      });
    });
  }
}

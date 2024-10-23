import { Injectable } from '@angular/core';
import { db } from '../db/model-db';
import { liveQuery } from 'dexie';
import { ShoppingList, ShoppingItem, ItemShoppingList } from '../models/interfaces';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ItemShoppingListService {
  private listasSubject$ = new BehaviorSubject<ItemShoppingList[]>([]);
  public listas$ = this.listasSubject$.asObservable();

  private currentLists: ShoppingList[] = [];
  private currentItems: ShoppingItem[] = [];

  constructor() {
    this.loadData();
  }

  private loadData() {
    // Subscribing to shopping items using liveQuery
    liveQuery(() => db.shoppingItems.toArray()).subscribe(itens => {
      this.currentItems = itens;
      this.combineData();
    });

    // Subscribing to shopping lists using liveQuery
    liveQuery(() => db.shoppingLists.toArray()).subscribe(lists => {
      this.currentLists = lists;
      this.combineData();
    });
  }

  private combineData() {
    // If both lists and items are available, combine them
    if (this.currentLists.length && this.currentItems.length) {
      const combinedLists = this.currentLists.map(list => ({
        shopping: list,
        itens: this.currentItems.filter(item => item.shoppingListId === list.id)
      }));

      // Emit the combined data to the BehaviorSubject
      this.listasSubject$.next(combinedLists);
    }
  }
}

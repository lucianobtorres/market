import { Injectable } from '@angular/core';
import { db } from '../db/model-db';
import { liveQuery } from 'dexie';
import { BehaviorSubject, Observable } from 'rxjs';
import { Items, ItemShoppingList, Lists } from '../models/interfaces';


@Injectable({
  providedIn: 'root'
})
export class ItemShoppingListService {
  private listasSubject$ = new BehaviorSubject<ItemShoppingList[]>([]);
  get listas$(): Observable<ItemShoppingList[]> {
    return this.listasSubject$.asObservable();
  }

  private loaded = false;

  private currentLists: Lists[] = [];
  private currentItems: Items[] = [];

  constructor() {
    this.loadData();
  }

  private loadData() {
    // Subscribing to shopping lists using liveQuery
    liveQuery(() => db.lists.toArray()).subscribe(lists => {
      this.currentLists = lists;
      this.loaded ||= true;
      this.combineData();
    });

    // Subscribing to shopping items using liveQuery
    liveQuery(() => db.items.toArray()).subscribe(itens => {
      this.currentItems = itens;
      this.loaded ||= true;
      this.combineData();
    });
  }

  private combineData() {
    if (!this.loaded) {
      return;
    }

    console.info("Dados carregados:", this.currentLists, this.currentItems);

    if (this.currentLists.length || this.currentItems.length) {
      const combinedLists = this.currentLists.map(list => ({
        lists: list,
        itens: this.currentItems.filter(item => item.listId === list.id)
      }));

      this.listasSubject$.next(combinedLists);
    } else {
      this.listasSubject$.next([]);
    }
  }
}

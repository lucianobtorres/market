import { Component } from '@angular/core';
import { ItemShoppingList } from 'src/app/models/interfaces';
import { ItemShoppingListService } from 'src/app/services/item-shopping-list.service';

@Component({
  selector: 'app-lists-shopping',
  templateUrl: './lists-shopping.component.html',
  styleUrls: ['./lists-shopping.component.scss'],
})
export class ListsShoppingComponent {
  public itensList: ItemShoppingList[] = [];

  constructor(private readonly itemShoppingListService: ItemShoppingListService) { }

  ngOnInit(): void {
    this.itemShoppingListService.listas$.subscribe((listas) => {
      this.itensList = listas;
    });
  }
}

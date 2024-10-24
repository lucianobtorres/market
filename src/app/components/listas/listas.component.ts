import { AfterViewInit, Component, OnInit, TemplateRef } from '@angular/core';
import { db } from 'src/app/db/model-db';
import { ItemShoppingList } from 'src/app/models/interfaces';
import { ItemShoppingListService } from 'src/app/services/item-shopping-list.service';
import { UtilArray } from 'src/app/utils/utils-array';

@Component({
  selector: 'app-listas',
  templateUrl: './listas.component.html',
  styleUrls: ['./listas.component.scss'],
})
export class ListasComponent implements OnInit{
  public itensList: ItemShoppingList[] = [];

  constructor(private readonly itemShoppingListService: ItemShoppingListService) { }
  ngOnInit(): void {
    this.itemShoppingListService.listas$.subscribe((listas) => {
      console.log(listas)
      this.itensList = listas;
    });
  }

  novaLista() {
    db.shoppingLists.add({ nome: "Nova Lista" });
  }
}

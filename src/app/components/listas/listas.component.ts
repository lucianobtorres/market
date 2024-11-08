import { Component, OnInit } from '@angular/core';
import { db } from 'src/app/db/model-db';
import { ItemShoppingList } from 'src/app/models/interfaces';
import { ItemListService } from 'src/app/services/item-list.service';

@Component({
  selector: 'app-listas',
  templateUrl: './listas.component.html',
  styleUrls: ['./listas.component.scss'],
})
export class ListasComponent implements OnInit {
  public itensList: ItemShoppingList[] = [];

  constructor(private readonly listsService: ItemListService) { }
  ngOnInit(): void {
    this.listsService.listas$.subscribe((listas) => {
      this.itensList = listas.filter(x => x.lists.status !== 'completed');
    });
  }

  novaLista() {
    db.lists.add({ name: "Nova Lista", status: 'active', createdDate: new Date });
  }
}

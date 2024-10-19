import { OnInit, Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { liveQuery } from 'dexie';
import { debounceTime } from 'rxjs';
import { db } from 'src/app/db/model-db';
import { BoughtItems, ConfigItems, ShoppingItem } from 'src/app/models/interfaces';
import { ItemUnit } from 'src/app/models/shopping-item';
import { ShoppingItemService } from 'src/app/services/shopping-item.service';

@Component({
  selector: 'app-search-items',
  templateUrl: './search-items.component.html',
  styleUrls: ['./search-items.component.scss']
})
export class SearchItemsComponent implements OnInit {

  searchControl = new FormControl();
  items: ConfigItems[] = []; // Itens que serão mostrados conforme a busca
  filteredItems: BoughtItems[] = []; // Itens que serão mostrados conforme a busca
  shoppingList: ShoppingItem[] = [];

  public itemsSearch$ = liveQuery(() => db.boughtItems.toArray());
  public itemsShopping$ = liveQuery(() => db.shoppingItems.toArray());

  constructor(
    private readonly dbService: ShoppingItemService,
    private readonly dialogRef: MatDialogRef<SearchItemsComponent>,
  ) { }

  ngOnInit() {
    this.searchControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe(value => {
        this.getFilteredItems(value);
      });

    this.itemsSearch$.subscribe((itens) => {
      this.updateAddingStatus(itens);
    });

    this.itemsShopping$.subscribe((itens) => {
      this.shoppingList = itens;
      this.updateAddingStatus(this.shoppingList);
    });
  }

  ngAfterViewInit() {
    this.sortFilter();
  }

  updateAddingStatus(itemsList: ConfigItems[]) {
    if (!this.shoppingList || !this.filteredItems) return;

    const itemsToAdd = itemsList.filter(item =>
      !this.items.some(x => x.nome === item.nome)
    );

    itemsToAdd.forEach(item => this.items.push(item));

    if (this.searchControl.pristine) {
      this.filteredItems = this.items as [];
    }

    this.filteredItems.forEach(item => {
      item.adding = !(this.shoppingList.some(shoppingItem => shoppingItem.nome === item.nome));
    });

    this.sortFilter();
  }

  closeSearch(): void {
    this.dialogRef.close(); // Fechar a busca
  }

  sortFilter() {
    this.filteredItems.sort((a, b) => a.nome.localeCompare(b.nome));
  }

  async getFilteredItems(searchTerm: string) {
    if (!searchTerm) {
      this.filteredItems = this.items as BoughtItems[];
      return;
    }

    const filtro = this.items.filter(x => x.nome.toLowerCase().includes(searchTerm.toLowerCase()));
    this.filteredItems = filtro.length
      ? filtro as BoughtItems[]
      : [{
        nome: searchTerm,
        adding: true,
        dataCompra: new Date(),
      }]
  }

  async toggleItem(item: BoughtItems) {
    const isInList = this.shoppingList.find(shoppingItem => shoppingItem.nome === item.nome);

    if (isInList && isInList.id) {
      console.log('enco')
      await this.dbService.delete(isInList.id);
    } else {

      const itemFound  = this.items.find(x => x.nome === item.nome);
      if (!itemFound) {

      }

      const itemAdd: ShoppingItem = !itemFound ?{
        nome: item.nome,
        quantidade: 1,
        completed: false,
        unidade: item.unidade ?? ItemUnit.UN
      } : itemFound as ShoppingItem

      await this.dbService.add(itemAdd);
      this.updateAddingStatus([itemAdd])
    }
  }
}

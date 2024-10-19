import { OnInit, Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { debounceTime } from 'rxjs';
import { db } from 'src/app/db/model-db';
import { BoughtItems } from 'src/app/models/interfaces';

@Component({
  selector: 'app-search-items',
  templateUrl: './search-items.component.html',
  styleUrls: ['./search-items.component.scss']
})
export class SearchItemsComponent implements OnInit {
  constructor(public dialogRef: MatDialogRef<SearchItemsComponent>) { }
  searchControl = new FormControl();
  filteredItems: BoughtItems[] = []; // Itens que serão mostrados conforme a busca

  async ngOnInit() {
    // Monitorar mudanças na busca
    this.searchControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe(async value => {
        this.filteredItems = await getFilteredItems(value);
      });
  }

  closeSearch(): void {
    this.dialogRef.close(); // Fechar a busca
  }

  // Método para adicionar item à lista de compras
  addItemToShoppingList(item: any) {
    console.log('Adicionar item:', item);
    // Aqui você deve implementar a lógica para adicionar o item à lista de compras
  }

  // Método opcional para remover item (se necessário)
  removeItem(id: number) {
    // Implemente a lógica para remover o item aqui, se necessário
  }
}

async function getFilteredItems(searchTerm: string) {
  const items = await db.boughtItems
    .where("nome")
    .startsWithIgnoreCase(searchTerm)
    .toArray();

  return items;
}

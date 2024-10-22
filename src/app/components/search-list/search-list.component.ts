import { OnInit, Component, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { liveQuery } from 'dexie';
import { BehaviorSubject, debounceTime } from 'rxjs';
import { db } from 'src/app/db/model-db';
import { ShoppingItem } from 'src/app/models/interfaces';
import { ItemUnit } from 'src/app/models/shopping-item';
import { ShoppingItemService } from 'src/app/services/shopping-item.service';
import { CombinedItem } from '../search-list-item/search-list-item.component';

@Component({
  selector: 'app-search-list',
  templateUrl: './search-list.component.html',
  styleUrls: ['./search-list.component.scss']
})
export class SearchListComponent implements OnInit {
  @Output() closeEmit = new EventEmitter<void>();
  private items = new BehaviorSubject<CombinedItem[]>([]);
  private shoppingList: ShoppingItem[] = [];
  protected showBarCode = false;
  protected searchControl = new FormControl();
  protected filteredItems: CombinedItem[] = [];

  private itemsSearch$ = liveQuery(() => db.boughtItems.toArray());
  private itemsShopping$ = liveQuery(() => db.shoppingItems.toArray());

  constructor(
    private readonly dbService: ShoppingItemService,
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

  private updateAddingStatus(itemsList: CombinedItem[]) {
    if (!this.shoppingList) return;

    // Filtra os itens que não estão na lista atual
    const itemsToAdd = itemsList.filter(item =>
      !this.items.value.some(x => x.nome === item.nome)
    );

    // Atualiza cada item com as propriedades necessárias
    this.items.next(
      [...this.items.value, ...itemsToAdd].map(item => {
        return this.ajustaDadosItem(item);
      })
    );

    // Atualiza filteredItems apenas se o campo de busca estiver limpo
    if (this.searchControl.pristine) {
      this.filteredItems = this.items.value;
    }

    // Atualiza o estado 'adding' e 'quantidade' para cada item em filteredItems
    this.filteredItems = this.filteredItems.map(item => {
      return this.ajustaDadosItem(item);
    });

    this.sortFilter();
  }

  private ajustaDadosItem(item: CombinedItem) {
    const isInShoppingList = this.shoppingList.find(shoppingItem => shoppingItem.nome === item.nome);
    return {
      ...item,
      adding: !isInShoppingList, // Define 'adding' como verdadeiro se não estiver na lista
      quantidade: isInShoppingList ? isInShoppingList.quantidade : this.getIncrement(item.unidade),
      completed: isInShoppingList ? isInShoppingList.completed : false,
      id: isInShoppingList ? isInShoppingList.id : undefined,
      preco: isInShoppingList ? isInShoppingList.preco: item.preco,
      unidade: isInShoppingList ? isInShoppingList.unidade: item.unidade,
    };
  }

  private sortFilter() {
    this.filteredItems.sort((a, b) => {
      // Definindo a prioridade para os estados dos itens
      const getStatusPriority = (item: CombinedItem) => {
        if (item.completed) return 3; // Itens completados no final
        if (!item.adding) return 2;   // Itens já adicionados ficam no meio
        return 1;                     // Itens que ainda serão adicionados no topo
      };

      const statusComparison = getStatusPriority(a) - getStatusPriority(b);

      // Se os itens tiverem a mesma prioridade de status, ordene por nome
      if (statusComparison === 0) {
        return a.nome.localeCompare(b.nome);
      }

      return statusComparison;
    });
  }


  private getFilteredItems(searchTerm: string) {
    if (!searchTerm) {
      this.filteredItems = this.items.value;
      this.sortFilter();
      return;
    }

    const filtro = this.items.value.filter(x => x.nome.toLowerCase().includes(searchTerm.toLowerCase()));
    this.filteredItems = filtro.length
      ? filtro
      : [{
        nome: searchTerm,
        adding: true,
        dataCompra: new Date(),
        quantidade: 1,
        unidade: ItemUnit.UN
      }];

      this.sortFilter();
  }

  async toggleItem(item: CombinedItem) {
    const isInList = this.shoppingList.find(shoppingItem => shoppingItem.nome === item.nome);

    if (isInList && isInList.id) {
      // Se o item já está na lista, removê-lo
      await this.dbService.delete(isInList.id);
    } else {
      // Se o item não está na lista, adicioná-lo
      const itemFound = this.items.value.find(x => x.nome === item.nome);
      const minValue = this.getIncrement(item.unidade);

      // Se o item não foi encontrado na lista de pesquisa, crie um novo
      const itemAdd: ShoppingItem = itemFound ? {
        ...itemFound,
        quantidade: item.quantidade,
        completed: item.completed ?? false,
        preco: item.preco,
        unidade: item.unidade
      } : {
        nome: item.nome,
        quantidade: item.quantidade || minValue,
        completed: false,
        unidade: item.unidade ?? ItemUnit.UN
      };

      await this.dbService.add(itemAdd);
      this.updateAddingStatus([itemAdd]);
    }
  }

  async qtdChanged(somar: boolean, item: CombinedItem) {
    const itemToUpdate = item.id ? item : this.items.value.find(x => x.nome === item.nome);

    if (itemToUpdate?.id) {
      await db.shoppingItems
        .where("id")
        .equals(itemToUpdate.id)
        .modify(item => {
          if (!item.quantidade) {
            item.quantidade = this.getIncrement(item.unidade);
          } else {
            const qtdToChange = this.getIncrement(item.unidade);
            if (somar) item.quantidade += qtdToChange;
            else {
              item.quantidade -= qtdToChange;
              if (item.quantidade < qtdToChange) {
                item.quantidade = qtdToChange;
              }
            }
          }
        });
    }
  }

  async itemChanged(itemToUpdate: CombinedItem) {
    if (itemToUpdate?.id) {
      await db.shoppingItems
        .where("id")
        .equals(itemToUpdate.id)
        .modify(item => {
          item.quantidade = itemToUpdate.quantidade;
          item.preco = itemToUpdate.preco;
          item.unidade = itemToUpdate.unidade;
        });
    }
  }

  private getIncrement(unidade: ItemUnit): number {
    switch (unidade) {
      case ItemUnit.KG:
      case ItemUnit.G:
        return 0.5;
      case ItemUnit.L:
      case ItemUnit.ML:
        return 0.1
      default:
        return 1;
    }
  }

  toggleBarCode() {
    this.showBarCode = !this.showBarCode;
  }

  onProdutoEncontrado(code: string) {
    this.searchControl.setValue(code);
    this.searchControl.markAsDirty();
    this.searchControl.markAsTouched();
  }
}

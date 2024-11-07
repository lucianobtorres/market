import { OnInit, Component, Output, EventEmitter, Input, Optional, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { liveQuery } from 'dexie';
import { BehaviorSubject, debounceTime } from 'rxjs';
import { db } from 'src/app/db/model-db';
import { CombinedItem, Items } from 'src/app/models/interfaces';
import { ItemUnit } from 'src/app/models/item-unit';
import { ItemsService } from 'src/app/services/db/items.service';

@Component({
  selector: 'app-search-list',
  templateUrl: './search-list.component.html',
  styleUrls: ['./search-list.component.scss']
})
export class SearchListComponent implements OnInit {
  @Input() idLista: number = 0;
  @Output() closeEmit = new EventEmitter<void>();
  private items = new BehaviorSubject<CombinedItem[]>([]);
  private shoppingList: Items[] = [];
  protected showBarCode = false;
  protected searchControl = new FormControl();
  protected filteredItems: CombinedItem[] = [];

  private itemsSearch$ = liveQuery(() => db.purchases.toArray());
  private itemsShopping$ = liveQuery(() => db.items.toArray());

  constructor(
    private readonly dbService: ItemsService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { idLista: number }
  ) { }

  ngOnInit() {
    if (this.data) {
      this.idLista = this.data.idLista;
    }

    this.searchControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe(value => {
        this.getFilteredItems(value);
      });

    this.itemsSearch$.subscribe((itens) => {
      this.updateAddingStatus(itens);
    });

    this.itemsShopping$.subscribe((itens) => {
      this.shoppingList = itens.filter(x => x.listId === this.idLista);
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
      !this.items.value.some(x => x.name === item.name)
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
    const isInShoppingList = this.shoppingList.find(shoppingItem => shoppingItem.name === item.name);
    return {
      ...item,
      adding: !isInShoppingList, // Define 'adding' como verdadeiro se não estiver na lista
      quantidade: isInShoppingList ? isInShoppingList.quantity : this.getIncrement(item.unit),
      completed: isInShoppingList ? isInShoppingList.isPurchased : false,
      id: isInShoppingList ? isInShoppingList.id : undefined,
      preco: isInShoppingList ? isInShoppingList.price : item.price,
      unidade: isInShoppingList ? isInShoppingList.unit : item.unit,
      shoppingListId: this.idLista
    };
  }

  private sortFilter() {
    this.filteredItems.sort((a, b) => {
      // Definindo a prioridade para os estados dos itens
      const getStatusPriority = (item: CombinedItem) => {
        if (item.isPurchased) return 3; // Itens completados no final
        if (!item.adding) return 2;   // Itens já adicionados ficam no meio
        return 1;                     // Itens que ainda serão adicionados no topo
      };

      const statusComparison = getStatusPriority(a) - getStatusPriority(b);

      // Se os itens tiverem a mesma prioridade de status, ordene por nome
      if (statusComparison === 0) {
        return a.name.localeCompare(b.name);
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

    // Filtra os itens com base no termo de busca
    const filtro = this.items.value.filter(x =>
      x.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Verifica se existe um item com nome exatamente igual ao termo de busca
    const itemExato = filtro.find(x => x.name.toLowerCase() === searchTerm.toLowerCase());

    // Se não houver um item exatamente igual, inclui o item digitado na lista de resultados
    this.filteredItems = itemExato
      ? filtro
      : [
        ...filtro,
        {
          name: searchTerm,
          adding: true,
          purchaseDate: new Date(),
          quantity: 1,
          unit: ItemUnit.UNID,
          listId: this.idLista
        }
      ];

    this.sortFilter();
  }


  async toggleItem(item: CombinedItem) {
    const isInList = this.shoppingList.find(shoppingItem => shoppingItem.name === item.name);

    if (isInList && isInList.id) {
      // Se o item já está na lista, removê-lo
      await this.dbService.delete(isInList.id);
    } else {
      // Se o item não está na lista, adicioná-lo
      const itemFound = this.items.value.find(x => x.name === item.name);
      const minValue = this.getIncrement(item.unit);

      // Se o item não foi encontrado na lista de pesquisa, crie um novo
      const itemAdd: Items = itemFound
        ? {
          ...itemFound,
          quantity: item.quantity,
          isPurchased: item.isPurchased ?? false,
          price: item.price,
          unit: item.unit,
          listId: this.idLista,
          addedDate: item.addedDate ?? new Date(),
        }
        : {
          name: item.name,
          quantity: item.quantity || minValue,
          isPurchased: false,
          unit: item.unit ?? ItemUnit.UNID,
          listId: this.idLista,
          addedDate: new Date(),
        };

      await this.dbService.add(itemAdd);
      this.updateAddingStatus([itemAdd]);
    }
  }

  async qtdChanged(somar: boolean, item: CombinedItem) {
    const itemToUpdate = item.id ? item : this.items.value.find(x => x.name === item.name);

    if (itemToUpdate?.id) {
      await db.items
        .where("id")
        .equals(itemToUpdate.id)
        .modify(item => {
          if (!item.quantity) {
            item.quantity = this.getIncrement(item.unit);
          } else {
            const qtdToChange = this.getIncrement(item.unit);
            if (somar) item.quantity += qtdToChange;
            else {
              item.quantity -= qtdToChange;
              if (item.quantity < qtdToChange) {
                item.quantity = qtdToChange;
              }
            }
          }
        });
    }
  }

  async itemChanged(itemToUpdate: CombinedItem) {
    if (itemToUpdate?.id) {
      await db.items
        .where("id")
        .equals(itemToUpdate.id)
        .modify(item => {
          item.quantity = itemToUpdate.quantity;
          item.price = itemToUpdate.price;
          item.unit = itemToUpdate.unit;
        });
    }
  }

  private getIncrement(unidade: ItemUnit): number {
    switch (unidade) {
      case ItemUnit.KG:
      case ItemUnit.GRAMAS:
        return 1;
      case ItemUnit.LITRO:
      case ItemUnit.ML:
        return 1
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

  onInformarPreco(price: string) {
    const preco = this.parsePrice(price);

    const itensAdd = this.filteredItems.filter(x => !x.adding);
    if (itensAdd.length) {
      itensAdd[0].price = Number(preco);
      this.itemChanged(itensAdd[0]);
    }
  }

  private parsePrice(price: string): number {
    // Remove o símbolo "R$", espaços extras e substitui "," por "."
    const sanitizedPrice = price.replace(/R\$\s?/, '').replace(',', '.').trim();

    // Converte para número e retorna o resultado
    return parseFloat(sanitizedPrice);
  }
}

import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Inventory, ItemShoppingList, ProductMapping } from 'src/app/models/interfaces';
import { db } from 'src/app/db/model-db';
import { Router } from '@angular/router';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { DispensaItemDetalhesComponent } from './dispensa-item-detalhe/dispensa-item-detalhes.component';
import { ItemUnitDescriptions } from 'src/app/models/item-unit';
import { BehaviorSubject, combineLatest, debounceTime, map, Observable } from 'rxjs';
import { ItemListService } from 'src/app/services/item-list.service';
import { FormControl } from '@angular/forms';
import { ROTAS } from 'src/app/app-routing.module';
import { groupInventory } from './group-inventory';


export const notReposicao = 'disabled';

@Component({
  selector: 'app-dispensa',
  templateUrl: './dispensa.component.html',
  styleUrls: ['./dispensa.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DispensaComponent implements OnInit {
  isSearchExpanded = false;
  protected searchControl = new FormControl();
  searchTerm$ = new BehaviorSubject<string>('');
  private productListSubject = new BehaviorSubject<ProductMapping[]>([]);
  private inventoryListSubject = new BehaviorSubject<groupInventory[]>([]);
  inventoryList$ = this.inventoryListSubject.asObservable();
  groupedInventory$ = new Observable<{ [unit: string]: groupInventory[] }>();

  @ViewChild('campoSearch') campoSearch!: ElementRef;
  constructor(
    private readonly router: Router,
    private bottomSheet: MatBottomSheet,
    private itemListService: ItemListService
  ) {
    this.loadData();

    this.groupedInventory$ = combineLatest([
      this.inventoryList$,
      this.itemListService.listasCorrentes$,
      this.searchTerm$]).pipe(
        map(([inventoryList, listasCorrentes, searchTerm]) => {
          if (!searchTerm.trim()) {
            return this.groupByUnit(inventoryList, listasCorrentes);
          }
          const filteredInventory = inventoryList.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
          );

          return this.groupByUnit(filteredInventory, listasCorrentes);
        })
      );
  }
  ngOnInit() {
    this.searchControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe(value => {
        this.searchTerm$.next(value);
      });
  }

  toggleSearch() {
    this.isSearchExpanded = !this.isSearchExpanded;
    if (this.isSearchExpanded) {
      setTimeout(() => {
        const inputElement = this.campoSearch.nativeElement;
        inputElement.select();
        inputElement.focus();
      }, 200);
    }
  }

  closeSearch() {
    setTimeout(() => {
      this.isSearchExpanded = false;
      this.searchControl.setValue('');
      this.searchTerm$.next("");
    }, 200);
  }

  selectText(input: HTMLInputElement) {
    input.select();
  }

  async loadData() {
    await db.productMappings.toArray().then(items => {
      this.productListSubject.next(items);
    });

    const groupedMap: Map<string, groupInventory> = new Map();

    await db.inventory.toArray().then(items => {
      items.forEach(item => {
        if (item.category === notReposicao && item.currentQuantity === 0) return;

          const group = this.productListSubject.value.find(mapping =>
            mapping.baseProduct.trim().toLowerCase() === item.name.trim().toLowerCase() ||
            mapping.synonyms.some(synonym => synonym.toLowerCase() === item.name.trim().toLowerCase())
          );

          const baseName = group?.baseProduct || item.name.trim();

          if (!groupedMap.has(baseName)) {
            groupedMap.set(baseName, new groupInventory());
          }

          const groupInventoryInstance = groupedMap.get(baseName);
          if (group && group.baseProduct.trim().toLowerCase() === item.name.trim().toLowerCase()) {
            groupInventoryInstance!.itens.unshift(item);
          } else {
            groupInventoryInstance!.itens.push(item);
          }
      });
    });

    console.log('groupedMap', groupedMap)
    const mappedItems = new Set(this.productListSubject.value.flatMap(x => x.synonyms.map(s => s.toLowerCase())));
    const values = Array.from(groupedMap.values()).filter(x => !mappedItems.has(x.name.toLowerCase()))
    this.inventoryListSubject.next(values);
  }

  groupByUnit(
    inventoryList: groupInventory[],
    listasCorrentes: ItemShoppingList[]
  ): { [unit: string]: groupInventory[] } {
    const grouped: { [unit: string]: groupInventory[] } = {};
    const replenishmentItems: groupInventory[] = [];

    // Cria um Set com os nomes dos itens presentes nas listas correntes
    const activeItemNames = new Set(
      listasCorrentes.flatMap(list => list.itens.map(item => item.name))
    );

    inventoryList.forEach(groupItem => {
      groupItem.inCurrentList = activeItemNames.has(groupItem.name);
      const needsReplenishment = groupItem.currentQuantity === 0 || groupItem.inCurrentList;

      if (needsReplenishment) {
        replenishmentItems.push(groupItem);
      } else {
        const unitDescription = ItemUnitDescriptions.get(groupItem.unit) || groupItem.unit;
        if (!grouped[unitDescription]) {
          grouped[unitDescription] = [];
        }
        grouped[unitDescription].push(groupItem);
      }
    });

    // Ordena cada grupo de itens por nome
    Object.keys(grouped).forEach(unit => {
      grouped[unit].sort((a, b) => a.name.localeCompare(b.name));
    });

    // Ordena os itens de reposição por nome
    replenishmentItems.sort((a, b) => a.name.localeCompare(b.name));

    return { Reposição: replenishmentItems, ...grouped };
  }

  inCurrentList(item: unknown): boolean {
    return (item as { inCurrentList: boolean })?.inCurrentList ?? false;
  }

  trackById(_: number, item: Inventory): number {
    return item.id!;
  }

  navigatePerfil() {
    this.router.navigate([ROTAS.perfil]);
  }

  openBottomSheet(item: groupInventory): void {
    const bottomRef = this.bottomSheet.open(DispensaItemDetalhesComponent, {
      data: { item: item.itens[0], qtdVars: item.variacoesQuantity },
    });

    bottomRef.instance.closeVars.subscribe(() => this.loadData());
    bottomRef.afterDismissed().subscribe(() => this.loadData());
  }
}


import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Inventory, ItemShoppingList } from 'src/app/models/interfaces';
import { db } from 'src/app/db/model-db';
import { Router } from '@angular/router';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { DispensaItemDetalhesComponent } from './dispensa-item-detalhe/dispensa-item-detalhes.component';
import { ItemUnitDescriptions } from 'src/app/models/item-unit';
import { BehaviorSubject, combineLatest, debounceTime, map, Observable } from 'rxjs';
import { ItemListService } from 'src/app/services/item-list.service';
import { FormControl } from '@angular/forms';
import { ROTAS } from 'src/app/app-routing.module';


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

  private inventoryListSubject = new BehaviorSubject<Inventory[]>([]);
  inventoryList$ = this.inventoryListSubject.asObservable();
  groupedInventory$ = new Observable<{ [unit: string]: Inventory[] }>();

  @ViewChild('campoSearch') campoSearch!: ElementRef;
  constructor(
    private readonly router: Router,
    private bottomSheet: MatBottomSheet,
    private itemListService: ItemListService
  ) {
    this.loadInventory();

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

  loadInventory() {
    db.inventory.toArray().then(items => {
      this.inventoryListSubject.next(items);
    });
  }

  groupByUnit(inventoryList: Inventory[], listasCorrentes: ItemShoppingList[]): { [unit: string]: Inventory[] } {
    const grouped: { [unit: string]: Inventory[] } = {};
    const replenishmentItems: Inventory[] = [];

    // Cria um Set com os IDs dos itens presentes nas listas correntes
    const activeItemIds = new Set(listasCorrentes.flatMap(list => list.itens.map(item => item.name)));

    inventoryList.forEach(item => {
      // Adiciona a propriedade 'inCurrentList' com base na presença do item em listas correntes
      const itemWithStatus = { ...item, inCurrentList: activeItemIds.has(item.name) };

      if (item.currentQuantity === 0 || itemWithStatus.inCurrentList) {
        replenishmentItems.push(itemWithStatus);
      } else {
        const unitDescription = ItemUnitDescriptions.get(item.unit) || item.unit;
        if (!grouped[unitDescription]) {
          grouped[unitDescription] = [];
        }
        grouped[unitDescription].push(itemWithStatus);
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

  openBottomSheet(item: Inventory): void {
    this.bottomSheet.open(DispensaItemDetalhesComponent, {
      data: item,
    }).afterDismissed().subscribe(() => this.loadInventory());
  }
}

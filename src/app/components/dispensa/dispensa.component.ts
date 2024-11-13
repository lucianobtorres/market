import { ChangeDetectionStrategy, Component } from '@angular/core';
import { liveQuery } from 'dexie';
import { Inventory, ItemShoppingList } from 'src/app/models/interfaces';
import { db } from 'src/app/db/model-db';
import { Router } from '@angular/router';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { DispensaItemDetalhesComponent } from './dispensa-item-detalhe/dispensa-item-detalhes.component';
import { ItemUnitDescriptions } from 'src/app/models/item-unit';
import { BehaviorSubject, combineLatest, map, Observable, tap } from 'rxjs';
import { ItemListService } from 'src/app/services/item-list.service';


@Component({
  selector: 'app-dispensa',
  templateUrl: './dispensa.component.html',
  styleUrls: ['./dispensa.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DispensaComponent {
  private inventoryListSubject = new BehaviorSubject<Inventory[]>([]);
  inventoryList$ = this.inventoryListSubject.asObservable();
  groupedInventory$ = new Observable<{ [unit: string]: Inventory[] }>();

  constructor(
    private readonly router: Router,
    private bottomSheet: MatBottomSheet,
    private itemListService: ItemListService
  ) {
    this.loadInventory();

    this.groupedInventory$ = combineLatest([this.inventoryList$, this.itemListService.listasCorrentes$]).pipe(
      map(([inventoryList, listasCorrentes]) => this.groupByUnit(inventoryList, listasCorrentes))
    );

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

      if (item.currentQuantity === 0) {
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

  trackById(index: number, item: Inventory): number {
    return item.id!;
  }

  navigatePerfil() {
    this.router.navigate(['perfil']);
  }

  openBottomSheet(item: Inventory): void {
    this.bottomSheet.open(DispensaItemDetalhesComponent, {
      data: item,
    }).afterDismissed().subscribe(() => this.loadInventory());
  }
}

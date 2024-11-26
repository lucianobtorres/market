import { Component, ChangeDetectionStrategy, OnInit, ViewChild, ElementRef, Renderer2 } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { Router } from "@angular/router";
import { BehaviorSubject, Observable, combineLatest, map, debounceTime } from "rxjs";
import { db } from "src/app/db/model-db";
import { Inventory, Items, ItemShoppingList, Lists, PurchaseHistory, PurchaseItem } from "src/app/models/interfaces";
import { ItemUnitDescriptions } from "src/app/models/item-unit";
import { ItemListService } from "src/app/services/item-list.service";
import { HistoricoItemDetalhesComponent } from "./historico-detalhe/historico-item-detalhes.component";
import { PurchaseHistoryService } from "src/app/services/db/purchases-history.service";
import { liveQuery } from "dexie";
import { instanceOfMapLocate, MapLocate } from "src/app/services/map.service";
import { MatIcon } from "@angular/material/icon";
import { ROTAS } from "src/app/app-routing.module";
import { UtilsNumber } from "src/app/utils/utils-number";
import { DialogArgs, ConfirmDialogComponent } from "../shared/confirm-dialog/confirm-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { FormLEditItemHistoricoComponent } from "./form-edit-item copy/form-edit-item.component";
import { FormLEditHistoricoComponent } from "./form-edit-history/form-edit-history.component";

export interface PurchaseHistoryRecord extends PurchaseHistory {
  mercado?: MapLocate,
  listName: string,
  totalPrice: number,
  qtdItens: number,
}

function instanceOfPurchaseHistoryRecord(obj: unknown): obj is PurchaseHistoryRecord {
  if (typeof obj === 'string') {
    obj = JSON.parse(obj);
  }
  return (<PurchaseHistoryRecord>obj).id !== undefined &&
    (<PurchaseHistoryRecord>obj).dateCompleted !== undefined &&
    (<PurchaseHistoryRecord>obj).items !== undefined;
}

@Component({
  selector: 'app-historico',
  templateUrl: './historico.component.html',
  styleUrls: ['./historico.component.scss'],
})
export class HistoricoComponent implements OnInit {
  protected arrayItems$ = new BehaviorSubject<PurchaseHistoryRecord[]>([]);
  private itens$ = liveQuery(() => db.purchasesHistory.toArray());
  showSubItems = false;

  constructor(
    private readonly router: Router,
    private bottomSheet: MatBottomSheet,
    private itemListService: ItemListService,
    private dbService: PurchaseHistoryService,
    private dialog: MatDialog,
    private readonly renderer: Renderer2,
  ) { }

  ngOnInit() {
    this.itens$.subscribe(async (itens: PurchaseHistory[]) => {
      const allRecords: PurchaseHistoryRecord[] = await Promise.all(
        itens.map(async (item) => {
          const lista = await this.getLista(item);
          return {
            ...item,
            mercado: item.store ? JSON.parse(item.store) : undefined,
            listName: lista?.name ?? 'Lista sem nome',
            totalPrice: this.getTotal(item),
            qtdItens: item.items.length,
          } as PurchaseHistoryRecord;

        })
      );
      allRecords.push(...allRecords);
      allRecords.push(...allRecords);
      this.arrayItems$.next(allRecords.sort((a, b) => b.dateCompleted.getTime() - a.dateCompleted.getTime()));
    });
  }

  async getLista(item: PurchaseHistory): Promise<Lists | undefined> {
    return await db.lists
      .where('id')
      .equals(item.listId)
      .first();
  }

  getTotal(item: PurchaseHistory): number {
    return item.items.reduce((total, item) => {
      if (item.price) {
        return total + (UtilsNumber.convertValueToDecimal(item.price) ?? 0) * (item.quantity || 1);
      }
      return total;
    }, 0);
  }

  getPrice(item: PurchaseItem): number {
    return UtilsNumber.convertValueToDecimal(item.price) ?? 0;
  }

  navigatePerfil() {
    this.router.navigate([ROTAS.perfil]);
  }

  protected getNomeMercado(store: string): string | undefined {
    if (!store.length) return undefined;
    const mapLocate = JSON.parse(store);

    if (instanceOfMapLocate(mapLocate)) {
      console.log(mapLocate.name)
      return mapLocate.name;
    }

    return undefined;
  }

  togglePurchaseItems(elementItems: HTMLElement, elementIcon: MatIcon) {
    const isVisible = elementItems.style.display !== 'none';

    if (!isVisible) {
      this.renderer.removeStyle(elementItems, 'display');
      this.renderer.addClass(elementIcon._elementRef.nativeElement, 'rotated');
    }
    else {
      this.renderer.setStyle(elementItems, 'display', 'none');
      this.renderer.removeClass(elementIcon._elementRef.nativeElement, 'rotated');
    }
  }

  itemIsRecord(item: unknown): PurchaseHistoryRecord | undefined {
    if (instanceOfPurchaseHistoryRecord(item)) return item;
    return undefined;
  }

  editItem(item: PurchaseHistoryRecord, purchaseItems: PurchaseItem[], index: number): void {
    const bottomSheetRef = this.bottomSheet.open(FormLEditItemHistoricoComponent, {
      data: { id: item.id, itemsList: purchaseItems, currentIndex: index },
      // disableClose: true
    });

    bottomSheetRef.afterDismissed().subscribe(result => {
      if (result) {
        Object.assign(item, result);
      }
    });
  }

  editar(item: PurchaseHistoryRecord) {
    const bottomSheetRef = this.bottomSheet.open(FormLEditHistoricoComponent, {
      data: { item: item },
      // disableClose: true
    });

    bottomSheetRef.afterDismissed().subscribe(result => {
      if (result) {
        Object.assign(item, result);
      }
    });
  }

  confirmRemove(item: PurchaseHistoryRecord) {
    const data: DialogArgs = {
      message: 'Tem certeza que deseja remover o histórico?',
      action: 'Remover',
      class: 'warn'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: 'auto',
      data: data,
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result === true) {
        await this.dbService.delete(item.id!);
      }
    });
  }

  trackByFnHistory(index: number, item: PurchaseHistoryRecord): any {
    return item.id; // Identificador único
  }

  trackByFnItem(index: number, item: PurchaseItem): any {
    return item.id; // Identificador único
  }
}

import { Component, EventEmitter, Inject, Input, OnInit, Optional, Output } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject, map, Observable, startWith } from 'rxjs';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { db } from 'src/app/db/model-db';
import { Inventory, ProductMapping } from 'src/app/models/interfaces';
import { ItemUnitDescriptions } from 'src/app/models/item-unit';
import { DispensaItemDetalhesComponent } from '../dispensa/dispensa-item-detalhe/dispensa-item-detalhes.component';
import { FormControl } from '@angular/forms';


@Component({
  selector: 'app-variacoes-modal',
  templateUrl: './variacoes-modal.component.html',
  styleUrls: ['./variacoes-modal.component.scss']
})
export class VariacoesModalComponent implements OnInit {
  @Output() closeEmit = new EventEmitter<void>();
  @Input() itemName!: string;
  produto!: ProductMapping;
  private sinonimosProductSubject = new BehaviorSubject<Inventory[]>([]);
  private inventoryListSubject = new BehaviorSubject<Inventory[]>([]);
  private productListSubject = new BehaviorSubject<ProductMapping[]>([]);
  sinonimosProduct$ = this.sinonimosProductSubject.asObservable();
  groupedInventory$ = new Observable<{ [unit: string]: Inventory[] }>();
  filteredOptions = new Observable<string[]>();
  formVariacao = new FormControl('');

  constructor(
    private bottomSheet: MatBottomSheet,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { itemName: string },
  ) {
    if (this.data) {
      this.itemName = this.data.itemName;
    }

    this.loadData();

    this.groupedInventory$ = this.sinonimosProduct$.pipe(
        map((sinonimoList) => {
          return this.groupByUnit(sinonimoList);
        })
      );
  }

  ngOnInit(): void {
    this.filteredOptions = this.formVariacao.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
  }

  async loadData() {
    await db.productMappings.toArray().then(items => {
      this.productListSubject.next([]);

      const produto = items.find(x => x.baseProduct === this.itemName);
      if (produto) this.produto = produto;
      else this.produto = { baseProduct: this.itemName, synonyms: [], exclusions: [], userDefined: true }

      this.productListSubject.next(items);
    });

    await db.inventory.toArray().then(items => {
      const mappedItems = new Set(
        this.productListSubject.value.flatMap(product => [
          product.baseProduct.toLowerCase(),
          ...product?.synonyms?.map(synonym => synonym.toLowerCase()),
        ])
      );

      this.inventoryListSubject.next(
        items.filter(x =>
          x.name.trim().toLowerCase() !== this.itemName.trim().toLowerCase() &&
          !mappedItems.has(x.name.trim().toLowerCase())
        ));

      const sinonimosProduct = new Set(this.produto.synonyms.map(s => s.toLowerCase()));

      this.sinonimosProductSubject.next(
        items.filter(x =>
          sinonimosProduct.has(x.name.trim().toLowerCase())
        ));
    });
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    const itemFiltred = this.inventoryListSubject.value.filter(option =>
      option.name.toLowerCase().includes(filterValue)
    );

    return itemFiltred?.map(x => x.name.trim());
  }

  groupByUnit(sinonimoList: Inventory[]): { [unit: string]: Inventory[] } {
    const grouped: { [unit: string]: Inventory[] } = {};

    sinonimoList.forEach(item => {
      const unitDescription = ItemUnitDescriptions.get(item.unit) || item.unit;
      if (!grouped[unitDescription]) {
        grouped[unitDescription] = [];
      }

      grouped[unitDescription].push(item);
    });

    // Ordena cada grupo de itens por nome
    Object.keys(grouped).forEach(unit => {
      grouped[unit].sort((a, b) => a.name.trim().localeCompare(b.name.trim()));
    });

    return grouped;
  }

  async adicionar() {
    if (!this.formVariacao.valid ||
      !this.formVariacao.value ||
      this.itemName === this.formVariacao.value.trim()
    ) return;

    const value = this.formVariacao.value.toLowerCase().trim();
    if (!value) return;

    const itemList = this.inventoryListSubject.value.find(x => x.name.trim().toLowerCase() === value.trim().toLowerCase())
    if (!itemList) return;

    this.produto.synonyms.push(value);
    await db.productMappings.put(this.produto, undefined)

    this.formVariacao.setValue('');
    this.loadData();
  }

  trackById(_: number, item: Inventory): number {
    return item.id!;
  }

  openBottomSheet(item: Inventory): void {
    const dialogRef = this.bottomSheet.open(DispensaItemDetalhesComponent, {
      data: { item, grouped: true },
    });

    dialogRef.instance.desagrupar.subscribe(async (item) => {
      const sinonimos = this.produto.synonyms.filter(x => x.toLowerCase() != item.toLowerCase());

      if (sinonimos.length){
        this.produto.synonyms = sinonimos;
        await db.productMappings.put(this.produto, undefined);
      }
      else {
        await db.productMappings.delete(this.produto.id!);
      }
    });
    dialogRef.afterDismissed().subscribe(() => this.loadData());
  }
}

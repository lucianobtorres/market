import { AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { ItemUnit } from 'src/app/models/item-unit';
import { Inventory, Items, nameof } from 'src/app/models/interfaces';
import { ItemsService } from 'src/app/services/db/items.service';
import { UtilsNumber } from 'src/app/utils/utils-number';
import { BarcodeScannerAddComponent } from '../barcode-scanner-add/barcode-scanner-add.component';
import { db } from 'src/app/db/model-db';
import { BehaviorSubject, map, Observable, startWith } from 'rxjs';


interface FormAddShopping {
  nome: FormControl<string>;
  quantidade: FormControl<number>;
  unidade: FormControl<ItemUnit | null>;
  preco: FormControl<number | null>;
  anotacao: FormControl<string | null>;
}

@Component({
  selector: 'app-form-add-item',
  templateUrl: './form-add-item.component.html',
  styleUrls: ['./form-add-item.component.scss']
})
export class FormAddItemComponent implements OnInit, AfterViewInit {
  editForm!: FormGroup<FormAddShopping>;
  expanded = false;
  idLista = 0;
  units = Object.values(ItemUnit);
  filteredOptions = new Observable<string[]>();
  protected showBarCode = false;
  @ViewChild("campoFoco") campoFoco!: ElementRef;
  @ViewChild("scanner") scanner!: BarcodeScannerAddComponent;
  private inventoryListSubject = new BehaviorSubject<Inventory[]>([]);

  public get valorCalculado() {
    return (UtilsNumber.convertValueToDecimal(this.editForm.value.preco?.toString()) ?? 0) * (this.editForm.controls.quantidade?.value ?? 1);
  }

  constructor(
    private readonly fb: FormBuilder,
    private readonly dbService: ItemsService,
    private readonly bottomSheetRef: MatBottomSheetRef<FormAddItemComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: { idLista: number }
  ) {
    this.idLista = data.idLista;
    this.setValues();
  }

  async ngOnInit(): Promise<void> {
    await db.inventory.toArray().then(items => this.inventoryListSubject.next(items));

    this.filteredOptions = this.editForm.controls.nome.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const inputElement = this.campoFoco.nativeElement;
      inputElement.select();
      inputElement.focus();
    }, 200);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    const itemFiltred = this.inventoryListSubject.value.filter(option =>
      option.name.toLowerCase().includes(filterValue)
    );

    return itemFiltred?.map(x => x.name);
  }

  private setValues() {
    this.editForm = this.fb.group({
      nome: this.fb.nonNullable.control('', Validators.required),
      quantidade: this.fb.nonNullable.control(1, [Validators.required, Validators.min(1)]),
      unidade: [ItemUnit.UNID, Validators.required],
      preco: [Number(0), [Validators.min(0)]],
      anotacao: ['']
    });

    if (this.scanner) {
      this.scanner.limparImage();
    }
  }

  async saveCurrentItem() {
    if (this.editForm.valid) {
      const updatedItem: Items = {
        isPurchased: false,
        name: this.editForm.value.nome ?? '',
        quantity: this.editForm.value.quantidade ?? 1,
        price: UtilsNumber.convertValueToDecimal(this.editForm.value.preco?.toString()),
        unit: this.editForm.value.unidade ?? ItemUnit.UNID,
        notas: this.editForm.value.anotacao ?? undefined,
        listId: this.idLista,
        addedDate: new Date(),
      };

      const existingItem = await db.items
        .where(nameof<Items>('listId'))
        .equals(this.idLista)
        .and(item => item.name === updatedItem.name).first();

      if (!existingItem) this.dbService.add(updatedItem);
      else {
        updatedItem.quantity = updatedItem.quantity! + existingItem.quantity!;
        this.dbService.update(existingItem.id!, updatedItem);
      }
    }
  }

  close(): void {
    this.bottomSheetRef.dismiss();
  }

  goToNextItem() {
    this.saveCurrentItem();
    this.setValues();
  }

  increase(event: Event) {
    event.stopPropagation();
    this.editForm.value.quantidade;
    this.editForm.controls.quantidade.setValue((this.editForm.value.quantidade ?? 0) + 1);
  }

  decrease(event: Event) {
    event.stopPropagation();
    if (this.editForm.value.quantidade === 1) return;

    this.editForm.controls.quantidade.setValue((this.editForm.value.quantidade ?? 0) - 1);
  }

  toggleBarCode() {
    this.showBarCode = !this.showBarCode;
  }

  onProdutoEncontrado(code: string) {
    this.editForm.controls.nome.setValue(code);
    this.editForm.controls.nome.markAsDirty();
    this.editForm.controls.nome.markAsTouched();
  }

  onInformarPreco(price: string) {
    const preco = this.parsePrice(price);
    this.editForm.controls.preco.setValue(preco);
  }

  private parsePrice(price: string): number {
    // Remove o símbolo "R$", espaços extras e substitui "," por "."
    const sanitizedPrice = price.replace(/R\$\s?/, '').replace(',', '.').trim();

    // Converte para número e retorna o resultado
    return parseFloat(sanitizedPrice);
  }
}

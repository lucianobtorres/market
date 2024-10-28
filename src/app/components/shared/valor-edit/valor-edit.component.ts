import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { ItemUnit } from 'src/app/models/item-unit';
import { ShoppingItem } from 'src/app/models/interfaces';
import { ShoppingItemService } from 'src/app/services/shopping-item.service';
import { Subject } from 'rxjs';


export interface FormEdicaoValor {
  quantidade: FormControl<number>;
  unidade: FormControl<ItemUnit | null>;
  preco: FormControl<number | null>;
}

@Component({
  selector: 'app-valor-edit',
  templateUrl: './valor-edit.component.html',
  styleUrls: ['./valor-edit.component.scss']
})
export class ValorEditComponent implements AfterViewInit, OnInit, OnDestroy {
  editForm!: FormGroup<FormEdicaoValor>;
  units = Object.values(ItemUnit);

  @ViewChild("campoFoco") campoFoco!: ElementRef;
  public get item(): ShoppingItem {
    return this.itemsList[this.currentIndex];
  }

  itemsList: ShoppingItem[] = [];
  private _currentIndex = 0;
  public get valorCalculado() {
    return (this.editForm.controls.preco?.value ?? 0) * (this.editForm.controls.quantidade?.value ?? 1);
  }

  public get currentIndex() {
    return this._currentIndex;
  }

  public set currentIndex(value) {
    this._currentIndex = value;
    this.setValues();
  }

  @ViewChild('bottomSheetContent') bottomSheetContent!: ElementRef;
  @ViewChild('preco_input', { static: false }) inputField!: ElementRef;
  private ngUnsubscribe = new Subject<void>();
  private keyboardOpen = false;

  ngOnInit() {
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.handleResize.bind(this));
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private handleResize() {
    const isKeyboardOpen = window.innerHeight < 600; // Ajuste este valor conforme necessário
    if (isKeyboardOpen && !this.keyboardOpen) {
      this.keyboardOpen = true;
      // O teclado está aberto, dê foco ao campo
      setTimeout(() => this.inputField.nativeElement.focus(), 300); // Atraso para permitir que o teclado apareça
    } else if (!isKeyboardOpen) {
      this.keyboardOpen = false;
    }
  }

  constructor(
    private readonly fb: FormBuilder,
    private readonly dbService: ShoppingItemService,
    private readonly bottomSheetRef: MatBottomSheetRef<ValorEditComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: { item: ShoppingItem }
  ) {
    this.itemsList = [data.item];
    this.currentIndex = 0;
  }


  onInputFocus(): void {
    // Ajusta a posição do bottom sheet quando o campo é focado
    const bottomSheetElement = this.bottomSheetContent.nativeElement;
    bottomSheetElement.style.transform = 'translateY(-200px)'; // Ajuste conforme necessário
  }

  onInputBlur(): void {
    // Retorna a posição do bottom sheet ao desfocar
    const bottomSheetElement = this.bottomSheetContent.nativeElement;
    bottomSheetElement.style.transform = 'translateY(0)';
  }

  ngAfterViewInit(): void {
    const inputElement = this.campoFoco.nativeElement;
    inputElement.select();
  }

  private setValues() {
    const data: ShoppingItem = this.item;
    this.editForm = this.fb.group({
      quantidade: this.fb.nonNullable.control(data.quantidade || 1, [Validators.required, Validators.min(1)]),
      unidade: [data.unidade || 'un' as ItemUnit, Validators.required],
      preco: [data.preco || 0, [Validators.min(0)]],
    });
  }

  saveCurrentItem() {
    if (this.editForm.valid) {
      const updatedItem: ShoppingItem = {
        id: this.item.id,
        completed: this.item.completed,
        nome: this.item.nome ?? '',
        quantidade: this.editForm.value.quantidade ?? 1,
        preco: this.editForm.value.preco ?? undefined,
        unidade: this.editForm.value.unidade ?? ItemUnit.UNIDADE,
        notas: this.item.notas,
        shoppingListId: this.item.shoppingListId
      };

      this.dbService.update(this.item.id!, updatedItem, 'atualizado..');
      this.itemsList[this.currentIndex] = updatedItem;
    }
  }

  save(): void {
    this.saveCurrentItem();
  }

  close(): void {
    this.bottomSheetRef.dismiss();
  }
}

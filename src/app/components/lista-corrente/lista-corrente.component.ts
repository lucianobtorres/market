import { Component, EventEmitter, Inject, Input, OnInit, Optional, Output } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { FormListaCorrenteItemComponent } from './form-lista-corrente-item/form-lista-corrente-item.component';
import { Items, Lists, PurchaseHistory } from 'src/app/models/interfaces';

import { db } from 'src/app/db/model-db';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { SearchDialogComponent } from '../search-list/search-dialog/search-dialog.component';
import { UtilsMobile } from 'src/app/utils/utils-mobile';
import { ItemListService } from 'src/app/services/item-list.service';
import { InventoryService } from 'src/app/services/db/inventory.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { FormAddItemComponent } from './form-add-item/form-add-item.component';

@Component({
  selector: 'app-lista-corrente',
  templateUrl: './lista-corrente.component.html',
  styleUrls: ['./lista-corrente.component.scss']
})

export class ListaCorrenteComponent implements OnInit {
  @Input() idLista: number = 0;
  @Output() closeEmit = new EventEmitter<void>();
  private list: Lists = {} as Lists;
  private items: Items[] = [];

  get listNome(): string {
    return this.list.name;
  }

  get itemListWait(): Items[] {
    return this.items.filter(x => !x.isPurchased);
  }

  get itemListDone(): Items[] {
    return this.items.filter(x => x.isPurchased);
  }

  get subtotalValue(): number {
    return this.itemListDone.reduce((total, item) => {
      if (item.price) {
        return total + item.price * (item.quantity || 1);
      }
      return total;
    }, 0);
  }

  get totalValue(): number {
    return this.items.reduce((total, item) => {
      if (item.price) {
        return total + item.price * (item.quantity || 1);
      }
      return total;
    }, 0);
  }

  constructor(
    @Optional() private readonly dialog: MatDialog,
    private readonly bottomSheet: MatBottomSheet,
    private readonly inventoryService: InventoryService,
    private readonly listsService: ItemListService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { idLista: number }
  ) { }

  // private touchStartX = 0;
  // private touchEndX = 0;

  // onBackTouchStart = (event: TouchEvent): void => {
  //   this.touchStartX = event.changedTouches[0].screenX;
  // };

  // onBackTouchEnd = (event: TouchEvent): void => {
  //   this.touchEndX = event.changedTouches[0].screenX;
  //   this.handleSwipe();
  // };

  // handleSwipe(): void {
  //   // Verifica se o swipe foi para a direita
  //   if (this.touchEndX > this.touchStartX + 50) { // Threshold de 50px
  //     this.closeDialogIfOpen();
  //   }
  // }

  // closeDialogIfOpen(): void {
  //   // Fecha o diálogo se estiver aberto
  //   console.log(this.dialog.openDialogs)
  //   if (this.dialog.openDialogs.length > 0) {
  //     this.dialog.closeAll();
  //   }
  // }

  // ngOnDestroy(): void {
  //   // Remove os eventos ao destruir o componente
  //   document.removeEventListener('touchstart', this.onBackTouchStart);
  //   document.removeEventListener('touchend', this.onBackTouchEnd);
  // }

  ngOnInit(): void {
    // Adiciona os eventos de toque
    // document.addEventListener('touchstart', this.onBackTouchStart);
    // document.addEventListener('touchend', this.onBackTouchEnd);

    if (this.data) {
      this.idLista = this.data.idLista;
    }

    this.listsService.listas$.subscribe((listas) => {
      if (listas.length) {
        const selectedList = listas.find(x => x.lists.id === this.idLista);

        if (selectedList) {
          this.list = selectedList.lists;
          this.items = selectedList.itens;
        }
      }
    });
  }

  openSearch(): void {
    if (this.isMobile()) {
      const dialogRef = this.dialog.open(SearchDialogComponent, {
        data: { idLista: this.idLista },
        width: '100vw',
        height: '100vh',
        maxWidth: '100vw',
        panelClass: 'full-screen-dialog',
      });

      dialogRef.afterClosed().subscribe((_: unknown) => {
        this.closeSearch();
      });
    } else {
      // Abre o painel lateral em telas grandes
      this.isSearchOpen = true;
    }
  }

  addItem() {
    // this.openSearch();
    this.bottomSheet.open(FormAddItemComponent, {
      data: { idLista: this.idLista }
    });
  }

  isSearchOpen = false; // Controle para saber se o painel de busca está aberto

  closeSearch() {
    this.isSearchOpen = false;
  }

  isMobile(): boolean {
    return UtilsMobile.isMobile();
  }

  editItem(item: Items, items: Items[], index: number): void {
    const bottomSheetRef = this.bottomSheet.open(FormListaCorrenteItemComponent, {
      data: { itemsList: items, currentIndex: index },
      // disableClose: true
    });

    bottomSheetRef.afterDismissed().subscribe(result => {
      if (result) {
        Object.assign(item, result);
      }
    });
  }

  arquivarCompra() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: 'auto',
      data: {
        message: 'Quer transferir os itens comprados para dispensa?'
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.colocaComprasNaDispensa();
      }
    });
  }

  async comprarTudo() {
    const listaId = this.list.id;

    await db.items
      .where('listId')
      .equals(listaId!)
      .and(item => !item.isPurchased)
      .modify(item => {
        item.isPurchased = true;
      });
  }

  async devolverTudo() {
    const listaId = this.list.id;

    await db.items
      .where('listId')
      .equals(listaId!)
      .and(item => item.isPurchased)
      .modify(item => {
        item.isPurchased = false;
      });
  }

  async colocaComprasNaDispensa() {
    const listaId = this.list.id;
    const itensComprados = await db.items
      .where('listId')
      .equals(listaId!)
      .and(item => item.isPurchased)
      .toArray();

    const itensPendentes = await db.items
      .where('listId')
      .equals(listaId!)
      .and(item => !item.isPurchased)
      .toArray();

    if (!itensPendentes.length) {
      await db.lists.update(listaId!, { status: 'completed' });
    }

    if (!itensComprados.length) {
      return;
    }

    const historico: PurchaseHistory = {
      listId: listaId!,
      dateCompleted: new Date(),
      items: []
    };

    const items = itensComprados.map(item => ({
      itemId: item.id ?? 0,
      name: item.name,
      quantity: item.quantity ?? 1,
      unit: item.unit,
      price: item.price,
      adding: false,
      purchaseDate: new Date()
    }))

    if (items.length) {
      historico.items = items;
      await db.items
        .where('listId')
        .equals(listaId!)
        .and(item => item.isPurchased)
        .delete();
    }

    await db.purchasesHistory.add(historico);
    this.inventoryService.insertInventory(historico);
    this.closeEmit.emit();
  }

  private startX = 0;
  private currentX = 0;
  private isSwiping = false;
  private threshold = 75; // Limite de deslocamento para ativar o comportamento de swipe

  private async removerLista(listaId: number | undefined) {
    await db.lists.delete(listaId!);
    await db.items
      .where('listId')
      .equals(listaId!)
      .delete();
  }

  // Captura a posição inicial do toque
  onTouchStart(event: TouchEvent, item: Items): void {
    this.startX = event.touches[0].clientX;
    this.isSwiping = true;
  }

  // Captura o movimento durante o swipe e aplica o deslocamento visual
  onTouchMove(event: TouchEvent, item: any): void {
    if (!this.isSwiping) return;

    this.currentX = event.touches[0].clientX;
    const deltaX = this.currentX - this.startX;

    // Aplica o deslocamento temporário ao item sendo swipado
    if (deltaX > 0) { // Swipe para a direita
      item.translateX = deltaX;

      // Mostra o ícone de completado se o swipe ultrapassar o threshold
      item.showCompleteIcon = deltaX > this.threshold;
    }
  }

  // Finaliza o swipe e decide se o item deve ser marcado como completado
  onTouchEnd(item: any): void {
    const deltaX = this.currentX - this.startX;

    // Se o swipe for maior que o threshold, marca o item como completado
    if (deltaX > this.threshold) {
      this.completeItem(item);
    }

    // Reseta o estado do swipe e a posição visual do item
    item.translateX = 0;
    item.showCompleteIcon = false; // Esconde o ícone após o swipe
    this.isSwiping = false;
  }

  completeItem(item: Items): void {
    item.isPurchased = !item.isPurchased;
    db.items.update(item.id!, item);
  }

  isEditing = false;
  editingName: string = '';

  enableEditing() {
    this.isEditing = true;
    this.editingName = this.list.name;
  }

  updateName() {
    if (this.editingName.trim() !== '') {
      this.list.name = this.editingName;
      db.lists.update(this.list.id!, this.list);
    }

    this.isEditing = false;
  }
}

import { Component, HostListener, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { db } from 'src/app/db/model-db';
import { ItemShoppingList } from 'src/app/models/interfaces';
import { Utils } from 'src/app/utils/util';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { ItemListService } from 'src/app/services/item-list.service';

@Component({
  selector: 'app-listas-item',
  templateUrl: './listas-item.component.html',
  styleUrls: ['./listas-item.component.scss'],
})
export class ListItemComponent {
  @Input() item!: ItemShoppingList;

  public get qtdItens(): string {
    const qtd = this.item.itens.length;
    const done = this.item.itens.filter(x => x.isPurchased)?.length ?? 0;

    if (qtd < 1) return `lista vazia`
    else if (done === 0 && qtd === 1) return `${qtd} item`
    else if (done === 0 && qtd > 1) return `${qtd} itens`
    else if (done === qtd) return `${qtd} finalizado`
    else return `${done} de ${qtd} itens`;
  }

  get subtotalValue(): number {
    return this.item.itens
      .filter(x => x.isPurchased)
      ?.reduce((total, item) => {
        if (item.price) {
          return total + item.price * (item.quantity || 1);
        }
        return total;
      }, 0);
  }

  constructor(
    private readonly router: Router,
    private readonly dialog: MatDialog,
    private readonly itemShoppingListService: ItemListService
  ) {
  }

  isMobile(): boolean {
    return Utils.isMobile();
  }

  @HostListener('click')
  abrirLista(): void {
    this.router.navigate(['/lista', `${this.item.lists.id}`]);
  }

  confirmRemove(event: Event) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: 'auto',
      data: { message: 'Tem certeza que deseja remover esta lista?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.delete(this.item.lists.id!);
      }
    });

  }
  delete(idLista: number) {
    db.items.where('listId').equals(idLista).toArray()
      .then(itens => {
        // Remover todos os itens associados
        const deletePromises = itens.map(item => db.items.delete(item.id!));

        // Esperar que todos os itens sejam removidos
        return Promise.all(deletePromises);
      })
      .then(() => {
        // Agora remover a lista
        return db.lists.delete(idLista);
      })
      .catch(error => {
        console.error('Erro ao remover a lista ou os itens:', error);
      });
  }

  onResetShare() {
    const idList = this.item.lists.id;
    if (!idList) return;

    if (this.item.lists.share) this.itemShoppingListService.removeShare(idList);
  }

  onShareList() {
    const idList = this.item.lists.id;
    if (!idList) return;

    this.itemShoppingListService.shareList(idList);
  }
}

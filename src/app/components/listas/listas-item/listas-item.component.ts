import { Component, HostListener, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { db } from 'src/app/db/model-db';
import { ItemShoppingList } from 'src/app/models/interfaces';
import { Utils } from 'src/app/utils/util';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { ItemShoppingListService } from 'src/app/services/item-shopping-list.service';

@Component({
  selector: 'app-listas-item',
  templateUrl: './listas-item.component.html',
  styleUrls: ['./listas-item.component.scss'],
})
export class ListItemComponent {
  @Input() item!: ItemShoppingList;

  public get qtdItens(): string {
    const qtd = this.item.itens.length;
    if (qtd <= 1) return `${qtd} item`
    else return `${qtd} itens`
  }

  constructor(
    private readonly router: Router,
    private readonly dialog: MatDialog,
    private readonly itemShoppingListService: ItemShoppingListService
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

  onShareList() {
    const idList = this.item.lists.id;
    if (!idList) return;
    if (this.item.lists.share) this.itemShoppingListService.removeShare(idList);
    else this.itemShoppingListService.shareList(idList);
  }
}

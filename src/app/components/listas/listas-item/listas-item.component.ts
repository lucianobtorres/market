import { Component, EventEmitter, HostBinding, HostListener, Input, Output, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { db } from 'src/app/db/model-db';
import { ItemShoppingList } from 'src/app/models/interfaces';
import { ToastService } from 'src/app/services/toast.service';
import { Utils } from 'src/app/utils/util';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { MatMenu } from '@angular/material/menu';
import { liveQuery } from 'dexie';

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
    private readonly router: Router, private dialog: MatDialog) {
  }

  isMobile(): boolean {
    return Utils.isMobile();
  }

  @HostListener('click')
  abrirLista(): void {
    this.router.navigate(['/lista', `${this.item.shopping.id}`]);
  }

  confirmRemove(event: Event) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: 'auto',
      data: { message: 'Tem certeza que deseja remover esta lista?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.delete(this.item.shopping.id!);
      }
    });

  }
  delete(idLista: number) {
    db.shoppingItems.where('shoppingListId').equals(idLista).toArray()
    .then(itens => {
      // Remover todos os itens associados
      const deletePromises = itens.map(item => db.shoppingItems.delete(item.id!));

      // Esperar que todos os itens sejam removidos
      return Promise.all(deletePromises);
    })
    .then(() => {
      // Agora remover a lista
      return db.shoppingLists.delete(idLista);
    })
    .catch(error => {
      console.error('Erro ao remover a lista ou os itens:', error);
    });
  }

  onShareList() {
    throw new Error('Method not implemented.');
  }
}

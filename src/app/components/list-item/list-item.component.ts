import { Component, HostBinding, HostListener, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ItemShoppingList } from 'src/app/models/interfaces';
import { Utils } from 'src/app/utils/util';

@Component({
  selector: 'app-list-item',
  templateUrl: './list-item.component.html',
  styleUrls: ['./list-item.component.scss'],
})
export class ListItemComponent {
  @Input() item!: ItemShoppingList;

  public get qtdItens(): string {
    const qtd = this.item.itens.length;
    if (qtd <= 1) return `${qtd} item`
    else return `${qtd} itens`
  }

  constructor(
    private readonly router: Router) {
  }

  isMobile(): boolean {
    return Utils.isMobile();
  }

  @HostListener('click')
  abrirLista(): void {
    this.router.navigate(['/lista', `${this.item.shopping.id}`]);
  }
}

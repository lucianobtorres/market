import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BoughtItems, ShoppingItem } from 'src/app/models/interfaces';

export type CombinedItem = (BoughtItems & Partial<ShoppingItem>) | (ShoppingItem & Partial<BoughtItems>);


@Component({
  selector: 'app-search-list-item',
  templateUrl: './search-list-item.component.html',
  styleUrls: ['./search-list-item.component.scss']
})
export class SearchListItemComponent {
  @Output() qtdChange = new EventEmitter<boolean>();

  @Input() item!: CombinedItem;

  increase(event: Event) {
    event.stopPropagation();
    this.qtdChange.emit(true);
  }

  decrease(event: Event) {
    event.stopPropagation();
    this.qtdChange.emit(false);
  }
}

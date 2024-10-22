import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { BoughtItems, ShoppingItem } from 'src/app/models/interfaces';
import { ValorEditComponent } from '../valor-edit/valor-edit.component';

export type CombinedItem = (BoughtItems & Partial<ShoppingItem>) | (ShoppingItem & Partial<BoughtItems>);


@Component({
  selector: 'app-search-list-item',
  templateUrl: './search-list-item.component.html',
  styleUrls: ['./search-list-item.component.scss']
})
export class SearchListItemComponent {
  @Output() qtdChanged = new EventEmitter<boolean>();
  @Output() itemChanged = new EventEmitter<CombinedItem>();

  @Input() item!: CombinedItem;

  constructor(
    private readonly bottomSheet: MatBottomSheet,) {

  }

  increase(event: Event) {
    event.stopPropagation();
    this.qtdChanged.emit(true);
  }

  decrease(event: Event) {
    event.stopPropagation();
    this.qtdChanged.emit(false);
  }

  editItem(event: Event): void {
    event.stopPropagation();
    const bottomSheetRef = this.bottomSheet.open(ValorEditComponent, {
      data: { item: this.item },
      // disableClose: true
    });

    bottomSheetRef.afterDismissed().subscribe(result => {
      if (result) {
        Object.assign(this.item, result);
        this.itemChanged.emit(this.item);
      }
    });
  }
}

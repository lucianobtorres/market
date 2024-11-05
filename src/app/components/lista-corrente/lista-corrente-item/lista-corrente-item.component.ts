import { Component, Input } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Items } from 'src/app/models/interfaces';
import { ItemsService } from 'src/app/services/db/items.service';
import { ValorEditComponent } from '../../shared/valor-edit/valor-edit.component';

@Component({
  selector: 'app-lista-corrente-item',
  templateUrl: './lista-corrente-item.component.html',
  styleUrls: ['./lista-corrente-item.component.scss'],
})
export class ListaCorrenteItemComponent {
  @Input() item!: Items;

  constructor(
    private readonly dbService: ItemsService,
    private readonly bottomSheet: MatBottomSheet,
  ) { }

  toggleItemComprado(event: Event) {
    event.stopPropagation();
    this.item.isPurchased = !this.item.isPurchased;
    this.dbService.update(
      this.item.id!,
      this.item,
      this.item.isPurchased
        ? `${this.item.name} comprado..`
        : `${this.item.name} devolvido..`);
  }

  removeItem(event: Event) {
    event.stopPropagation();
    this.dbService.delete(this.item.id!);
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
      }
    });
  }
}

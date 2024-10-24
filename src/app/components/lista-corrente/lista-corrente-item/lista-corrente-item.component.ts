import { Component, Input } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ShoppingItem } from 'src/app/models/interfaces';
import { ShoppingItemService } from 'src/app/services/shopping-item.service';
import { ValorEditComponent } from '../../shared/valor-edit/valor-edit.component';

@Component({
  selector: 'app-lista-corrente-item',
  templateUrl: './lista-corrente-item.component.html',
  styleUrls: ['./lista-corrente-item.component.scss'],
})
export class ListaCorrenteItemComponent {
  @Input() item!: ShoppingItem;

  constructor(
    private readonly dbService: ShoppingItemService,
    private readonly bottomSheet: MatBottomSheet,
  ) { }

  toggleItemComprado(event: Event) {
    event.stopPropagation();
    this.item.completed = !this.item.completed;
    this.dbService.update(
      this.item.id!,
      this.item,
      this.item.completed
        ? `${this.item.nome} comprado..`
        : `${this.item.nome} devolvido..`);
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

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ShoppingItem } from 'src/app/models/interfaces';
import { ShoppingItemService } from 'src/app/services/shopping-item.service';

@Component({
  selector: 'app-shopping-item',
  templateUrl: './shopping-item.component.html',
  styleUrls: ['./shopping-item.component.scss'],
})
export class ShoppingItemComponent {
  @Input() item!: ShoppingItem;

  constructor(
    private readonly dbService: ShoppingItemService,
  ) { }

  toggleItemCompletion(event: Event) {
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
}

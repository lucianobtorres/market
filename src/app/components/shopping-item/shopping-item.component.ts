import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ShoppingItem } from 'src/app/models/interfaces';

@Component({
  selector: 'app-shopping-item',
  templateUrl: './shopping-item.component.html',
  styleUrls: ['./shopping-item.component.scss'],
})
export class ShoppingItemComponent {
  @Output() protected removeItem = new EventEmitter<Number>();

  @Input() item!: ShoppingItem;

  toggleItemCompletion(event: Event) {
    event.stopPropagation();
    this.item.completed = !this.item.completed;
  }
}

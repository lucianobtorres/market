import { Component } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ShoppingListEditComponent } from '../shopping-list-edit/shopping-list-edit.component';
import { ItemUnit, ShoppingItem } from 'src/app/models/shopping-item';

@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.scss']
})

export class ShoppingListComponent {
  items: ShoppingItem[] = [
    { id: 1, nome: 'Bananas', quantidade: 5, unidade: ItemUnit.UN, preco: 1.50, completed: false },
    { id: 2, nome: 'Milk', quantidade: 2, unidade: ItemUnit.L, preco: 4.00, completed: false },
    { id: 3, nome: 'Bread', completed: false },
  ];

  get totalValue(): number {
    return this.items.reduce((total, item) => {
      if (item.preco) {
        return total + item.preco * (item.quantidade || 1);
      }
      return total;
    }, 0);
  }

  constructor(private bottomSheet: MatBottomSheet) { }

  addItem() {
    const newItem: ShoppingItem = {
      id: this.items.length + 1,
      nome: 'New Item',
      quantidade: 1,
      completed: false,
    };
    this.items.push(newItem);
  }

  removeItem(id: number) {
    this.items = this.items.filter(item => item.id !== id);
  }

  toggleItemCompletion(id: number) {
    const item = this.items.find(item => item.id === id);
    if (item) {
      item.completed = !item.completed;
    }
  }
  editItem(item: ShoppingItem, index: number): void {
    const bottomSheetRef = this.bottomSheet.open(ShoppingListEditComponent, {
      data: { item: item, itemsList: this.items, currentIndex: index }
    });

    bottomSheetRef.afterDismissed().subscribe(result => {
      if (result) {
        // Atualiza o item com os novos valores
        Object.assign(item, result);
      }
    });
  }
}

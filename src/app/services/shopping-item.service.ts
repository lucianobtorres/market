import { Injectable } from '@angular/core';
import { ShoppingItem } from '../models/interfaces';
import { DBRepository } from '../models/db.repository';
import { ToastService } from './toast.service';
import { db } from '../db/model-db';

@Injectable({
  providedIn: 'root'
})
export class ShoppingItemService extends DBRepository<ShoppingItem> {
  constructor(ts: ToastService) {
    super(ts);
    this.table = db.shoppingItems;
  }
}

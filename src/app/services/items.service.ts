import { Injectable } from '@angular/core';
import { Items } from '../models/interfaces';
import { DBRepository } from '../models/db.repository';
import { ToastService } from './toast.service';
import { db } from '../db/model-db';

@Injectable({
  providedIn: 'root'
})
export class ItemsService extends DBRepository<Items> {
  constructor(ts: ToastService) {
    super(ts);
    this.table = db.items;
  }
}

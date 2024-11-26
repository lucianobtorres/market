import { Injectable } from '@angular/core';
import { PurchaseHistory } from '../../models/interfaces';
import { DBRepository } from '../../models/db.repository';
import { ToastService } from '../toast.service';
import { db } from '../../db/model-db';

@Injectable({
  providedIn: 'root'
})
export class PurchaseHistoryService extends DBRepository<PurchaseHistory> {
  constructor(ts: ToastService) {
    super(ts);
    this.table = db.purchasesHistory;
  }
}
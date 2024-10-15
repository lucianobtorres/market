import { Injectable } from '@angular/core';
import { db } from '../db/finance-db';
import { DBRepository } from '../models/db.repository';
import { PlanoContas } from '../models/interfaces';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class PlanoContaService extends DBRepository<PlanoContas>{
  constructor(ts: ToastService) {
    super(ts);
    this.table = db.planoContas;
  }
}

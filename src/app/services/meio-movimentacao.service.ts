import { Injectable } from '@angular/core';
import { db } from '../db/finance-db';
import { DBRepository } from '../models/db.repository';
import { MeioMovimentacao } from '../models/interfaces';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class MeioMovimentacaoService extends DBRepository<MeioMovimentacao>{
  constructor(ts: ToastService) {
    super(ts);
    this.table = db.meioMovimentacao;
  }
}

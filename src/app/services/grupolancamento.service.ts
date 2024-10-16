import { Injectable } from '@angular/core';
import { db } from '../db/model-db';
import { DBRepository } from '../models/db.repository';
import { GrupoContas } from '../models/interfaces';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class GrupolancamentoService extends DBRepository<GrupoContas>{
  constructor(ts: ToastService) {
    super(ts);
    this.table = db.grupoContas;
  }
}

import { Injectable } from '@angular/core';
import { db } from '../db/model-db';
import { Lancamento, LancamentoToService, MeioMovimentacao } from '../models/interfaces';
import { DBRepository } from '../models/db.repository';
import { ToastService } from './toast.service';
import { addMonths, startOfDay } from 'date-fns';

@Injectable({
  providedIn: 'root'
})
export class LancamentoService extends DBRepository<Lancamento> {
  constructor(ts: ToastService) {
    super(ts);
    this.table = db.lancamentos;
  }

  getValor(lcto: Lancamento, mv: MeioMovimentacao): number {
    return (!mv.entrada)
      ? lcto.valor * -1
      : lcto.valor;
  }

  override add(item: LancamentoToService) {
    const hoje = startOfDay(new Date()).getTime();
    let index = 0;

    do {
      item.naoRealizado = item.data.getTime() >= hoje;
      super.add(item, 'Lancamento adicionado');

      if (++index < item.vezes) {
        item.data = addMonths(item.data, 1);
      }
    } while (index < item.vezes);
  }
}

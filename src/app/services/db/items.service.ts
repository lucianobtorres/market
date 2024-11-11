import { Injectable } from '@angular/core';
import { Items } from '../../models/interfaces';
import { DBRepository } from '../../models/db.repository';
import { ToastService } from '../toast.service';
import { db } from '../../db/model-db';

@Injectable({
  providedIn: 'root'
})
export class ItemsService extends DBRepository<Items> {
  constructor(ts: ToastService) {
    super(ts);
    this.table = db.items;
  }


  convertValueToDecimal(preco: number | string | null | undefined): number | undefined {
    const value = preco;

    // Verifica se o valor tem uma vírgula e a substitui por ponto para cálculos
    if (typeof value === 'string' && value.includes(',')) {
        const convertido = value.replace(',', '.');
        return Number(convertido);
    }

    return Number(value);
  }

  convertDecimalToValue(preco: number | undefined): string | null {
    const value = preco?.toString();

    // Verifica se o valor tem uma vírgula e a substitui por ponto para cálculos
    if (typeof value === 'string' && value.includes('.')) {
        const convertido = value.replace('.', ',');
        return convertido;
    }

    return value?.toString() ?? null;
  }
}

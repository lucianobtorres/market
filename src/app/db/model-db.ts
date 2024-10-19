import Dexie, { Table } from 'dexie';
import { GrupoContas, PlanoContas, MeioMovimentacao, Lancamento, ShoppingItem, BoughtItems } from '../models/interfaces';
import { CURRENT_DATABASE_VERSION, Migrations } from './migrations';

export interface IHistoricoCompras {
  id?: number;
  comprado: boolean;
  item: string;
  data: string;
}

export class ModelDB extends Dexie {
  grupoContas!: Table<GrupoContas, number>;
  planoContas!: Table<PlanoContas, number>;
  meioMovimentacao!: Table<MeioMovimentacao, number>;
  lancamentos!: Table<Lancamento, number>;
  shoppingItems!: Table<ShoppingItem, number>;
  boughtItems!: Table<BoughtItems, number>;

  //versionDB!: Table<VersionDB, number>;
  //historicoCompras!: Table<IHistoricoCompras, number>;


  constructor() {
    super('Model-DB');

    this.version(CURRENT_DATABASE_VERSION).stores({
      grupoContas: '++id',
      planoContas: '++id, grupoContasId',
      meioMovimentacao: '++id, sigla, title, entrada, parcelavel',
      lancamentos: '++id, planoContasId, meioMovimentacaoId',

      //versions: '++id, version',
      //historicoCompras: '++id, compra, produto, data',
      shoppingItems: '++id, nome, notas, quantidade, unidade, preco, completed',
      boughtItems: '++id, nome, notas, quantidade, unidade, preco, completed, dataCompra',
    });

    Migrations.createMigrations(this);
  }
}

export const db = new ModelDB();

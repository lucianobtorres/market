import { ItemUnit } from "./shopping-item";

export interface BoughtItems extends ConfigItems {
  adding: boolean,
  dataCompra: Date,
}

export interface ShoppingItem extends ConfigItems {
  quantidade?: number;
  preco?: number;
  completed: boolean;
  translateX?: number;
}

export interface ConfigItems {
  id?: number;
  nome: string;
  notas?: string;
  unidade: ItemUnit;
}

export interface GrupoContas {
  id?: number;
  icone: string;
  title: string;
}

export interface PlanoContas {
  id?: number;
  grupoContasId: number | undefined;
  title: string;
}

export interface MeioMovimentacao {
  id?: number;
  sigla: string;
  title: string;
  entrada: boolean;
  parcelavel: boolean;
}

export interface LancamentoToService {
  id?: number;
  planoContasId: number | undefined;
  meioMovimentacaoId: number | undefined;
  data: Date;
  desc: string;
  valor: number;
  vezes: number;
  naoRealizado?: boolean;
}

export interface Lancamento {
  id?: number;
  planoContasId: number | undefined;
  meioMovimentacaoId: number | undefined;
  data: Date;
  desc: string;
  valor: number;
  naoRealizado?: boolean;
}

export interface ItemLancamento {
  grupoConta: GrupoContas,
  planoConta: PlanoContas,
  lancamento: Lancamento,
  meioMovimentacao: MeioMovimentacao
}

export interface PlanoContasLancamento {
  planoConta: PlanoContas,
  lancamento: Lancamento,
  meioMovimentacao: MeioMovimentacao,
}

export interface ILancamentoAgrupado {
  grupoConta: GrupoContas,
  planosContas: PlanoContasLancamento[]
}

export interface VersionDB {
  id?: number;
  version: number | undefined;
}

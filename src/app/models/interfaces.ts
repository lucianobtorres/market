import { ItemUnit } from "./shopping-item";

export interface ShoppingItem {
  id?: number;
  nome: string;
  notas?: string;
  quantidade?: number;
  unidade?: ItemUnit;
  preco?: number;
  completed: boolean;
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

import { Component, OnInit } from "@angular/core";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { startOfToday, endOfToday, getYear, getMonth, startOfMonth, getDay, getDate } from "date-fns";
import { liveQuery } from "dexie";
import { take } from "rxjs";
import { AddLancamentoComponent } from "src/app/components/add-lancamento/add-lancamento.component";
import { db } from "src/app/db/finance-db";
import { MeioMovimentacao, GrupoContas, PlanoContas, Lancamento, LancamentoToService } from "src/app/models/interfaces";
import { LancamentoService } from "src/app/services/lancamento.service";

type TKey = { ano: number, mes: number, dia: number };
type TVal = { lcto: Lancamento, planConta: PlanoContas, grupo: GrupoContas, meioMov: MeioMovimentacao };

@Component({
  selector: 'fi-extrato',
  templateUrl: './extrato.component.html',
  styleUrls: ['./extrato.component.scss']
})
export class ExtratoComponent implements OnInit {
  public lancamentos$ = liveQuery(() => db.lancamentos.toArray());
  public planoContas$ = liveQuery(() => db.planoContas.toArray());
  public meiosMovs$ = liveQuery(() => db.meioMovimentacao.toArray());
  public grupoContas$ = liveQuery(() => db.grupoContas.toArray());

  public meiosMovimentacao!: MeioMovimentacao[];
  public gruposConta!: GrupoContas[];
  public planosConta!: PlanoContas[];
  public lancamentos!: Lancamento[];

  public inicioHoje = startOfToday();
  public finalHoje = endOfToday();

  public map = new Map<TKey, TVal[]>();
  public keys?: TKey[];

  constructor(
    readonly bottomSheet: MatBottomSheet,
    readonly lancamentoService: LancamentoService
  ) {
  }

  ngOnInit(): void {
    this.meiosMovs$.subscribe((meiosMovs) => {
      this.meiosMovimentacao = meiosMovs;
    });

    this.grupoContas$.subscribe((gruposContas) => {
      this.gruposConta = gruposContas;
    });

    this.planoContas$.subscribe((plansContas) => {
      this.planosConta = plansContas;
    });

    this.lancamentos$.subscribe((lctos) => {
      this.lancamentos = lctos.sort((b, a) => a.data.getTime() - b.data.getTime());

      this.lancamentos.map(lcto => {
        const meioMov = this.meiosMovimentacao.find(x => x.id === lcto.meioMovimentacaoId);
        if (!meioMov) return;

        const planConta = this.planosConta.find(x => x.id === lcto.planoContasId);
        if (!planConta) return;

        const grupo = this.gruposConta.find(x => x.id === planConta.grupoContasId);
        if (!grupo) return;

        lcto.valor = this.lancamentoService.getValor(lcto, meioMov);
        const tkey = { ano: getYear(lcto.data), mes: getMonth(lcto.data), dia: getDate(lcto.data) };
        const key = this.checkSameObjKey(this.map, tkey);

        if (tkey === key) {
          this.map.set(key, []);
        }

        const item = this.map.get(key);
        item?.push(
          { lcto, planConta, grupo, meioMov }
        );
      });
    });
  }

  getDataKey(key: TKey): Date {
    return new Date(key.ano, key.mes, key.dia);
  }

  getSoma(key: TKey): number {
    const arr = this.map.get(key);
    if (!arr) return 0;

    return arr.reduce((soma, obj) => {
      return soma + obj.lcto.valor;
    }, 0);
  }

  private checkSameObjKey(map: Map<TKey, TVal[]>, key: TKey): TKey {
    const keys = map.keys();
    let anotherKey;

    while (anotherKey = keys.next().value) {
      if (key.ano === anotherKey.ano && key.mes === anotherKey.mes && key.dia === anotherKey.dia) return anotherKey;
    }

    return key;
  }

  deleteFromController(lancamento: Lancamento) {
    const index = this.lancamentos.findIndex(x => x.id === lancamento.id!);
    this.lancamentos.splice(index, 1);
    this.map.clear();
  }

  deleteLancamento(lancamento: Lancamento) {
    this.deleteFromController(lancamento);
    console.log(this.map)
    this.lancamentoService.delete(lancamento.id!, 'Lancamento removido', false);
    console.log(this.map)
  }

  editarLancamento(lancamento: Lancamento) {
    this.bottomSheet
      .open(
        AddLancamentoComponent,
        {
          data: {
            gruposConta: this.gruposConta,
            planosConta: this.planosConta,
            meiosMovimentacao: this.meiosMovimentacao,
            lancamento
          }
        })
      .afterDismissed()
      .pipe(
        take(1)
      )
      .subscribe({
        next: (result: { lancamento: LancamentoToService }) => {
          if (!result || !result.lancamento) return;

          this.deleteFromController(lancamento);
          this.lancamentoService.update(lancamento.id!, result.lancamento, 'Lancamento atualizado');
        }
      });
  }

  lancamentoRealizado(lancamento: Lancamento) {
    lancamento.naoRealizado = false;
    this.map = new Map<TKey, TVal[]>();
    this.lancamentoService.update(lancamento.id!, { naoRealizado: false }, '');
  }
}

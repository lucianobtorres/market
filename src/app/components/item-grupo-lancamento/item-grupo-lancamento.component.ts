import { Component, EventEmitter, Input, Output } from '@angular/core';
import { endOfToday, startOfToday } from 'date-fns';
import { PlanoContasLancamento } from 'src/app/models/interfaces';
import { LancamentoAgrupado } from 'src/app/models/item-lancamento-agrupado';

@Component({
  selector: 'app-item-grupo-lancamento',
  templateUrl: './item-grupo-lancamento.component.html',
  styleUrls: ['./item-grupo-lancamento.component.scss']
})
export class ItemGrupoLancamentoComponent {
  @Output() public removeLancamento = new EventEmitter<number>();
  @Output() public editarLancamento = new EventEmitter<number>();
  @Output() public realizar = new EventEmitter<number>();

  @Input() itemGrupo!: LancamentoAgrupado;

  public inicioHoje = startOfToday();
  public finalHoje = endOfToday();

  getLancamentos(): PlanoContasLancamento[] {
    return this.itemGrupo.planosContas.sort((a, b) => a.lancamento.data.getTime() - b.lancamento.data.getTime());
  }
}

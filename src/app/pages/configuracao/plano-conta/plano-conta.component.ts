import { AfterViewInit, Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { liveQuery } from 'dexie';
import { take } from 'rxjs';
import { db } from 'src/app/db/finance-db';
import { GrupoContas, MeioMovimentacao, PlanoContas } from 'src/app/models/interfaces';
import { MeioMovimentacaoService } from 'src/app/services/meio-movimentacao.service';
import { PlanoContaService } from 'src/app/services/plano-conta.service';
import { FormPlanoContaComponent } from './form-plano-conta/form-plano-conta.component';

@Component({
  selector: 'fi-plano-conta',
  templateUrl: './plano-conta.component.html',
  styleUrls: ['./plano-conta.component.scss']
})
export class PlanoContaComponent implements OnInit, AfterViewInit {
  public table$ = liveQuery(() => db.planoContas.toArray());
  public grupoContas$ = liveQuery(() => db.grupoContas.toArray());

  private table!: PlanoContas[];
  public gruposConta!: GrupoContas[];

  dataSource!: MatTableDataSource<PlanoContas>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  @Output() onRowAdd = new EventEmitter<any>();
  @Output() onRowEdit = new EventEmitter<any>();

  displayed_columns: string[] = [
    'grupoContasId',
    'title',
  ];

  public getGrupoName = (grupoContasId: number): GrupoContas | undefined => {
    return this.gruposConta.find(x => x.id === grupoContasId);
  }

  constructor(
    readonly bottomSheet: MatBottomSheet,
    readonly dbService: PlanoContaService
  ) { }

  ngOnInit(): void {
    this.grupoContas$.subscribe((gruposContas) => {
      this.gruposConta = gruposContas;
    });
  }

  ngAfterViewInit() {
    this.table$.subscribe((table) => {
      this.table = table;
      this.dataSource = new MatTableDataSource(table);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  addRow() {
    this.onRowAdd.emit();

    let addMais = false;
    this.bottomSheet
      .open(
        FormPlanoContaComponent,
        {
          data: {
            item: null
          }
        })
      .afterDismissed()
      .pipe(take(1))
      .subscribe({
        next: (result: {
          item: {
            grupoContasId: number,
            title: string,
          },
          multiAdd: boolean
        }) => {
          if (!result) return;

          this.dbService.add(result.item);
          addMais = result.multiAdd ?? false;
        },
        complete: () => {
          if (addMais) this.addRow();
        }
      });
  }

  editRow(row: MeioMovimentacao) {
    const id = row.id;
    if (!id) return;

    const itemEditado = this.table.find(x => x.id === row.id);
    if (!itemEditado) return;

    this.bottomSheet
      .open(
        FormPlanoContaComponent,
        {
          data: {
            item: itemEditado
          }
        })
      .afterDismissed()
      .pipe(take(1))
      .subscribe({
        next: (result: {
          item: {
            grupoContasId: number,
            title: string,
          } | undefined,
          multiAdd: boolean
        }) => {
          if (!result) return;
          if (result.item === undefined) {
            //this.dbService.delete(id, 'Item removido');
          }
          else {
            this.dbService.update(id, result.item, 'Item atualizado');
          }
        }
      });
  }
}

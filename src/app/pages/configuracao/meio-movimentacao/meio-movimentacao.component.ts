import { AfterViewInit, Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { liveQuery } from 'dexie';
import { take } from 'rxjs';
import { db } from 'src/app/db/model-db';
import { MeioMovimentacao } from 'src/app/models/interfaces';
import { MeioMovimentacaoService } from 'src/app/services/meio-movimentacao.service';
import { FormMeioMovimentacaoComponent } from './form-meio-movimentacao/form-meio-movimentacao.component';

@Component({
  selector: 'app-meio-movimentacao',
  templateUrl: './meio-movimentacao.component.html',
  styleUrls: ['./meio-movimentacao.component.scss']
})
export class MeioMovimentacaoComponent implements AfterViewInit {
  public table$ = liveQuery(() => db.meioMovimentacao.toArray());
  private table!: MeioMovimentacao[];
  dataSource!: MatTableDataSource<MeioMovimentacao>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  @Output() onRowAdd = new EventEmitter<any>();
  @Output() onRowEdit = new EventEmitter<any>();

  displayed_columns: string[] = [
    'sigla',
    'title',
    'entrada',
    'parcelavel',
  ];

  constructor(
    readonly bottomSheet: MatBottomSheet,
    readonly dbService: MeioMovimentacaoService
  ) {
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
        FormMeioMovimentacaoComponent,
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
            sigla: string,
            title: string,
            entrada: boolean,
            parcelavel: boolean,
            teste: boolean,
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
        FormMeioMovimentacaoComponent,
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
            sigla: string,
            title: string,
            entrada: boolean,
          } | undefined,
          multiAdd: boolean
        } ) => {
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


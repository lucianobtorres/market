import { AfterViewInit, Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { liveQuery } from 'dexie';
import { take } from 'rxjs';
import { db } from 'src/app/db/finance-db';
import { GrupoContas } from 'src/app/models/interfaces';
import { GrupolancamentoService } from 'src/app/services/grupolancamento.service';
import { FormGrupoContaComponent } from './form-grupo-conta/form-grupo-conta.component';


@Component({
  selector: 'fi-grupo-conta',
  templateUrl: './grupo-conta.component.html',
  styleUrls: ['./grupo-conta.component.scss']
})
export class GrupoContaComponent implements AfterViewInit {
  public table$ = liveQuery(() => db.grupoContas.toArray());
  private table!: GrupoContas[];
  dataSource!: MatTableDataSource<GrupoContas>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;


  @Output() onRowAdd = new EventEmitter<any>();
  @Output() onRowEdit = new EventEmitter<any>();

  displayed_columns: string[] = [
    'icone',
    'title',
  ];

  constructor(
    readonly bottomSheet: MatBottomSheet,
    readonly dbService: GrupolancamentoService
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
        FormGrupoContaComponent,
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
            icone: string,
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

  editRow(row: GrupoContas) {
    const id = row.id;
    if (!id) return;

    const itemEditado = this.table.find(x => x.id === row.id);
    if (!itemEditado) return;

    this.bottomSheet
      .open(
        FormGrupoContaComponent,
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
            icone: string,
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

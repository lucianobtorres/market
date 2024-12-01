import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ROTAS } from 'src/app/app-routing.module';
import { DialogArgs, ConfirmDialogComponent } from 'src/app/components/shared/confirm-dialog/confirm-dialog.component';
import { db } from 'src/app/db/model-db';

@Component({
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent {
  constructor(
    private readonly router: Router,
    private readonly dialog: MatDialog,
  ) { }

  async desagrupar() {
    const data: DialogArgs = {
      message: 'Tem certeza que deseja desagrupar a dispensa?',
      action: 'Desagrupar',
      class: 'warn'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: 'auto',
      data: data,
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result === true) {
        await db.productMappings.clear();
        this.router.navigate([ROTAS.dispensa]);
      }
    });
  }

  navigateDispensa() {
    this.router.navigate([ROTAS.dispensa]);
  }

  navigateHistorico() {
    this.router.navigate([ROTAS.historico]);
  }
}

import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ShoppingDialogComponent } from 'src/app/components/shopping-dialog/shopping-dialog.component';
import { Utils } from 'src/app/utils/util';

@Component({
  selector: 'app-lista-detalhada',
  templateUrl: './lista-detalhada.component.html',
  styleUrls: ['./lista-detalhada.component.scss']
})
export class ListaDetalhadaComponent implements OnInit {
  isMobile: boolean = true;
  id: number = 0;

  constructor(private dialog: MatDialog, private router: Router,
    private readonly route: ActivatedRoute) { }

  ngOnInit(): void {
    this.isMobile = Utils.isMobile();

    this.route.paramMap.subscribe(params => {
      this.id = Number(params.get('id') ?? 0 + 0);

      if (this.isMobile) {
        const dialogRef = this.dialog.open(ShoppingDialogComponent, {
          data: { idLista: this.id},
          width: '100vw',
          height: '100vh',
          maxWidth: '100vw',
          panelClass: 'full-screen-dialog',
        });

        dialogRef.afterClosed().subscribe((_: unknown) => {
          this.Close();
        });
      }
    });
  }

  Close() {
    this.router.navigate(['/']);
  }
}

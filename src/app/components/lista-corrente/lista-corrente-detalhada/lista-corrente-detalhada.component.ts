import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router, ActivatedRoute } from "@angular/router";
import { Utils } from "src/app/utils/util";
import { ListaCorrenteDialogComponent } from "../lista-corrente-dialog/lista-corrente-dialog.component";


@Component({
  selector: 'app-lista-corrente-detalhada',
  templateUrl: './lista-corrente-detalhada.component.html',
  styleUrls: ['./lista-corrente-detalhada.component.scss']
})
export class ListaCorrenteDetalhadaComponent implements OnInit {
  isMobile: boolean = true;
  id: number = 0;

  constructor(private dialog: MatDialog, private router: Router,
    private readonly route: ActivatedRoute) { }

  ngOnInit(): void {
    this.isMobile = Utils.isMobile();

    this.route.paramMap.subscribe(params => {
      this.id = Number(params.get('id') ?? 0 + 0);

      if (this.isMobile) {
        const dialogRef = this.dialog.open(ListaCorrenteDialogComponent, {
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

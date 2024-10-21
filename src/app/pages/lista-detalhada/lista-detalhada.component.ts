import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ShoppingDialogComponent } from 'src/app/components/shopping-dialog/shopping-dialog.component';

@Component({
  selector: 'app-lista-detalhada',
  templateUrl: './lista-detalhada.component.html',
  styleUrls: ['./lista-detalhada.component.scss']
})
export class ListaDetalhadaComponent implements OnInit {
  isMobile: boolean = true;

  constructor(private dialog: MatDialog, private route: Router) { }

  ngOnInit(): void {
    this.isMobile = window.innerWidth <= 768; // Determina se é mobile ou PC

    if (this.isMobile) {
      const dialogRef = this.dialog.open(ShoppingDialogComponent, {
        data: { /* dados da lista */ },
        width: '100vw',
        height: '100vh',
        maxWidth: '100vw',
        panelClass: 'full-screen-dialog',
      });


      dialogRef.afterClosed().subscribe((_: unknown) => {
        this.Close();
      });
    }
  }
  Close() {
    this.route.navigate(['/']);
  }
}

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ROTAS } from 'src/app/app-routing.module';

@Component({
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent {
  constructor(
    private readonly router: Router
  ) { }

  navigateDispensa() {
    this.router.navigate([ROTAS.dispensa]);
  }

  navigateHistorico() {
    this.router.navigate([ROTAS.historico]);
  }
}

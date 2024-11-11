import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent {
  constructor(
    private readonly router: Router
  ) { }


  navigateDispensa() {
    this.router.navigate(['dispensa']);
  }
}

import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-item',
  templateUrl: './list-item.component.html',
  styleUrls: ['./list-item.component.scss'],
})
export class ListItemComponent {
  isSearchOpen = false;

  constructor(
    private readonly router: Router) {
  }

  isMobile(): boolean {
    return window.innerWidth < 768;
  }

  abrirLista(): void {
    this.router.navigate(['/lista', 'minhas-lista']);
  }
}

import { Component } from '@angular/core';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent {
  public navLinks = [
    {
      location: 'home',
      label: 'Listas',
      icon: 'receipt_long'
    },
    {
      location: 'perfil',
      label: 'Perfil',
      icon: 'people'
    },
    {
      location: 'configuracoes',
      label: 'Configurações',
      icon: 'settings'
    }]
}

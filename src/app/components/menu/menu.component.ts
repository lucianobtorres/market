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
      label: 'Lancamentos',
      icon: 'currency_exchange'
    },
    {
      location: 'extrato',
      label: 'Extrato',
      icon: 'receipt_long'
    },
    {
      location: 'configuracoes',
      label: 'Configurações',
      icon: 'settings'
    }]
}

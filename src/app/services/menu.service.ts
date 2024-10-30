import { Injectable } from '@angular/core';

export interface MenuLinks {
  location: string,
  label: string,
  icon: string
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  public navLinks: MenuLinks[] = [
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

import { Component } from '@angular/core';
import { MenuLinks, MenuService } from 'src/app/services/menu.service';

@Component({
  selector: 'app-menu-side',
  templateUrl: './menu-side.component.html',
  styleUrls: ['./menu-side.component.scss']
})
export class MenuSideComponent {
  public navLinks: MenuLinks[];
  constructor(menuService: MenuService) {
    this.navLinks = menuService.navLinks;
  }
}

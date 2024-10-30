import { Component } from '@angular/core';
import { MenuLinks, MenuService } from 'src/app/services/menu.service';

@Component({
  selector: 'app-menu-footer',
  templateUrl: './menu-footer.component.html',
  styleUrls: ['./menu-footer.component.scss']
})
export class MenuFooterComponent {
  public navLinks: MenuLinks[];
  constructor(menuService: MenuService) {
    this.navLinks = menuService.navLinks;
  }
}

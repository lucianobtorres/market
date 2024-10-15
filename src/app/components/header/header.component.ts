import { Component, Input } from '@angular/core';

@Component({
  selector: 'fi-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Input() titulo?: string = undefined;
  @Input() subTitulo?: string = undefined;
}

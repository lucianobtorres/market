import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'fi-configuracao-item',
  template: `
  <a mat-list-item
      [routerLink]="url"
      routerLinkActive="active"
      [routerLinkActiveOptions]="{ exact: true }"
      (click)="itemMenuClick.emit()"
      [disabled]="disabled">
          <mat-icon *ngIf="!!icon" mat-list-icon>{{ icon }}</mat-icon>
          <span>{{ text }}</span>
  </a>
  `,
  styles: []
})
export class ConfiguracaoItemComponent {
  @Input() public url?: string;
  @Input() public disabled?: boolean;
  @Input() public text?: string;
  @Input() public icon?: string;
  @Output() public itemMenuClick = new EventEmitter<void>();
}

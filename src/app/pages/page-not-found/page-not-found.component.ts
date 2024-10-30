import { Component } from '@angular/core';

@Component({
  selector: 'app-page-not-found',
  template: `
  <div class="component-container">
        <app-header>
          Página não encontrada
        </app-header>
  </div>
  `,
  styles: [`
  :host {
    height: 100%;
  }
  `]
})

export class PageNotFoundComponent { }

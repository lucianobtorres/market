import { Component } from '@angular/core';

@Component({
  selector: 'app-page-not-found',
  template: `
  <mat-card class="mat-elevation-z0">
    <div fxLayoutAlign="space-between">
       <!-- *ngFor="let item of list"> -->
        <app-header>
          Página não encontrada
        </app-header>
    </div>
  </mat-card>
  `,
  styles: [`
  mat-card {
    height: 100vh;
    overflow: hidden;
  }
  `]
})

export class PageNotFoundComponent { }

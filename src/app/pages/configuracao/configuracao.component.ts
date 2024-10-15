import { Component } from '@angular/core';
import { ROTAS_CONFIG } from 'src/app/app-routing.module';

@Component({
  selector: 'fi-configuracao',
  templateUrl: './configuracao.component.html',
  styleUrls: ['./configuracao.component.scss']
})
export class ConfiguracaoComponent {
  rotas = ROTAS_CONFIG;

  public isOpened = false;

  open(): void {
    this.isOpened = true;
  }

  close(): void {
    this.isOpened = false;
  }
}

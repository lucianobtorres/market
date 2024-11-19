import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MapLocate } from 'src/app/services/map.service';

@Component({
  selector: 'app-market-details-sheet',
  templateUrl: './market-details-sheet.component.html',
})
export class MarketDetailsSheetComponent {
  @Input() data?: MapLocate | null;

  @Output() closeEmit = new EventEmitter<MapLocate | undefined | null>();
  selectMarket() {
    console.log('Mercado selecionado:', this.data);
    this.closeEmit.emit(this.data);
  }
}

import { Component } from '@angular/core';
import { liveQuery } from 'dexie';
import { Inventory } from 'src/app/models/interfaces';
import { db } from 'src/app/db/model-db';
import { InventoryService } from 'src/app/services/db/inventory.service';
import { Router } from '@angular/router';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { DispensaItemDetalhesComponent } from './dispensa-item-detalhe/dispensa-item-detalhes.component';
import { ItemUnitDescriptions } from 'src/app/models/item-unit';


@Component({
  selector: 'app-dispensa',
  templateUrl: './dispensa.component.html',
  styleUrls: ['./dispensa.component.scss']
})
export class DispensaComponent {
  inventoryList: Inventory[] = [];

  private itens$ = liveQuery(() => db.inventory.toArray()).subscribe(itens => {
    this.inventoryList = itens;
    this.groupByUnit();
  });

  groupedInventory: { [unit: string]: Inventory[] } = {};

  constructor(
    private readonly router: Router,
    private bottomSheet: MatBottomSheet,
  ) { }

  groupByUnit() {
    this.inventoryList.forEach(item => {
      const unitDescription = ItemUnitDescriptions.get(item.unit) || item.unit;

      if (!this.groupedInventory[unitDescription]) {
        this.groupedInventory[unitDescription] = [];
      }
      this.groupedInventory[unitDescription].push(item);
    });

    // Ordena cada grupo de itens por nome
    Object.keys(this.groupedInventory).forEach(unit => {
      this.groupedInventory[unit].sort((a, b) => a.name.localeCompare(b.name));
    });
  }

  navigatePerfil() {
    this.router.navigate(['perfil']);
  }

  openBottomSheet(item: Inventory): void {
    this.bottomSheet.open(DispensaItemDetalhesComponent, {
      data: item,
    });
  }
}

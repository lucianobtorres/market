import { Component, OnInit } from '@angular/core';
import { db } from 'src/app/db/model-db';
import { ItemShoppingList } from 'src/app/models/interfaces';
import { ItemListService } from 'src/app/services/item-list.service';

// Detects if device is on iOS
const isIos = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
}
// Detects if device is in standalone mode
const isInStandaloneMode = () => (window.matchMedia('(display-mode: standalone)').matches);

@Component({
  selector: 'app-listas',
  templateUrl: './listas.component.html',
  styleUrls: ['./listas.component.scss'],
})
export class ListasComponent implements OnInit {
  public itensList: ItemShoppingList[] = [];
  showInstallMessage = isIos() && !isInStandaloneMode();

  constructor(private readonly listsService: ItemListService) {

    document.addEventListener("DOMContentLoaded", () => {
      const popup = document.getElementById("install-popup");

      setTimeout(() => {
        if (popup) popup.style.display = "block";
      }, 3000); // Aparece após 3 segundos

      // Função para remover o popup
      const removePopup = () => {
        this.showInstallMessage = false;
        document.removeEventListener("click", removePopup);
        document.removeEventListener("touchstart", removePopup);
        document.removeEventListener("scroll", removePopup);
      };

      // Adiciona eventos para detectar interação
      document.addEventListener("click", removePopup);
      document.addEventListener("touchstart", removePopup);
      document.addEventListener("scroll", removePopup);
    });
  }

  ngOnInit(): void {
    this.listsService.listas$.subscribe((listas) => {
      this.itensList = listas.filter(x => x.lists.status !== 'completed' || x.itens.some(y => !y.isPurchased));
    });
  }

  novaLista() {
    db.lists.add({ name: "Nova Lista", status: 'active', createdDate: new Date });
  }
}

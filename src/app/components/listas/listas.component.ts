import { AfterViewInit, Component, ElementRef, OnInit } from '@angular/core';
import { db } from 'src/app/db/model-db';
import { ItemShoppingList } from 'src/app/models/interfaces';
import { AgentService, suggestionClass } from 'src/app/services/agente/agente.service';
import { ContextStrategy, Suggestion } from 'src/app/services/agente/strategies/suggestion-strategy';
import { InactivityService } from 'src/app/services/inactivity.service';
import { ItemListService } from 'src/app/services/item-list.service';


@Component({
  selector: 'app-listas',
  templateUrl: './listas.component.html',
  styleUrls: ['./listas.component.scss'],
})
export class ListasComponent implements OnInit, AfterViewInit {
  public itensList: ItemShoppingList[] = [];

  showInstallMessage = this.showIosInstallModal('iosnew');
  suggestions: Suggestion[] = [];
  context: ContextStrategy = {
    pantryEmpty: false,
    recentPurchases: [],
    listCount: 0,
  };

  constructor(
    private readonly listsService: ItemListService,
    private readonly agentService: AgentService,
    private inactivityService: InactivityService,
    private elementRef: ElementRef,
  ) {
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

  async ngOnInit(): Promise<void> {
    this.listsService.listas$.subscribe((listas) => {
      this.itensList = listas.filter(x => x.lists.status !== 'completed' || x.itens.some(y => !y.isPurchased));
    });

    this.context.listCount = this.itensList.length;
    this.context.pantryEmpty = (await db.inventory
      .filter(item => item.currentQuantity > 0)
      .toArray()).length === 0;

    this.context.hasSomeHistory = await (await db.purchasesHistory.toArray()).length > 0;
    this.context.recentPurchases = await db.purchasesHistory.toArray();

    this.suggestions = this.agentService.generateSuggestions(this.context);

    setTimeout(async () => {
      const hasInteracted = await this.agentService.hasInteracted({ text: this.balloonMessage, type: 'assistant' });
      if (!hasInteracted) {
        this.showBalloon = true;
      }
    }, 2000);
  }

  ngAfterViewInit(): void {
    this.inactivityService.showAgent$.subscribe((show) => {
      this.showBalloon = show;
      if (show) {
        this.balloonTitle = 'Dicas'
        this.balloonMessage = this.agentService.getSuggestionsHtml(this.suggestions);

        setTimeout(() => {
          const itens = this.elementRef.nativeElement.querySelectorAll(`.${suggestionClass}`);
          itens?.forEach((tag: HTMLElement) => tag.addEventListener('click', this.handleLinkClick.bind(this)));
        }, 100);

      } else {
        setTimeout(() => {
          const itens = this.elementRef.nativeElement.querySelectorAll(`.${suggestionClass}`);
          itens?.forEach((tag: HTMLElement) => tag.removeEventListener('click', this.handleLinkClick.bind(this)))
        }, 100);
      }
    });
  }

  handleLinkClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (target) {
      this.agentService.handleAction(target.innerText, this.suggestions);
      this.inactivityService.closeAgent();

      this.suggestions = this.agentService.generateSuggestions(this.context);
    }
  }

  showBalloon: boolean = false;
  balloonTitle: string = 'Bem-vindo ao PoupeAI!';
  balloonMessage: string = `<p>Essa é uma <strong>lista de exemplo</strong>. Explore o sistema:</p>
    <ul>
      <li><a (click)="createNewList()">Crie sua própria lista</a></li>
      <li><a (click)="importList()">Importe uma lista pronta</a></li>
    </ul>
  `;


  novaLista() {
    db.lists.add({ name: "Nova Lista", status: 'active', createdDate: new Date });
  }

  showIosInstallModal(localStorageKey: string): boolean {
    // detect if the device is on iOS
    const isIos = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent);
    };

    // check if the device is in standalone mode
    const isInStandaloneMode = () => {
      return (
        "standalone" in (window as any).navigator &&
        (window as any).navigator.standalone
      );
    };

    // show the modal only once
    const localStorageKeyValue = localStorage.getItem(localStorageKey);
    const iosInstallModalShown = localStorageKeyValue
      ? JSON.parse(localStorageKeyValue)
      : false;
    const shouldShowModalResponse =
      isIos() && !isInStandaloneMode() && !iosInstallModalShown;
    if (shouldShowModalResponse) {
      localStorage.setItem(localStorageKey, "true");
    }
    return shouldShowModalResponse;
  }
}

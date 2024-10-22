import { Component, EventEmitter, Input, Output } from '@angular/core';


@Component({
  selector: 'app-swipe-list-item',
  templateUrl: './swipe-list-item.component.html',
  styleUrls: ['./swipe-list-item.component.scss']
})

export class SwipeListItemComponent {
  @Input() completed: boolean = false;  // Indica se o item foi completado
  @Output() completedEvent = new EventEmitter<void>();
  @Output() deletedEvent = new EventEmitter<void>();
  @Output() editedEvent = new EventEmitter<void>();

  public showButtons = false;
  public completeIconOpacity = 0;

  // Swipe para a direita: completado
  onSwipeRight() {
    this.completeIconOpacity = 1;
    this.completedEvent.emit();
  }

  // Swipe para a esquerda: revelação de botões ou delete direto
  onSwipeLeft() {
    if (this.showButtons) {
      this.deletedEvent.emit(); // Swipe completo à esquerda -> Excluir diretamente
    } else {
      this.showButtons = true;  // Revelar os botões
    }
  }

  // Clicar no botão Editar
  onEdit(event: Event) {
    event.stopPropagation();  // Para não desencadear outros eventos
    this.editedEvent.emit();
    this.showButtons = false;
  }

  // Clicar no botão Excluir
  onDelete(event: Event) {
    event.stopPropagation();  // Para não desencadear outros eventos
    this.deletedEvent.emit();
    this.showButtons = false;
  }
}

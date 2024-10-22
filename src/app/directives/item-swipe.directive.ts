import { Directive, ElementRef, EventEmitter, HostListener, Output, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appItemSwipe]'
})
export class SwipeDirective {
  private swipeStartX: number = 0;
  private swipeDistance: number = 0;
  private swipeThreshold: number = 50; // Distância mínima para considerar um swipe
  private maxSwipeDistance: number = 200; // Distância máxima que o swipe pode alcançar
  private backgroundDiv: HTMLElement | null = null;
  private originalElement: HTMLElement;
  private iconElement: HTMLElement| null = null;
  iconOpacity: number = 0;

  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.originalElement = this.el.nativeElement;
    console.log('asd')
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    this.swipeStartX = event.touches[0].clientX;
    this.swipeDistance = 0;

    // Seleciona o ícone dentro do elemento (o <mat-icon> neste caso)
    this.iconElement = this.originalElement.querySelector('.swipe-icon');
    if (this.iconElement) {
      this.renderer.setStyle(this.iconElement, 'opacity', '0'); // Inicializa o ícone com opacidade 0
    }
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    const currentX = event.touches[0].clientX;
    this.swipeDistance = currentX - this.swipeStartX;

    // Limita o swipe a distâncias positivas e dentro do máximo
    if (this.swipeDistance > 0 && this.swipeDistance <= this.maxSwipeDistance) {
      // Move o item para a direita
      this.renderer.setStyle(this.originalElement, 'transform', `translateX(${this.swipeDistance}px)`);

      // Expande a div de fundo verde ao lado esquerdo do item
      this.renderer.setStyle(this.backgroundDiv, 'width', `${this.swipeDistance}px`);
    }

      // Atualiza a opacidade do ícone usando a função calculateOpacity
      if (this.iconElement) {
        const opacity = this.calculateOpacity(this.swipeDistance, this.swipeThreshold);
        this.renderer.setStyle(this.iconElement, 'opacity', `${opacity}`);
      }
  }

  @HostListener('touchend')
  onTouchEnd() {
    // Se o swipe for menor que o limiar, retorna o item à posição original
    if (this.swipeDistance < this.swipeThreshold) {
      this.resetSwipe();
    }
  }

  private resetSwipe() {
    // Reseta o swipe voltando o item à posição original
    this.renderer.setStyle(this.originalElement, 'transform', 'translateX(0px)');
    this.renderer.setStyle(this.backgroundDiv, 'width', '0px');
    // Reseta a opacidade do ícone para 0
    if (this.iconElement) {
      this.renderer.setStyle(this.iconElement, 'opacity', '0');
    }
  }

  // Função que calcula a opacidade baseada na distância do swipe e o threshold
  private calculateOpacity(swipeDistance: number, threshold: number): number {
    console.log('calculateOpacity')
    // Se a distância for menor que o threshold, interpolamos a opacidade de 0 a 1
    const opacity = Math.min(swipeDistance / threshold, 1);
    return opacity;
  }
}

import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { AgentService } from 'src/app/services/agente/agente.service';
import { ChatAssistantModalDialogComponent } from '../chat-assistant/chat-assistant-modal-dialog/chat-assistant-modal-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { InactivityService } from 'src/app/services/inactivity.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-balloon-guide',
  templateUrl: './balloon-guide.component.html',
  styleUrls: ['./balloon-guide.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BalloonGuideComponent implements OnInit, AfterViewInit {
  @Output() openChatEvent = new EventEmitter<void>();
  @Input() targetElementId?: string;
  @Input() title!: string;
  @Input() message!: string;
  messageSafe!: SafeHtml;
  @Input() dismissable: boolean = true;
  @Input() position: 'top' | 'bottom' | 'left' | 'right' = 'top';
  @ViewChild('balloon') balloonRef!: ElementRef;
  @ViewChild('triangle') triangleRef!: ElementRef;
  @ViewChild('messageInner', { static: true }) messageInner!: ElementRef;

  constructor(
    private dialog: MatDialog,
    private agenteService: AgentService,
    private renderer: Renderer2,
    private inactivityService: InactivityService,
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit() {
    if (this.message.length) this.messageSafe = this.sanitizer.bypassSecurityTrustHtml(this.message);
    else this.dismiss();
  }

  ngAfterViewInit(): void {
    if (this.targetElementId) {
      this.positionBalloon();
    }
  }

  positionBalloon() {
    const targetElement = document.getElementById(this.targetElementId || '');

    if (targetElement) {
      const balloon = this.balloonRef.nativeElement;
      const triangle = this.triangleRef.nativeElement;
      const targetRect = targetElement.getBoundingClientRect();
      const balloonRect = balloon.getBoundingClientRect();

      // Ajusta a altura do balão para incluir margens e paddings
      const balloonHeight = balloonRect.height + parseInt(getComputedStyle(balloon).marginTop) + parseInt(getComputedStyle(balloon).marginBottom);
      const balloonWidth = balloonRect.width + parseInt(getComputedStyle(balloon).marginLeft) + parseInt(getComputedStyle(balloon).marginRight);

      // Espaçamento mínimo entre o balão e o botão
      const offset = 8;

      // Variáveis para posição calculada
      let topBalloon = 0;
      let leftBalloon = 0;

      // Cálculo inicial baseado na posição desejada
      switch (this.position) {
        case 'top':
          topBalloon = targetRect.top - balloonHeight - offset;
          leftBalloon = targetRect.left + targetRect.width / 2 - balloonWidth / 2;
          this.renderer.setStyle(triangle, 'bottom', `${-8}px`);
          this.renderer.setStyle(triangle, 'left', `${targetRect.left - 20 + (targetRect.width / 2)}px`);
          break;
        case 'bottom':
          topBalloon = targetRect.bottom + offset;
          leftBalloon = targetRect.left + targetRect.width / 2 - balloonWidth / 2;
          this.renderer.setStyle(triangle, 'top', `${-8}px`);
          this.renderer.setStyle(triangle, 'left', `${targetRect.left - 20 + (targetRect.width / 2)}px`);
          break;
        case 'left':
          topBalloon = targetRect.top + targetRect.height / 2 - balloonRect.height / 2;
          leftBalloon = targetRect.left - balloonWidth - offset;
          this.renderer.setStyle(triangle, 'right', `${-8}px`);
          this.renderer.setStyle(triangle, 'top', `${targetRect.top - 20 + (targetRect.height / 2)}px`);
          break;
        case 'right':
          topBalloon = targetRect.top + targetRect.height / 2 - balloonRect.height / 2;
          leftBalloon = targetRect.right + offset;
          this.renderer.setStyle(triangle, 'left', `${-8}px`);
          this.renderer.setStyle(triangle, 'top', `${targetRect.top - 20 + (targetRect.height / 2)}px`);
          break;
      }

      // Ajusta posicionamento horizontal para não sair da tela
      if (leftBalloon < 0) {
        leftBalloon = offset;
      } else if (leftBalloon + balloonWidth > window.innerWidth) {
        leftBalloon = window.innerWidth - balloonWidth - offset;
      }

      // Ajusta posicionamento vertical para não sair da tela
      if (topBalloon < 0) {
        topBalloon = targetRect.bottom + offset; // Move para baixo se não houver espaço acima
      } else if (topBalloon + balloonHeight > window.innerHeight) {
        topBalloon = targetRect.top - balloonHeight - offset; // Move para cima se não houver espaço abaixo
      }

      // Evita sobreposição com o botão
      if (
        (this.position === 'top' && topBalloon + balloonHeight > targetRect.top) ||
        (this.position === 'bottom' && topBalloon < targetRect.bottom)
      ) {
        // Reposiciona para cima ou para baixo baseado no espaço disponível
        if (this.position === 'top') {
          topBalloon = targetRect.bottom + offset; // Força para baixo
        } else {
          topBalloon = targetRect.top - balloonHeight - offset; // Força para cima
        }
      }

      // Aplica os estilos calculados
      this.renderer.setStyle(balloon, 'top', `${topBalloon}px`);
      this.renderer.setStyle(balloon, 'left', `${leftBalloon}px`);
    }
  }

  dismiss() {
    const balloon = this.balloonRef.nativeElement;
    this.renderer.setStyle(balloon, 'display', 'none');
    this.agenteService.recordInteraction({ text: this.message, type: 'assistant' });
    this.inactivityService.closeAgent();
  }

  openChat() {
    const dialogRef = this.dialog.open(ChatAssistantModalDialogComponent, {
      data: { contextMessage: this.messageSafe },
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      panelClass: 'full-screen-dialog',
    });

    dialogRef.afterClosed().subscribe(async (_) => {
      this.closeDiag();
    });
  }

  async closeDiag() { }
}

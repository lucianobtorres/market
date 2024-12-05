import { Component, Input } from '@angular/core';
import { AgentService } from 'src/app/services/agente/agente.service';

@Component({
  selector: 'app-balloon-guide',
  templateUrl: './balloon-guide.component.html',
  styleUrls: ['./balloon-guide.component.scss'],
})
export class BalloonGuideComponent {
  @Input() title!: string;
  @Input() message!: string;
  @Input() dismissable: boolean = true;

  constructor(
    private agenteService: AgentService
  ) { }
  dismiss() {
    const balloon = document.querySelector('.balloon') as HTMLElement;
    if (balloon) balloon.style.display = 'none';
    this.agenteService.recordInteraction({ text: this.message, type: 'assistant' });
  }
}

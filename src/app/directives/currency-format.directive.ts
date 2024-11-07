import { Directive, ElementRef, HostBinding, HostListener, Inject, Optional } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';

@Directive({
  selector: '[appCurrency]'
})
export class CurrencyFormatDirective {
  private setTooltipByDirective = false;

  @HostBinding('class.texto-ellipsis')
  public ellipsis = true;

  constructor(
    private el: ElementRef,
    @Optional() @Inject(MatTooltip) private matTooltip: MatTooltip
  ) { }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (!this.el || !this.el.nativeElement || !this.matTooltip) return;

    if (this.el.nativeElement.offsetWidth < this.el.nativeElement.scrollWidth) {

      if (!this.matTooltip.message) {
        this.setTooltipByDirective = true;
        this.matTooltip.message = this.el.nativeElement.textContent;
      }

      this.matTooltip.show();
    }
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    if (!this.el || !this.el.nativeElement || !this.matTooltip) return;

    if (this.setTooltipByDirective) this.matTooltip.message = '';

    this.matTooltip.hide();
  }
}

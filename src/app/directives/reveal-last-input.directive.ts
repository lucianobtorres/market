import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Directive({
  selector: 'input[appRevealLastInput]'
})
export class RevealLastInputDirective {
  private lastInputValue!: string;

  constructor(private renderer: Renderer2, private el: ElementRef) { }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowUp') {
      this.revealLastInput();
    }
  }

  private revealLastInput() {
    const inputElement = this.el.nativeElement as HTMLInputElement;
    console.log('revealLastInput', this.lastInputValue)
    if (inputElement && this.lastInputValue && inputElement.value === '') {
      inputElement.value = this.lastInputValue;
    }
  }

  @HostListener('input', ['$event.target.value'])
  onInput(value: string) {
    this.lastInputValue = value;
  }
}

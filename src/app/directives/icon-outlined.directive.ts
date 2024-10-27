import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { Directive, Input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Directive({
  selector: 'mat-icon[outlined]'
})
export class IconOutlinedDirective {
  @Input()
  set bcdsIconOutlined(isOutline: BooleanInput) {
    this._matIcon.fontSet = (coerceBooleanProperty(isOutline))
      ? 'outlined'
      : ''
      ;
  }

  constructor(private readonly _matIcon: MatIcon) { }
}

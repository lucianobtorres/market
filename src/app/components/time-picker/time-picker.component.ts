import { DecimalPipe } from '@angular/common';
import { FocusMonitor } from '@angular/cdk/a11y';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { Component, ElementRef, HostBinding, Inject, Input, OnDestroy, Optional, Self, ViewChild, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, ControlValueAccessor, NgControl, Validators, ValidationErrors, FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { MatFormField, MatFormFieldControl, MAT_FORM_FIELD } from '@angular/material/form-field';
import { Subject } from 'rxjs';

const focusOrigin = 'program';
const componentSelector = 'app-time-picker';
const noop: Function = () => { /* no operation */ };

@Component({
  selector: componentSelector,
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.scss'],
  providers: [
    DecimalPipe,
    { provide: MatFormFieldControl, useExisting: TimePickerComponent },
  ],
  encapsulation: ViewEncapsulation.None
})
export class TimePickerComponent
  implements ControlValueAccessor, MatFormFieldControl<TimeValue>,
  OnInit, OnDestroy {
  @HostBinding('class')
  protected class = componentSelector;

  @ViewChild('hora') public horaInput?: ElementRef;
  @ViewChild('minuto') public minutoInput?: ElementRef;

  @HostBinding()
  public id = `${componentSelector}-${TimePickerComponent.nextId++}`;
  private static nextId = 0;

  public autofilled?: boolean;
  public focused = false;
  public touched = false;
  public userAriaDescribedBy?: string;
  public controlType: string = componentSelector;
  public stateChanges = new Subject<void>();

  public onChange: Function = noop;
  public onTouched: Function = noop;

  public internalForm: FormGroup<{
    hora: FormControl<string | null>,
    minuto: FormControl<string | null>
  }>;

  @HostBinding('class.floating')
  get shouldLabelFloat(): boolean {
    return this.focused || !this.empty;
  }

  get empty(): boolean {
    const {
      value: { hora, minuto },
    } = this.internalForm;

    return !hora && !minuto;
  }

  @Input()
  get value(): TimeValue | null {
    if (this.internalForm.invalid) {
      return null;
    }

    return TimePickerComponent.createTimeValue(this.internalForm.getRawValue());
  }
  set value(value: TimeValue | null) {
    if (value) this.setNewTime(value);
    else this.internalForm.reset();

    this.stateChanges.next();
  }

  get errorState(): boolean {
    if (this.ngControl?.untouched) {
      return false;
    }

    if (this.ngControl?.errors) {
      return true;
    }

    if (this.internalForm.valid || this._disabled) {
      return false;
    }

    if (this.required && this.touched) {
      return true;
    }

    if (!!this.ngControl?.invalid &&
      (!!this.ngControl?.touched || !!this.ngControl?.dirty)) {
      return true;
    }

    return !this.empty;
  }

  public readonly placeholder = '';

  @Input()
  get required(): boolean {
    return this._required || this.ngControl.control?.hasValidator(Validators.required) === true;
  }
  set required(value: BooleanInput) {
    this._required = coerceBooleanProperty(value);
    this.stateChanges.next();
  }
  private _required = false;

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: BooleanInput) {
    this._disabled = coerceBooleanProperty(value);
    this._disabled ? this.internalForm.disable() : this.internalForm.enable();
    this.stateChanges.next();
  }
  private _disabled = false;

  constructor(
    formBuilder: FormBuilder,
    private _pipeDec: DecimalPipe,
    private _focusMonitor: FocusMonitor,
    private _elementRef: ElementRef<HTMLElement>,
    @Optional() @Inject(MAT_FORM_FIELD) public _formField: MatFormField,
    @Optional() @Self() public ngControl: NgControl
  ) {
    const validatorsParams = [Validators.pattern(/\d{2}/), Validators.minLength(2), Validators.maxLength(2), Validators.min(0)];
    this.internalForm = formBuilder.group({
      hora: ['', [...validatorsParams, Validators.max(23)]],
      minuto: ['', [...validatorsParams, Validators.max(59)]],
    });

    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit(): void {
    if (!this.ngControl?.control) return;

    this.ngControl.control.addValidators(
      (_control: AbstractControl): ValidationErrors | null => {
        return this.internalForm.invalid
          ? { internalInvalid: true }
          : null
          ;
      }
    );

    if (this.ngControl.control.hasValidator(Validators.required)) {
      this.required = true;
      this.internalForm.controls.hora.addValidators(Validators.required);
      this.internalForm.controls.minuto.addValidators(Validators.required);
    }
  }

  ngOnDestroy(): void {
    this.stateChanges.complete();
    this._focusMonitor.stopMonitoring(this._elementRef);
  }

  private setNewTime(timeValue: TimeValue): void {
    const hora = this._pipeDec.transform(timeValue.hora, '2.0');
    const minuto = this._pipeDec.transform(timeValue.minuto, '2.0');
    this.internalForm.setValue({ hora, minuto });
  }

  writeValue(value: TimeValue | null): void {
    this.value = value;
  }

  static createTimeValue(value: { hora: string | null, minuto: string | null }): TimeValue {
    return (!value.hora || !value.minuto)
      ? new TimeValue()
      : new TimeValue({
        hora: parseInt(value.hora, 10),
        minuto: parseInt(value.minuto, 10)
      });
  }

  registerOnChange(fn: Function): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: Function): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  handleInput(control: AbstractControl, nextElement?: HTMLInputElement): void {
    this.autoFocusNext(control, nextElement);
    this.onChange(this.value);
  }

  autoFocusNext(control: AbstractControl, nextElement?: HTMLInputElement): void {
    if (!control.errors && nextElement) {
      this._focusMonitor.focusVia(nextElement, focusOrigin);
    }
  }

  autoFocusPrev(control: AbstractControl, prevElement: HTMLInputElement): void {
    if (control.value.length < 1 && prevElement) {
      this._focusMonitor.focusVia(prevElement, focusOrigin);
    }
  }

  setDescribedByIds(ids: string[]): void {
    const controlElement = this._elementRef.nativeElement.querySelector(
      '.input-container'
    );
    controlElement?.setAttribute('aria-describedby', ids.join(' '));
  }

  onContainerClick(event: MouseEvent): void {
    if (event.target == this.horaInput?.nativeElement
      || event.target == this.minutoInput?.nativeElement) {
      return;
    }

    if (this.shouldLabelFloat) {
      this.setFocus(this.minutoInput);
      return;
    }

    this.setFocus(this.horaInput);
  }

  private setFocus(el: ElementRef | undefined): void {
    if (el) this._focusMonitor.focusVia(el, focusOrigin);
  }

  onFocusIn(): void {
    if (!this.focused) {
      this.focused = true;
      this.stateChanges.next();
    }
  }

  onFocusOut(event: FocusEvent): void {
    if (!this._elementRef.nativeElement.contains(event.relatedTarget as Element)) {
      this.touched = true;
      this.focused = false;
      this.onTouched();
      this.stateChanges.next();
    }
  }
}


export class TimeValue {
  public hora: number;
  public minuto: number;

  constructor(value?: { hora: number, minuto: number }) {
      this.hora = value?.hora ?? 0;
      this.minuto = value?.minuto ?? 0;
  }

  static createWithDate(value: Date | undefined): TimeValue {
      return (value)
          ? new TimeValue({
              hora: value.getHours(),
              minuto: value.getMinutes()
          })
          : new TimeValue()
          ;
  }
}

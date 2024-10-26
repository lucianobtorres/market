import { DatePipe } from '@angular/common';
import { Inject, Injectable, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';

type defaultTypeDate = Date | string | number | null | undefined;

@Injectable({
  providedIn: 'root'
})
@Pipe({
  name: 'shortDate'
})
export class ShortDatePipe extends DatePipe implements PipeTransform {

  constructor(@Inject(LOCALE_ID) locale: string) {
    super(locale);
  }

  override transform(value: null | undefined): null;
  override transform(value: Date | string | number): string | null;
  override transform(value: defaultTypeDate): string | null;
  override transform(value: defaultTypeDate, showTime?: boolean): string | null;
  override transform(value: defaultTypeDate, showTime?: boolean, useHifen?: boolean): string | null;

  override transform(value: string | number | Date | null | undefined, showTime?: boolean, useHifen?: boolean): string | null {
    if (value instanceof Date && isNaN(value.getTime())) {
      value = undefined;
    }

    return super.transform(value,
      showTime
        ? this.useHifen(useHifen)
        : 'shortDate');
  }

  private useHifen(useHifen: boolean | undefined): string | undefined {
    return `dd/MM/yyyy ${useHifen ? '-' : ''} HH:mm`;
  }
}

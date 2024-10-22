import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalize'
})
export class CapitalizePipe implements PipeTransform {

  transform(value: string): string;
  transform(value: string, somenteInicio: boolean): string;
  transform(value: string, somenteInicio: boolean = false): string {
    if (!value) return value;

    if (somenteInicio){
      value = value.toLowerCase(); // Coloca tudo em minúsculas
      return value.charAt(0).toUpperCase() + value.slice(1); // Capitaliza apenas a primeira letra
    }

    return value
      .toLowerCase() // Coloca tudo em minúsculas
      .split(' ')    // Separa as palavras por espaço
      .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1)) // Capitaliza a primeira letra
      .join(' ');    // Junta as palavras de volta
  }

}

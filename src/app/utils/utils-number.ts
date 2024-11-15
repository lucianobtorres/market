
export abstract class UtilsNumber {
  static convertValueToDecimal(preco: number | string | null | undefined): number | undefined {
    const value = preco;

    // Verifica se o valor tem uma vírgula e a substitui por ponto para cálculos
    if (typeof value === 'string' && value.includes(',')) {
      const convertido = value.replace(',', '.');
      return Number(convertido);
    }

    const price = parseFloat(preco?.toString() ?? "");
    if (isNaN(price) || price < 0) {
      return 0;
    }

    return Number(preco);
  }

  static convertDecimalToValue(preco: number | undefined): string | null {
    const price = parseFloat(preco?.toString() ?? "");
    if (!isNaN(price)) {
      return price.toFixed(2).replace('.', ',');;
    }

    const value = preco?.toString();

    // Verifica se o valor tem uma vírgula e a substitui por ponto para cálculos
    if (typeof value === 'string' && value.includes('.')) {
      const convertido = value.replace('.', ',');
      return convertido;
    }

    return value?.toString() ?? null;
  }
}

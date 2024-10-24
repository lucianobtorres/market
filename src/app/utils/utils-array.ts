export abstract class UtilArray {
  static removeItem<T>(arr: Array<T>, item: T): boolean {
    const index = arr.indexOf(item);
    if (index === -1) return false;

    arr.splice(index, 1);
    return true;
  }

  static removeItens<T>(arr: Array<T>, itens: T[]): boolean {
    let removeu = false;
    for (const item of itens) {
      const index = arr.indexOf(item);
      if (index === -1) return false;

      arr.splice(index, 1);
      removeu = true;
    }

    return removeu;
  }

  /**
   * Modifica a referência de um item do array. Não mantém o index do item (nova ref é inserida no final).
   */
  static atualizarRefItem<T>(arr: Array<T>, refAntiga: T, novaRef: T): boolean {
    const index = arr.indexOf(refAntiga);

    if (index === -1) return false;

    arr.splice(index, 1);
    arr.push(novaRef);

    return true;
  }

  static arrayEquals<T>(arr1: T[], arr2: T[]): boolean {
    return arr1.length === arr2.length
      && arr1.every((v: T, i: number) => v === arr2[i]);
  }
}

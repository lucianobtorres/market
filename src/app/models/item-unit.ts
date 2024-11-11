
export enum ItemUnit {
  KG = 'kg',
  GRAMAS = 'gramas',
  LITRO = 'litro',
  ML = 'ml',
  UNID = 'unid.',
  PCT = 'pacote'
}

export const ItemUnitDescriptions: Map<ItemUnit, string> = new Map([
  [ItemUnit.KG, 'Quilogramas'],
  [ItemUnit.GRAMAS, 'Gramas'],
  [ItemUnit.LITRO, 'Litros'],
  [ItemUnit.ML, 'Mililitros'],
  [ItemUnit.UNID, 'Unidades'],
  [ItemUnit.PCT, 'Pacotes']
]);

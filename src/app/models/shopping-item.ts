
export enum ItemUnit {
  KG = 'kg',
  G = 'g',
  L = 'l',
  ML = 'ml',
  UN = 'un'
}

export interface ShoppingItem {
  id: number;
  nome: string;
  notas?: string;
  quantidade?: number;
  unidade?: ItemUnit;
  preco?: number;
  completed: boolean;
}

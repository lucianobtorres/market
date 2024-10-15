export enum TypeToast {
  SUCCESS = 0,
  WARNING = 1,
  ERROR = 2,
  DISMISSING = 3
}

export interface MessageData {
  typeToast: TypeToast;
  message: string;
  description?: string;
}

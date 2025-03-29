import { Color } from '../enums/color.enum';

export interface Expense {
  title: string;
  totalAmount: number;
  color: Color;
}

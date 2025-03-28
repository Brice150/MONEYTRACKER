import { Color } from '../enums/color.enum';

export interface Investment {
  title: string;
  totalAmount: number;
  interestRate: number;
  color: Color;
}

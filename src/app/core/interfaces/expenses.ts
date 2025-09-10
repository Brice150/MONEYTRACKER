import { Expense } from './expense';

export interface Expenses {
  id: string;
  expenses: Expense[];
  income: number;
  userId?: string;
}

import { Expense } from './expense';

export interface Expenses {
  id: string;
  expenses: Expense[];
  userId?: string;
}

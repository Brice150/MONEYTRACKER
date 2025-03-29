import { Expense } from './expense';
import { RealEstate } from './real-estate';

export interface Expenses {
  id: string;
  expenses: Expense[];
  userId?: string;
}

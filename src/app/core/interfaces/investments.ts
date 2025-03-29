import { Investment } from './investment';

export interface Investments {
  id: string;
  investments: Investment[];
  userId?: string;
}

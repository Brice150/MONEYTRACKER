import { ProgressAmount } from './progress-amount';

export interface Progress {
  id: string;
  progressAmounts: ProgressAmount[];
  userId?: string;
}

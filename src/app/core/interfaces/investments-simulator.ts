export interface InvestmentsSimulator {
  id: string;
  totalAmount: number;
  amountPerMonth: number;
  percentage: number;
  goalAmount?: number;
  monthsToGoal?: number;
  yearly: Yearly;
  userId?: string;
}

export interface Yearly {
  date: string[];
  invested: number[];
  interests: number[];
  total: number[];
}

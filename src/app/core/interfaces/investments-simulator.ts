export interface InvestmentsSimulator {
  totalAmount: number;
  amountPerMonth: number;
  percentage: number;
  goalAmount?: number;
  monthsToGoal?: number;
  yearly: Yearly;
}

export interface Yearly {
  date: string[];
  invested: number[];
  interests: number[];
  total: number[];
}

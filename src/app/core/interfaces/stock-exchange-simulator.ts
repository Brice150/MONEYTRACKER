export interface StockExchangeSimulator {
  totalAmount: number;
  amountPerMonth: number;
  percentage: number;
  yearly: Yearly;
}

export interface Yearly {
  date: string[];
  invested: number[];
  interests: number[];
  total: number[];
}

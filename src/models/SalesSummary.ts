export interface SalesSummary {
  date: string;
  total_sales: number;
  total_orders: number;
  total_expenses: number;
  total_profit: number;
}

export interface CreateSalesSummaryInput {
  date: string;
  total_sales: number;
  total_orders: number;
  total_expenses: number;
  total_profit: number;
}

export interface UpdateSalesSummaryInput {
  date?: string;
  total_sales?: number;
  total_orders?: number;
  total_expenses?: number;
  total_profit?: number;
}


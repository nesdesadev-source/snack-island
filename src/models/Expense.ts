export type ExpenseCategory = 'Supplies' | 'Gas' | 'Misc' | 'Utilities' | 'Labor';

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
}

export interface CreateExpenseInput {
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
}

export interface UpdateExpenseInput {
  date?: string;
  category?: ExpenseCategory;
  description?: string;
  amount?: number;
}


export type ExpenseCategory = 
  | 'Supplies' 
  | 'Gas' 
  | 'Misc' 
  | 'Maintenance' 
  | 'Equipment' 
  | 'Food' 
  | 'Utilities' 
  | 'Other';

// This matches the actual database schema from Supabase
export interface Expense {
  id: string;
  expense_date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  supplier_id?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateExpenseInput {
  expense_date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  supplier_id?: string;
}

export interface UpdateExpenseInput {
  expense_date?: string;
  category?: ExpenseCategory;
  description?: string;
  amount?: number;
  supplier_id?: string;
}


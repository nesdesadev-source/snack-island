export type ExpenseCategory = 
  | 'Supplies' 
  | 'Gas' 
  | 'Misc' 
  | 'Maintenance' 
  | 'Equipment' 
  | 'Ingredients' 
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
  paid_by?: string;
  reimburse_status?: number;
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
  paid_by?: string;
  reimburse_status?: number;
}

export interface UpdateExpenseInput {
  expense_date?: string;
  category?: ExpenseCategory;
  description?: string;
  amount?: number;
  supplier_id?: string;
  paid_by?: string;
  reimburse_status?: number;
}


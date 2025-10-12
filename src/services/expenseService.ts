// src/services/expenseService.ts
import { supabase } from '../supabase'
import { type Expense } from '../models/Expense'

interface AddExpenseParams {
  date: string;
  category: string;
  description: string;
  amount: number;
  supplier_id?: string;
  paid_by?: string;
  reimburse_status?: number;
}

interface UpdateExpenseParams {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  supplier_id?: string;
  paid_by?: string;
  reimburse_status?: number;
}

export const expenseService = {
  // ============================
  // CREATE
  // ============================
  async addExpense({ date, category, description, amount, supplier_id, paid_by, reimburse_status }: AddExpenseParams) {
    const { data, error } = await supabase.rpc('add_expense', {
      p_date: date,
      p_category: category,
      p_description: description,
      p_amount: amount,
      p_supplier_id: supplier_id || null,
      p_paid_by: paid_by || null,
      p_reimburse_status: reimburse_status || 0
    })

    if (error) throw error
    return data
  },

  // ============================
  // READ ALL
  // ============================
  async getAll(): Promise<Expense[]> {
    const { data, error } = await supabase.rpc('get_expenses')
    
    if (error) {
      // Fallback to direct table query
      const directResult = await supabase
        .from('expenses')
        .select('*')
        .order('expense_date', { ascending: false })
        .order('created_at', { ascending: false })
      
      if (directResult.error) {
        throw directResult.error
      }
      
      return directResult.data as Expense[]
    }
    
    return data as Expense[]
  },

  // ============================
  // UPDATE
  // ============================
  async updateExpense({ id, date, category, description, amount, supplier_id, paid_by, reimburse_status }: UpdateExpenseParams) {
    const { error } = await supabase.rpc('update_expense', {
      p_id: id,
      p_date: date,
      p_category: category,
      p_description: description,
      p_amount: amount,
      p_supplier_id: supplier_id || null,
      p_paid_by: paid_by || null,
      p_reimburse_status: reimburse_status || 0
    })

    if (error) throw error
    return true
  },

  // ============================
  // DELETE
  // ============================
  async deleteExpense(id: string) {
    const { error } = await supabase.rpc('delete_expense', { p_id: id })
    if (error) throw error
    return true
  }
}


// src/services/expenseService.ts
import { supabase } from '../supabase'
import { type Expense } from '../models/Expense'

interface AddExpenseParams {
  date: string;
  category: string;
  description: string;
  amount: number;
  supplier_id?: string;
}

interface UpdateExpenseParams {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  supplier_id?: string;
}

export const expenseService = {
  // ============================
  // CREATE
  // ============================
  async addExpense({ date, category, description, amount, supplier_id }: AddExpenseParams) {
    const { data, error } = await supabase.rpc('add_expense', {
      p_date: date,
      p_category: category,
      p_description: description,
      p_amount: amount,
      p_supplier_id: supplier_id || null
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
  async updateExpense({ id, date, category, description, amount, supplier_id }: UpdateExpenseParams) {
    const { error } = await supabase.rpc('update_expense', {
      p_id: id,
      p_date: date,
      p_category: category,
      p_description: description,
      p_amount: amount,
      p_supplier_id: supplier_id || null
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


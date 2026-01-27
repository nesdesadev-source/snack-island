// src/services/discountService.ts
import { supabase } from '../supabase'
import { type Discount } from '../models/Discount'

interface AddDiscountParams {
  name: string;
  description?: string;
  amount: number;
  discount_type: 'flat' | 'percentage';
  is_active?: boolean;
}

interface UpdateDiscountParams {
  id: string;
  name?: string;
  description?: string;
  amount?: number;
  discount_type?: 'flat' | 'percentage';
  is_active?: boolean;
}

export const discountService = {
  // ============================
  // CREATE
  // ============================
  async addDiscount({ name, description, amount, discount_type, is_active }: AddDiscountParams) {
    const { data, error } = await supabase.rpc('add_discount', {
      p_name: name,
      p_amount: amount,
      p_discount_type: discount_type,
      p_description: description || null,
      p_is_active: is_active !== undefined ? is_active : true
    })

    if (error) throw error
    return data
  },

  // ============================
  // READ ALL
  // ============================
  async getAll(): Promise<Discount[]> {
    const { data, error } = await supabase.rpc('get_discounts')
    
    if (error) {
      // Fallback to direct table query
      const directResult = await supabase
        .from('discounts')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (directResult.error) {
        throw directResult.error
      }
      
      return directResult.data as Discount[]
    }
    
    return data as Discount[]
  },

  // ============================
  // UPDATE
  // ============================
  async updateDiscount({ id, name, description, amount, discount_type, is_active }: UpdateDiscountParams) {
    const { error } = await supabase.rpc('update_discount', {
      p_id: id,
      p_name: name || null,
      p_description: description !== undefined ? (description || null) : null,
      p_amount: amount || null,
      p_discount_type: discount_type || null,
      p_is_active: is_active !== undefined ? is_active : null
    })

    if (error) throw error
    return true
  },

  // ============================
  // DELETE
  // ============================
  async deleteDiscount(id: string) {
    const { error } = await supabase.rpc('delete_discount', { p_id: id })
    if (error) throw error
    return true
  }
}

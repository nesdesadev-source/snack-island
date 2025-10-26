// src/services/inventoryService.ts
import { supabase } from '../supabase'

interface AddItemParams {
  name: string;
  unit: string; 
  quantity: number;
  reorder_level: number;
  supplier_id: string | null;
}

interface UpdateItemParams {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  reorder_level: number;
  supplier_id: string | null;
}

export const inventoryService = {
  // ============================
  // CREATE
  // ============================
  async addItem({ name, unit, quantity, reorder_level, supplier_id }: AddItemParams) {
    const { data, error } = await supabase.rpc('add_inventory_item', {
      _name: name,
      _unit: unit,
      _quantity: quantity,
      _reorder_level: reorder_level,
      _supplier_id: supplier_id || null
    })

    if (error) throw error
    return data
  },

  // ============================
  // READ ALL
  // ============================
  async getAll() {
    // Try RPC first (preferred method)
    const { data, error } = await supabase.rpc('get_inventory')
    
    if (error) {
      // Fallback to direct table query
      const directResult = await supabase
        .from('inventory')
        .select('*')
      
      if (directResult.error) {
        throw directResult.error
      }
      
      return directResult.data
    }
    
    return data
  },

  // ============================
  // READ ONE
  // ============================
  async getById(id: string) {
    const { data, error } = await supabase.rpc('get_inventory_item', { _id: id })
    if (error) throw error
    return data
  },

  async getInventoryItem(id: string) {
    const { data, error } = await supabase.rpc('get_inventory_item', { _id: id })
    if (error) throw error
    return data
  },

  // ============================
  // UPDATE
  // ============================
  async updateItem({ id, name, unit, quantity, reorder_level, supplier_id }: UpdateItemParams) {
    const { error } = await supabase.rpc('update_inventory_item', {
      _id: id,
      _name: name,
      _unit: unit,
      _quantity: quantity,
      _reorder_level: reorder_level,
      _supplier_id: supplier_id || null,
    })

    if (error) throw error
    return true
  },

  // ============================
  // DELETE
  // ============================
  async deleteItem(id: string) {
    const { error } = await supabase.rpc('delete_inventory_item', { _id: id })
    if (error) throw error
    return true
  }
}

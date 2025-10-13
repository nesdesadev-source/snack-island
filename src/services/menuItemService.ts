import { supabase } from '../supabase'
import { type MenuItem, type CreateMenuItemInput } from '../models/MenuItem'

interface UpdateMenuItemParams extends CreateMenuItemInput { id: string }

export const menuItemService = {
  async createMenuItem(input: CreateMenuItemInput): Promise<string> {
    const { data, error } = await supabase.rpc('create_menu_item', {
      _name: input.name,
      _price: input.price,
      _category: input.category
    })
    if (error) throw error
    return data as string
  },

  async getMenuItems(): Promise<MenuItem[]> {
    const { data, error } = await supabase.rpc('get_menu_items')
    if (error) throw error
    return data as MenuItem[]
  },

  async updateMenuItem(params: UpdateMenuItemParams): Promise<boolean> {
    const { error } = await supabase.rpc('update_menu_item', {
      _id: params.id,
      _name: params.name,
      _price: params.price,
      _category: params.category
    })
    if (error) throw error
    return true
  },

  async deleteMenuItem(id: string): Promise<boolean> {
    const { error } = await supabase.rpc('delete_menu_item', { _id: id })
    if (error) throw error
    return true
  }
}



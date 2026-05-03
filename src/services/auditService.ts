import { supabase } from '../supabase'
import type { AuditIngredientMapping } from '../models'

export const AUDIT_INGREDIENTS = [
  'mini patties',
  'mini buns',
  'big patties',
  'big buns',
  'cheese slice',
  'mango slice',
  'avocado slice',
  'royal',
  'coke',
  'sprite',
  'bottled water'
] as const

export type AuditIngredient = typeof AUDIT_INGREDIENTS[number]

export class AuditService {
  static async getMappings(): Promise<AuditIngredientMapping[]> {
    const { data, error } = await supabase
      .from('audit_ingredient_mappings')
      .select('*')

    if (error) {
      console.error('Error fetching audit mappings:', error)
      throw error
    }

    return (data || []) as AuditIngredientMapping[]
  }

  static async upsertMapping(menuItemId: string, ingredient: string, quantity: number): Promise<void> {
    const { error } = await supabase
      .from('audit_ingredient_mappings')
      .upsert(
        { menu_item_id: menuItemId, ingredient, quantity, updated_at: new Date().toISOString() },
        { onConflict: 'menu_item_id,ingredient' }
      )

    if (error) {
      console.error('Error upserting audit mapping:', error)
      throw error
    }
  }

  static async deleteMapping(id: string): Promise<void> {
    const { error } = await supabase
      .from('audit_ingredient_mappings')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting audit mapping:', error)
      throw error
    }
  }
}

import { supabase } from '../supabase'
import { type CreateRecipeMapInput, type RecipeMap } from '../models/RecipeMap'

interface UpdateRecipeMapParams extends CreateRecipeMapInput { id: string }

export const recipeMapService = {
  async createRecipeMap(input: CreateRecipeMapInput): Promise<string> {
    const { data, error } = await supabase.rpc('create_recipe_map', {
      _menu_item_id: input.menu_item_id,
      _ingredient_id: input.ingredient_id,
      _usage_per_order: input.usage_per_order,
      _usage_type: input.usage_type,
      _purchase_price: input.purchase_price,
      _purchase_quantity: input.purchase_quantity,
      _purchase_unit: input.purchase_unit
    })
    if (error) throw error
    return data as string
  },

  async getRecipeMaps(): Promise<RecipeMap[]> {
    const { data, error } = await supabase.rpc('get_recipe_maps')
    if (error) throw error
    return data as RecipeMap[]
  },

  async updateRecipeMap(params: UpdateRecipeMapParams): Promise<boolean> {
    const { error } = await supabase.rpc('update_recipe_map', {
      _id: params.id,
      _menu_item_id: params.menu_item_id,
      _ingredient_id: params.ingredient_id,
      _usage_per_order: params.usage_per_order,
      _usage_type: params.usage_type,
      _purchase_price: params.purchase_price,
      _purchase_quantity: params.purchase_quantity,
      _purchase_unit: params.purchase_unit
    })
    if (error) throw error
    return true
  },

  async deleteRecipeMap(id: string): Promise<boolean> {
    const { error } = await supabase.rpc('delete_recipe_map', { _id: id })
    if (error) throw error
    return true
  }
}



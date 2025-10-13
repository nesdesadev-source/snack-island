import type { RecipeMap } from '../../models/RecipeMap'
import { calculateIngredientCostPerOrder } from '../recipes/recipeMapUtils'

export function computeCostPerOrderForMenuItem(allRecipeMaps: RecipeMap[], menuItemId: string, precision = 2): number {
  if (!Array.isArray(allRecipeMaps) || !menuItemId) return 0
  const mapsForItem = allRecipeMaps.filter(m => m.menu_item_id === menuItemId)
  return calculateIngredientCostPerOrder(mapsForItem, precision)
}




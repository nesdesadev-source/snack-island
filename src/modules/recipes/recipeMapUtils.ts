import type { RecipeMap } from '../../models/RecipeMap'

function round(value: number, precision = 2): number {
  const factor = Math.pow(10, precision)
  return Math.round(value * factor) / factor
}

function safeNumber(value: number): number {
  if (!isFinite(value) || isNaN(value)) return 0
  return value
}

export function calculateIngredientCostPerOrder(recipeMaps: RecipeMap[], precision = 2): number {
  if (!Array.isArray(recipeMaps) || recipeMaps.length === 0) return 0

  const total = recipeMaps.reduce((sum, map) => {
    if (map.usage_type !== 'per_order') return sum
    const unitCost = map.purchase_quantity > 0 ? map.purchase_price / map.purchase_quantity : 0
    const ingredientCost = safeNumber(unitCost * map.usage_per_order)
    return sum + ingredientCost
  }, 0)

  return round(Math.max(0, total), precision)
}

export function calculateIngredientCostPerOrderWithBatches(
  recipeMaps: RecipeMap[],
  batchServingsMap: Record<string, number>,
  precision = 2
): number {
  if (!Array.isArray(recipeMaps) || recipeMaps.length === 0) return 0

  const total = recipeMaps.reduce((sum, map) => {
    if (map.usage_type === 'per_order') {
      const unitCost = map.purchase_quantity > 0 ? map.purchase_price / map.purchase_quantity : 0
      const ingredientCost = safeNumber(unitCost * map.usage_per_order)
      return sum + ingredientCost
    }

    if (map.usage_type === 'per_batch') {
      const servings = batchServingsMap[map.ingredient_id]
      if (!servings || servings <= 0) return sum
      const perOrderCost = safeNumber(map.purchase_price / servings)
      return sum + perOrderCost
    }

    return sum
  }, 0)

  return round(Math.max(0, total), precision)
}



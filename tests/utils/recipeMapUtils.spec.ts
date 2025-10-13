import { describe, it, expect } from 'vitest'
import type { RecipeMap } from '../../src/models/RecipeMap'
import {
  calculateIngredientCostPerOrder,
  calculateIngredientCostPerOrderWithBatches
} from '../../src/modules/recipes/recipeMapUtils'

describe('RecipeMap Utils — Ingredient Cost Aggregation', () => {
  describe('calculateIngredientCostPerOrder (per_order only)', () => {
    it('sums cost per order across ingredients with per_order usage', () => {
      const maps: RecipeMap[] = [
        {
          id: '1',
          menu_item_id: 'fries',
          ingredient_id: 'potato',
          usage_per_order: 0.2, // kg
          usage_type: 'per_order',
          purchase_price: 100, // per 10 kg bag
          purchase_quantity: 10, // kg
          purchase_unit: 'kg'
        },
        {
          id: '2',
          menu_item_id: 'fries',
          ingredient_id: 'oil',
          usage_per_order: 0.05, // L
          usage_type: 'per_order',
          purchase_price: 200, // per 5 L jug
          purchase_quantity: 5, // L
          purchase_unit: 'L'
        },
        {
          id: '3',
          menu_item_id: 'fries',
          ingredient_id: 'salt',
          usage_per_order: 0.01, // kg
          usage_type: 'per_order',
          purchase_price: 50, // per 1 kg pack
          purchase_quantity: 1, // kg
          purchase_unit: 'kg'
        }
      ]

      // potato: (100/10)*0.2 = 2
      // oil: (200/5)*0.05 = 2
      // salt: (50/1)*0.01 = 0.5
      // total = 4.5
      const result = calculateIngredientCostPerOrder(maps)
      expect(result).toBeCloseTo(4.5, 2)
    })

    it('ignores per_batch items when no batch servings map is provided', () => {
      const maps: RecipeMap[] = [
        {
          id: '1',
          menu_item_id: 'fries',
          ingredient_id: 'potato',
          usage_per_order: 0.2,
          usage_type: 'per_order',
          purchase_price: 100,
          purchase_quantity: 10,
          purchase_unit: 'kg'
        },
        {
          id: 'batch-1',
          menu_item_id: 'fries',
          ingredient_id: 'cheese-sauce',
          usage_per_order: 0, // irrelevant for per_batch
          usage_type: 'per_batch',
          purchase_price: 300, // per prepared batch cost
          purchase_quantity: 1,
          purchase_unit: 'batch'
        }
      ]

      // potato only: (100/10)*0.2 = 2
      const result = calculateIngredientCostPerOrder(maps)
      expect(result).toBeCloseTo(2, 2)
    })
  })

  describe('calculateIngredientCostPerOrderWithBatches (per_order + per_batch)', () => {
    it('includes per_batch cost apportioned by expected servings', () => {
      const maps: RecipeMap[] = [
        {
          id: '1',
          menu_item_id: 'fries',
          ingredient_id: 'potato',
          usage_per_order: 0.2,
          usage_type: 'per_order',
          purchase_price: 100,
          purchase_quantity: 10,
          purchase_unit: 'kg'
        },
        {
          id: 'batch-1',
          menu_item_id: 'fries',
          ingredient_id: 'cheese-sauce',
          usage_per_order: 0, // per_batch
          usage_type: 'per_batch',
          purchase_price: 300, // cost per batch
          purchase_quantity: 1,
          purchase_unit: 'batch'
        }
      ]

      const batchServingsMap: Record<string, number> = {
        'cheese-sauce': 100 // 300 / 100 = 3 per order
      }

      // potato: 2; cheese-sauce (batch): 3
      const result = calculateIngredientCostPerOrderWithBatches(maps, batchServingsMap)
      expect(result).toBeCloseTo(5, 2)
    })

    it('treats missing batch info as zero cost for those batch ingredients', () => {
      const maps: RecipeMap[] = [
        {
          id: 'batch-2',
          menu_item_id: 'tea',
          ingredient_id: 'tea-concentrate',
          usage_per_order: 0,
          usage_type: 'per_batch',
          purchase_price: 120,
          purchase_quantity: 1,
          purchase_unit: 'batch'
        }
      ]

      const result = calculateIngredientCostPerOrderWithBatches(maps, {})
      expect(result).toBe(0)
    })
  })
})



import { describe, it, expect } from 'vitest'
import type { RecipeMap } from '../../src/models/RecipeMap'
import { computeCostPerOrderForMenuItem } from '../../src/modules/menu/menuPageUtils'
import { calculateSuggestedPriceForTargetProfit, calculateProfitPerOrderForPrice } from '../../src/modules/menu/menuItemUtils'

describe('Menu Page Utils — per-order cost and pricing', () => {
  it('computeCostPerOrderForMenuItem sums only per_order usage for the given menu item', () => {
    const menuItemId = 'fries'
    const maps: RecipeMap[] = [
      {
        id: '1',
        menu_item_id: 'fries',
        ingredient_id: 'potato',
        usage_per_order: 0.2,
        usage_type: 'per_order',
        purchase_price: 100, // 10kg bag
        purchase_quantity: 10,
        purchase_unit: 'kg'
      },
      {
        id: '2',
        menu_item_id: 'fries',
        ingredient_id: 'oil',
        usage_per_order: 0.05,
        usage_type: 'per_order',
        purchase_price: 200, // 5L jug
        purchase_quantity: 5,
        purchase_unit: 'L'
      },
      {
        id: 'batch-ignored',
        menu_item_id: 'fries',
        ingredient_id: 'cheese-sauce',
        usage_per_order: 0,
        usage_type: 'per_batch',
        purchase_price: 300,
        purchase_quantity: 1,
        purchase_unit: 'batch'
      },
      {
        id: 'other-item',
        menu_item_id: 'tea',
        ingredient_id: 'tea-concentrate',
        usage_per_order: 0.02,
        usage_type: 'per_order',
        purchase_price: 120,
        purchase_quantity: 1,
        purchase_unit: 'L'
      }
    ]

    // potato: (100/10)*0.2 = 2
    // oil: (200/5)*0.05 = 2
    // batch ignored for per-order-only
    // other item ignored due to different menu_item_id
    const cost = computeCostPerOrderForMenuItem(maps, menuItemId)
    expect(cost).toBeCloseTo(4, 2)
  })

  it('integrates with suggested price and profit utils', () => {
    const menuItemId = 'fries'
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
        id: '2',
        menu_item_id: 'fries',
        ingredient_id: 'oil',
        usage_per_order: 0.05,
        usage_type: 'per_order',
        purchase_price: 200,
        purchase_quantity: 5,
        purchase_unit: 'L'
      }
    ]

    const costPerOrder = computeCostPerOrderForMenuItem(maps, menuItemId)
    const profitPercent = 50
    const suggested = calculateSuggestedPriceForTargetProfit(costPerOrder, profitPercent)
    const profitAtSuggested = calculateProfitPerOrderForPrice(suggested, costPerOrder)

    expect(costPerOrder).toBeCloseTo(4, 2)
    expect(suggested).toBeCloseTo(6, 2) // 4 * 1.5
    expect(profitAtSuggested).toBeCloseTo(2, 2)
  })
})




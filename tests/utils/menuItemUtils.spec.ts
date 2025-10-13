import { describe, it, expect } from 'vitest'
import {
  calculateSuggestedPriceForTargetProfit,
  calculateProfitPerOrderForPrice
} from '../../src/modules/menu/menuItemUtils'

describe('MenuItem Utils — Pricing Calculations', () => {
  describe('calculateSuggestedPriceForTargetProfit', () => {
    it('uses profit percentage of cost: price = cost * (1 + pct/100)', () => {
      const costPerOrder = 20 // ingredient cost per order
      const profitPercent = 50 // 50% of cost

      const price = calculateSuggestedPriceForTargetProfit(costPerOrder, profitPercent)
      expect(price).toBe(30)
    })

    it('handles decimals and rounds to 2 decimals by default', () => {
      const costPerOrder = 12.345
      const profitPercent = 64 // 64%

      const price = calculateSuggestedPriceForTargetProfit(costPerOrder, profitPercent)
      // 12.345 * 1.64 = 20.2458 -> 20.25
      expect(price).toBeCloseTo(20.25, 2)
    })

    it('supports custom rounding precision', () => {
      const costPerOrder = 12.345
      const profitPercent = 64

      const price = calculateSuggestedPriceForTargetProfit(costPerOrder, profitPercent, 0)
      expect(price).toBe(20)
    })

    it('never returns negative values (guards bad inputs)', () => {
      const price = calculateSuggestedPriceForTargetProfit(-10, -5)
      expect(price).toBe(0)
    })
  })

  describe('calculateProfitPerOrderForPrice', () => {
    it('computes profit per order: price - cost', () => {
      const price = 80
      const costPerOrder = 50
      const profit = calculateProfitPerOrderForPrice(price, costPerOrder)
      expect(profit).toBe(30)
    })

    it('handles decimal values and rounds to 2 decimals by default', () => {
      const price = 50.99
      const costPerOrder = 33.333
      const profit = calculateProfitPerOrderForPrice(price, costPerOrder)
      expect(profit).toBeCloseTo(17.66, 2)
    })

    it('supports custom rounding precision', () => {
      const price = 50.99
      const costPerOrder = 33.333
      const profit = calculateProfitPerOrderForPrice(price, costPerOrder, 0)
      expect(profit).toBe(18)
    })

    it('floors at zero when price is below cost (no negative profit)', () => {
      const price = 20
      const costPerOrder = 25
      const profit = calculateProfitPerOrderForPrice(price, costPerOrder)
      expect(profit).toBe(0)
    })
  })
})



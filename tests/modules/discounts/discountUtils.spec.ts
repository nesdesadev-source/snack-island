import { describe, it, expect } from 'vitest'
import {
  filterActiveDiscounts,
  filterDiscountsByType,
  filterDiscountsBySearch,
  countActiveDiscounts,
  countDiscountsByType,
  countActiveDiscountsByType,
  calculateDiscountAmount,
  calculateDiscountedPrice,
  groupDiscountsByType,
  filterDiscounts
} from '../../../src/modules/discounts/discountUtils'
import type { Discount } from '../../../src/models'

const mockDiscounts: Discount[] = [
  {
    id: '1',
    name: 'Flat 10',
    description: 'Flat discount',
    amount: 10,
    discount_type: 'flat',
    is_active: true
  },
  {
    id: '2',
    name: '20% Off',
    description: 'Percentage discount',
    amount: 20,
    discount_type: 'percentage',
    is_active: true
  },
  {
    id: '3',
    name: 'Flat 5',
    amount: 5,
    discount_type: 'flat',
    is_active: false
  },
  {
    id: '4',
    name: '15% Sale',
    amount: 15,
    discount_type: 'percentage',
    is_active: false
  }
]

describe('discountUtils', () => {
  describe('filterActiveDiscounts', () => {
    it('should return only active discounts', () => {
      const result = filterActiveDiscounts(mockDiscounts)
      expect(result).toHaveLength(2)
      expect(result.every(d => d.is_active)).toBe(true)
    })

    it('should return empty array if no active discounts', () => {
      const inactiveDiscounts = mockDiscounts.filter(d => !d.is_active)
      const result = filterActiveDiscounts(inactiveDiscounts)
      expect(result).toHaveLength(0)
    })
  })

  describe('filterDiscountsByType', () => {
    it('should filter by flat type', () => {
      const result = filterDiscountsByType(mockDiscounts, 'flat')
      expect(result).toHaveLength(2)
      expect(result.every(d => d.discount_type === 'flat')).toBe(true)
    })

    it('should filter by percentage type', () => {
      const result = filterDiscountsByType(mockDiscounts, 'percentage')
      expect(result).toHaveLength(2)
      expect(result.every(d => d.discount_type === 'percentage')).toBe(true)
    })
  })

  describe('filterDiscountsBySearch', () => {
    it('should search by name', () => {
      const result = filterDiscountsBySearch(mockDiscounts, 'Flat')
      expect(result).toHaveLength(2)
      expect(result.every(d => d.name.toLowerCase().includes('flat'))).toBe(true)
    })

    it('should search by description', () => {
      const result = filterDiscountsBySearch(mockDiscounts, 'discount')
      expect(result.length).toBeGreaterThan(0)
    })

    it('should return all discounts if query is empty', () => {
      const result = filterDiscountsBySearch(mockDiscounts, '')
      expect(result).toHaveLength(mockDiscounts.length)
    })
  })

  describe('countActiveDiscounts', () => {
    it('should count active discounts', () => {
      expect(countActiveDiscounts(mockDiscounts)).toBe(2)
    })
  })

  describe('countDiscountsByType', () => {
    it('should count flat discounts', () => {
      expect(countDiscountsByType(mockDiscounts, 'flat')).toBe(2)
    })

    it('should count percentage discounts', () => {
      expect(countDiscountsByType(mockDiscounts, 'percentage')).toBe(2)
    })
  })

  describe('countActiveDiscountsByType', () => {
    it('should count active flat discounts', () => {
      expect(countActiveDiscountsByType(mockDiscounts, 'flat')).toBe(1)
    })

    it('should count active percentage discounts', () => {
      expect(countActiveDiscountsByType(mockDiscounts, 'percentage')).toBe(1)
    })
  })

  describe('calculateDiscountAmount', () => {
    it('should calculate flat discount amount', () => {
      const discount = mockDiscounts[0] // Flat 10
      expect(calculateDiscountAmount(discount, 100)).toBe(10)
    })

    it('should calculate percentage discount amount', () => {
      const discount = mockDiscounts[1] // 20% Off
      expect(calculateDiscountAmount(discount, 100)).toBe(20)
    })

    it('should return 0 for inactive discount', () => {
      const discount = mockDiscounts[2] // Inactive
      expect(calculateDiscountAmount(discount, 100)).toBe(0)
    })

    it('should not discount more than the price for flat discounts', () => {
      const discount = mockDiscounts[0] // Flat 10
      expect(calculateDiscountAmount(discount, 5)).toBe(5) // Should cap at price
    })
  })

  describe('calculateDiscountedPrice', () => {
    it('should calculate final price after flat discount', () => {
      const discount = mockDiscounts[0] // Flat 10
      expect(calculateDiscountedPrice(discount, 100)).toBe(90)
    })

    it('should calculate final price after percentage discount', () => {
      const discount = mockDiscounts[1] // 20% Off
      expect(calculateDiscountedPrice(discount, 100)).toBe(80)
    })

    it('should not go below 0', () => {
      const discount = mockDiscounts[0] // Flat 10
      expect(calculateDiscountedPrice(discount, 5)).toBe(0)
    })
  })

  describe('groupDiscountsByType', () => {
    it('should group discounts by type', () => {
      const result = groupDiscountsByType(mockDiscounts)
      expect(result.flat).toHaveLength(2)
      expect(result.percentage).toHaveLength(2)
    })
  })

  describe('filterDiscounts', () => {
    it('should filter by multiple criteria', () => {
      const result = filterDiscounts(mockDiscounts, {
        searchQuery: 'Flat',
        isActive: true
      })
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Flat 10')
    })

    it('should filter by type and active status', () => {
      const result = filterDiscounts(mockDiscounts, {
        discountType: 'percentage',
        isActive: true
      })
      expect(result).toHaveLength(1)
      expect(result[0].discount_type).toBe('percentage')
      expect(result[0].is_active).toBe(true)
    })
  })
})

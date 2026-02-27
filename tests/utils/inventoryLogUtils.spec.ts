import { describe, it, expect } from 'vitest'
import {
  inferInventoryVerb,
  formatInventoryQuantityLogMessage,
  formatInventoryFieldChangeLogMessage
} from '../../src/modules/inventory/inventoryLogUtils'

describe('Inventory Log Utils', () => {
  describe('inferInventoryVerb', () => {
    it('should infer "add" when new quantity is greater than previous', () => {
      expect(inferInventoryVerb(5, 8)).toBe('add')
    })

    it('should infer "subtract" when new quantity is less than previous', () => {
      expect(inferInventoryVerb(8, 5)).toBe('subtract')
    })

    it('should infer "set" when previous quantity is undefined', () => {
      expect(inferInventoryVerb(undefined, 5)).toBe('set')
    })

    it('should infer "set" when quantities are equal', () => {
      expect(inferInventoryVerb(5, 5)).toBe('set')
    })
  })

  describe('formatInventoryQuantityLogMessage', () => {
    it('should format an add quantity log message', () => {
      const message = formatInventoryQuantityLogMessage({
        displayName: 'Jane Doe',
        itemName: 'Fries',
        unit: 'pcs',
        prevQty: 5,
        newQty: 8
      })

      expect(message).toBe(
        'Jane Doe added 3 pcs to Fries. (Prev: 5 pcs. New: 8 pcs)'
      )
    })

    it('should format a subtract quantity log message', () => {
      const message = formatInventoryQuantityLogMessage({
        displayName: 'Jane Doe',
        itemName: 'Fries',
        unit: 'pcs',
        prevQty: 8,
        newQty: 5
      })

      expect(message).toBe(
        'Jane Doe subtracted 3 pcs from Fries. (Prev: 8 pcs. New: 5 pcs)'
      )
    })

    it('should format a set quantity log message', () => {
      const message = formatInventoryQuantityLogMessage({
        displayName: 'Jane Doe',
        itemName: 'Cooking Oil',
        unit: 'L',
        prevQty: 5,
        newQty: 5
      })

      expect(message).toBe(
        'Jane Doe set Cooking Oil to 5 L. (Prev: 5 L. New: 5 L)'
      )
    })

    it('should handle decimal quantities correctly', () => {
      const message = formatInventoryQuantityLogMessage({
        displayName: 'Jane Doe',
        itemName: 'Cooking Oil',
        unit: 'L',
        prevQty: 5.5,
        newQty: 5.75
      })

      expect(message).toBe(
        'Jane Doe added 0.25 L to Cooking Oil. (Prev: 5.5 L. New: 5.75 L)'
      )
    })

    it('should use "set" when verb override is provided (e.g. from edit form)', () => {
      const message = formatInventoryQuantityLogMessage({
        displayName: 'Jane Doe',
        itemName: 'Cooking Oil',
        unit: 'L',
        prevQty: 2,
        newQty: 8,
        verb: 'set'
      })

      expect(message).toBe(
        'Jane Doe set Cooking Oil to 8 L. (Prev: 2 L. New: 8 L)'
      )
    })
  })

  describe('formatInventoryFieldChangeLogMessage', () => {
    it('should format a field change log message', () => {
      const message = formatInventoryFieldChangeLogMessage({
        displayName: 'Jane Doe',
        itemName: 'Cooking Oil',
        fieldLabel: 'reorder level',
        prevValue: 10,
        newValue: 20
      })

      expect(message).toBe(
        'Jane Doe changed reorder level of Cooking Oil from 10 to 20'
      )
    })

    it('should handle string values', () => {
      const message = formatInventoryFieldChangeLogMessage({
        displayName: 'Jane Doe',
        itemName: 'Cooking Oil',
        fieldLabel: 'name',
        prevValue: 'Old Oil',
        newValue: 'New Oil'
      })

      expect(message).toBe(
        'Jane Doe changed name of Cooking Oil from "Old Oil" to "New Oil"'
      )
    })

    it('should handle null previous values', () => {
      const message = formatInventoryFieldChangeLogMessage({
        displayName: 'Jane Doe',
        itemName: 'Cooking Oil',
        fieldLabel: 'supplier',
        prevValue: null,
        newValue: 'Supplier A'
      })

      expect(message).toBe(
        'Jane Doe changed supplier of Cooking Oil from (none) to "Supplier A"'
      )
    })

    it('should handle null new values', () => {
      const message = formatInventoryFieldChangeLogMessage({
        displayName: 'Jane Doe',
        itemName: 'Cooking Oil',
        fieldLabel: 'supplier',
        prevValue: 'Supplier A',
        newValue: null
      })

      expect(message).toBe(
        'Jane Doe changed supplier of Cooking Oil from "Supplier A" to (none)'
      )
    })
  })
})


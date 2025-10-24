import { describe, it, expect } from 'vitest'
import { 
  calculateItemSubtotal, 
  calculateOrderTotal, 
  validateOrderItems, 
  createOrderItem, 
  updateOrderItemQuantity 
} from '../../src/modules/orders/orderUtils'
import { OrderItem, MenuItem } from '../../src/models'

describe('Order Utils', () => {
  const mockMenuItem: MenuItem = {
    id: 'menu-1',
    name: 'Cheese Fries',
    price: 50,
    category: 'Snack'
  }

  const mockOrderItem: OrderItem = {
    id: 'item-1',
    order_id: 'order-1',
    item_id: 'menu-1',
    quantity: 2,
    subtotal: 100
  }

  describe('calculateItemSubtotal', () => {
    it('should calculate subtotal correctly for positive values', () => {
      expect(calculateItemSubtotal(50, 2)).toBe(100)
      expect(calculateItemSubtotal(25.5, 3)).toBe(76.5)
      expect(calculateItemSubtotal(10, 1)).toBe(10)
    })

    it('should handle zero quantity', () => {
      expect(calculateItemSubtotal(50, 0)).toBe(0)
    })

    it('should handle zero price', () => {
      expect(calculateItemSubtotal(0, 5)).toBe(0)
    })

    it('should throw error for negative price', () => {
      expect(() => calculateItemSubtotal(-10, 2)).toThrow('Price and quantity must be non-negative')
    })

    it('should throw error for negative quantity', () => {
      expect(() => calculateItemSubtotal(10, -2)).toThrow('Price and quantity must be non-negative')
    })
  })

  describe('calculateOrderTotal', () => {
    it('should calculate total for multiple items', () => {
      const items: OrderItem[] = [
        { ...mockOrderItem, subtotal: 100 },
        { ...mockOrderItem, id: 'item-2', subtotal: 75 },
        { ...mockOrderItem, id: 'item-3', subtotal: 25 }
      ]
      expect(calculateOrderTotal(items)).toBe(200)
    })

    it('should return 0 for empty array', () => {
      expect(calculateOrderTotal([])).toBe(0)
    })

    it('should return 0 for null/undefined', () => {
      expect(calculateOrderTotal(null as any)).toBe(0)
      expect(calculateOrderTotal(undefined as any)).toBe(0)
    })

    it('should handle single item', () => {
      const items: OrderItem[] = [{ ...mockOrderItem, subtotal: 50 }]
      expect(calculateOrderTotal(items)).toBe(50)
    })
  })

  describe('validateOrderItems', () => {
    it('should return true for valid items', () => {
      const validItems: OrderItem[] = [
        { ...mockOrderItem, quantity: 2, subtotal: 100 },
        { ...mockOrderItem, id: 'item-2', quantity: 1, subtotal: 50 }
      ]
      expect(validateOrderItems(validItems)).toBe(true)
    })

    it('should return false for empty array', () => {
      expect(validateOrderItems([])).toBe(false)
    })

    it('should return false for null/undefined', () => {
      expect(validateOrderItems(null as any)).toBe(false)
      expect(validateOrderItems(undefined as any)).toBe(false)
    })

    it('should return false for items with zero quantity', () => {
      const invalidItems: OrderItem[] = [
        { ...mockOrderItem, quantity: 0, subtotal: 0 }
      ]
      expect(validateOrderItems(invalidItems)).toBe(false)
    })

    it('should return false for items with negative subtotal', () => {
      const invalidItems: OrderItem[] = [
        { ...mockOrderItem, quantity: 2, subtotal: -100 }
      ]
      expect(validateOrderItems(invalidItems)).toBe(false)
    })

    it('should return false for items with missing IDs', () => {
      const invalidItems: OrderItem[] = [
        { ...mockOrderItem, item_id: '', order_id: 'order-1' }
      ]
      expect(validateOrderItems(invalidItems)).toBe(false)
    })
  })

  describe('createOrderItem', () => {
    it('should create order item with correct subtotal', () => {
      const orderItem = createOrderItem('order-1', mockMenuItem, 3)
      
      expect(orderItem.order_id).toBe('order-1')
      expect(orderItem.item_id).toBe(mockMenuItem.id)
      expect(orderItem.quantity).toBe(3)
      expect(orderItem.subtotal).toBe(150) // 50 * 3
      expect(orderItem.id).toBeDefined()
    })

    it('should throw error for zero quantity', () => {
      expect(() => createOrderItem('order-1', mockMenuItem, 0))
        .toThrow('Quantity must be greater than 0')
    })

    it('should throw error for negative quantity', () => {
      expect(() => createOrderItem('order-1', mockMenuItem, -1))
        .toThrow('Quantity must be greater than 0')
    })
  })

  describe('updateOrderItemQuantity', () => {
    it('should update quantity and recalculate subtotal', () => {
      const updatedItem = updateOrderItemQuantity(mockOrderItem, 4, mockMenuItem)
      
      expect(updatedItem.quantity).toBe(4)
      expect(updatedItem.subtotal).toBe(200) // 50 * 4
      expect(updatedItem.id).toBe(mockOrderItem.id)
      expect(updatedItem.order_id).toBe(mockOrderItem.order_id)
      expect(updatedItem.item_id).toBe(mockOrderItem.item_id)
    })

    it('should throw error for zero quantity', () => {
      expect(() => updateOrderItemQuantity(mockOrderItem, 0, mockMenuItem))
        .toThrow('Quantity must be greater than 0')
    })

    it('should throw error for negative quantity', () => {
      expect(() => updateOrderItemQuantity(mockOrderItem, -2, mockMenuItem))
        .toThrow('Quantity must be greater than 0')
    })
  })
})


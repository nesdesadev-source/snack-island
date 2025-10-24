import type { OrderItem, MenuItem } from '../../models'

/**
 * Calculate the subtotal for a single order item
 * @param price - The price per unit of the item
 * @param quantity - The quantity ordered
 * @returns The subtotal (price * quantity)
 */
export function calculateItemSubtotal(price: number, quantity: number): number {
  if (price < 0 || quantity < 0) {
    throw new Error('Price and quantity must be non-negative')
  }
  return price * quantity
}

/**
 * Calculate the total amount for an order
 * @param items - Array of order items
 * @returns The total amount for the order
 */
export function calculateOrderTotal(items: OrderItem[]): number {
  if (!items || items.length === 0) {
    return 0
  }
  
  return items.reduce((total, item) => {
    return total + item.subtotal
  }, 0)
}

/**
 * Validate order items for correctness
 * @param items - Array of order items to validate
 * @returns True if all items are valid, false otherwise
 */
export function validateOrderItems(items: OrderItem[]): boolean {
  if (!items || items.length === 0) {
    return false
  }
  
  return items.every(item => 
    item.quantity > 0 && 
    item.subtotal >= 0 && 
    item.item_id && 
    item.order_id
  )
}

/**
 * Create a new order item with calculated subtotal
 * @param orderId - The order ID
 * @param menuItem - The menu item being ordered
 * @param quantity - The quantity ordered
 * @returns A new OrderItem with calculated subtotal
 */
export function createOrderItem(
  orderId: string, 
  menuItem: MenuItem, 
  quantity: number
): OrderItem {
  if (quantity <= 0) {
    throw new Error('Quantity must be greater than 0')
  }
  
  const subtotal = calculateItemSubtotal(menuItem.price, quantity)
  
  return {
    id: crypto.randomUUID(),
    order_id: orderId,
    item_id: menuItem.id,
    quantity,
    subtotal
  }
}

/**
 * Update the quantity of an order item and recalculate subtotal
 * @param orderItem - The order item to update
 * @param newQuantity - The new quantity
 * @param menuItem - The menu item for price reference
 * @returns Updated order item with new quantity and subtotal
 */
export function updateOrderItemQuantity(
  orderItem: OrderItem,
  newQuantity: number,
  menuItem: MenuItem
): OrderItem {
  if (newQuantity <= 0) {
    throw new Error('Quantity must be greater than 0')
  }
  
  return {
    ...orderItem,
    quantity: newQuantity,
    subtotal: calculateItemSubtotal(menuItem.price, newQuantity)
  }
}

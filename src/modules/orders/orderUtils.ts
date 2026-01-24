import type { OrderItem, MenuItem, FriesOption, DrinkOption } from '../../models'

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
    item.menu_id && 
    item.order_id
  )
}

/**
 * Create a new order item with calculated subtotal
 * @param orderId - The order ID
 * @param menuItem - The menu item being ordered
 * @param quantity - The quantity ordered
 * @param created_by - The user who created the order item
 * @param fries_option - Optional fries variation
 * @param is_spicy - Optional spicy option
 * @param drink_option - Optional drink variation
 * @returns A new OrderItem with calculated subtotal
 */
export function createOrderItem(
  orderId: string, 
  menuItem: MenuItem, 
  quantity: number,
  created_by: string,
  fries_option?: FriesOption,
  is_spicy?: boolean,
  drink_option?: DrinkOption
): OrderItem {
  if (quantity <= 0) {
    throw new Error('Quantity must be greater than 0')
  }
  
  const subtotal = calculateItemSubtotal(menuItem.price, quantity)
  
  return {
    id: crypto.randomUUID(),
    order_id: orderId,
    menu_id: menuItem.id,
    quantity,
    subtotal,
    created_at: new Date().toISOString(),
    created_by: created_by,
    fries_option,
    is_spicy,
    drink_option
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

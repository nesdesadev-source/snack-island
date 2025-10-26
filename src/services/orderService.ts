import { supabase } from '../supabase'
import type { Order, OrderItem, CreateOrderInput, CreateOrderItemInput, OrderStatus } from '../models'
import { deductInventoryForOrder, restoreInventoryForOrder, checkInventoryAvailability } from '../modules/orders/inventoryDeduction'

export class OrderService {
  /**
   * Get all orders with optional filters
   */
  static async getOrders(options?: {
    status?: OrderStatus;
    limit?: number;
    offset?: number;
  }): Promise<Order[]> {
    const { data, error } = await supabase.rpc('get_orders', {
      p_status: options?.status || null,
      p_limit: options?.limit || 50,
      p_offset: options?.offset || 0
    })
    
    if (error) {
      console.error('Error fetching orders:', error)
      throw error
    }
    
    return data || []
  }

  /**
   * Get orders by status
   */
  static async getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
    return this.getOrders({ status })
  }

  /**
   * Get a single order by ID
   */
  static async getOrderById(id: string): Promise<Order | null> {
    const { data, error } = await supabase.rpc('get_order', {
      p_id: id
    })
    
    if (error) {
      console.error('Error fetching order:', error)
      return null
    }
    
    return data
  }

  /**
   * Check inventory availability for order items
   */
  static async checkInventoryForOrderItems(orderItems: OrderItem[]): Promise<{
    isAvailable: boolean
    insufficientItems: Array<{
      ingredientId: string
      ingredientName: string
      required: number
      available: number
    }>
  }> {
    return await checkInventoryAvailability(orderItems)
  }

  /**
   * Create a new order
   */
  static async createOrder(orderData: CreateOrderInput): Promise<Order> {
    const { data, error } = await supabase.rpc('create_order', {
      p_total_amount: orderData.total_amount,
      p_payment_method: orderData.payment_method || null,
      p_status: orderData.status || 'pending'
    })
    
    if (error) {
      console.error('Error creating order:', error)
      throw error
    }
    
    // Database function returns array, extract first element
    const order = Array.isArray(data) ? data[0] : data
    
    if (!order) {
      throw new Error('Failed to create order: No data returned')
    }
    
    return order
  }

  /**
   * Create a new order with inventory validation
   */
  static async createOrderWithInventoryCheck(
    orderData: CreateOrderInput, 
    orderItems: OrderItem[]
  ): Promise<{
    order?: Order
    inventoryCheck: {
      isAvailable: boolean
      insufficientItems: Array<{
        ingredientId: string
        ingredientName: string
        required: number
        available: number
      }>
    }
  }> {
    // Check inventory availability first
    const inventoryCheck = await this.checkInventoryForOrderItems(orderItems)
    
    if (!inventoryCheck.isAvailable) {
      return {
        inventoryCheck
      }
    }
    
    // If inventory is available, create the order
    const order = await this.createOrder(orderData)
    
    return {
      order,
      inventoryCheck
    }
  }

  /**
   * Update an order
   */
  static async updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
    const { data, error } = await supabase.rpc('update_order', {
      p_id: id,
      p_total_amount: updates.total_amount || null,
      p_payment_method: updates.payment_method || null,
      p_status: updates.status || null
    })
    
    if (error) {
      console.error('Error updating order:', error)
      throw error
    }
    
    return data
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    const updatedOrder = await this.updateOrder(id, { status })
    
    // Handle inventory based on status changes
    try {
      const orderItems = await this.getOrderItems(id)
    
      if (status === 'pending') {
        // Deduct inventory when order moves to preparing
        await deductInventoryForOrder(orderItems)
      } else if (status === 'cancelled') {
        // Restore inventory when order is cancelled
        await restoreInventoryForOrder(orderItems)
      }
    } catch (error) {
      console.error(`Error handling inventory for order ${id} with status ${status}:`, error)
      // Note: We don't throw here to avoid breaking the order status update
      // The inventory operation failure should be logged and handled separately
    }
    
    return updatedOrder
  }

  /**
   * Delete an order
   */
  static async deleteOrder(id: string): Promise<void> {
    const { error } = await supabase.rpc('delete_order', {
      p_id: id
    })
    
    if (error) {
      console.error('Error deleting order:', error)
      throw error
    }
  }

  /**
   * Get orders by user
   */
  static async getOrdersByUser(userId?: string): Promise<Order[]> {
    const { data, error } = await supabase.rpc('get_orders_by_user', {
      p_user_id: userId || null
    })
    
    if (error) {
      console.error('Error fetching orders by user:', error)
      throw error
    }
    
    return data || []
  }

  /**
   * Get order items for a specific order
   */
  static async getOrderItems(orderId: string): Promise<OrderItem[]> {
    const { data, error } = await supabase.rpc('get_order_items', {
      p_order_id: orderId
    })
    
    if (error) {
      console.error('Error fetching order items:', error)
      throw error
    }
    
    // Map the database result to our expected interface
    const mappedData = (data || []).map((item: any) => ({
      id: item.id,
      order_id: item.order_id,
      quantity: item.quantity,
      subtotal: item.subtotal,
      created_at: item.created_at,
      created_by: item.created_by,
      menu_id: item.menu_id
    }))
    
    return mappedData
  }

  /**
   * Get a single order item by ID
   */
  static async getOrderItem(id: string): Promise<OrderItem | null> {
    const { data, error } = await supabase.rpc('get_order_item', {
      p_id: id
    })
    
    if (error) {
      console.error('Error fetching order item:', error)
      return null
    }
    
    if (!data) return null
    
    // Map the database result to our expected interface
    return {
      id: data.id,
      order_id: data.order_id,
      quantity: data.quantity,
      subtotal: data.subtotal,
      created_at: data.created_at,
      created_by: data.created_by,
      menu_id: data.menu_id
    }
  }

  /**
   * Get order items with filters
   */
  static async getOrderItemsWithFilters(options?: {
    orderId?: string;
    menuId?: string;
    limit?: number;
    offset?: number;
  }): Promise<OrderItem[]> {
    const { data, error } = await supabase.rpc('get_order_items', {
      p_order_id: options?.orderId || null,
      p_menu_id: options?.menuId || null,
      p_limit: options?.limit || 50,
      p_offset: options?.offset || 0
    })
    
    if (error) {
      console.error('Error fetching order items with filters:', error)
      throw error
    }
    
    return data || []
  }

  /**
   * Get order items by order (enhanced version)
   */
  static async getOrderItemsByOrder(orderId: string): Promise<OrderItem[]> {
    const { data, error } = await supabase.rpc('get_order_items_by_order', {
      p_order_id: orderId
    })
    
    if (error) {
      console.error('Error fetching order items by order:', error)
      throw error
    }
    
    // Map the database result to our expected interface
    const mappedData = (data || []).map((item: any) => ({
      id: item.id,
      order_id: item.order_id,
      quantity: item.quantity,
      subtotal: item.subtotal,
      created_at: item.created_at,
      created_by: item.created_by,
      menu_id: item.menu_id
    }))
    
    return mappedData
  }

  /**
   * Create order items for an order
   */
  static async createOrderItems(items: CreateOrderItemInput[]): Promise<OrderItem[]> {
    const { data, error } = await supabase.rpc('create_order_items', {
      p_items: items
    })
    
    if (error) {
      console.error('Error creating order items:', error)
      throw error
    }
    
    // Map the database result to our expected interface
    const mappedData = (data || []).map((item: any) => ({
      id: item.id,
      order_id: item.order_id,
      quantity: item.quantity,
      subtotal: item.subtotal,
      created_at: item.created_at,
      created_by: item.created_by,
      menu_id: item.menu_id
    }))
    
    return mappedData
  }

  /**
   * Create a single order item
   */
  static async createOrderItem(orderId: string, menuId: string, quantity: number, subtotal: number): Promise<OrderItem> {
    const { data, error } = await supabase.rpc('create_order_item', {
      p_order_id: orderId,
      p_menu_id: menuId,
      p_quantity: quantity,
      p_subtotal: subtotal
    })
    
    if (error) {
      console.error('Error creating order item:', error)
      throw error
    }
    
    // Map the database result to our expected interface
    return {
      id: data.id,
      order_id: data.order_id,
      quantity: data.quantity,
      subtotal: data.subtotal,
      created_at: data.created_at,
      created_by: data.created_by,
      menu_id: data.menu_id
    }
  }

  /**
   * Create multiple order items in batch
   */
  static async createOrderItemsBatch(orderId: string, items: Array<{ menu_id: string; quantity: number; subtotal: number }>): Promise<OrderItem[]> {
    if (!orderId) {
      throw new Error('Order ID is required for creating order items')
    }
    
    const { data, error } = await supabase.rpc('create_order_items_batch', {
      p_order_id: orderId,
      p_items: items
    })
    
    if (error) {
      console.error('Error creating order items batch:', error)
      throw error
    }
    
    // Map the database result to our expected interface
    const mappedData = (data || []).map((item: any) => ({
      id: item.id,
      order_id: item.order_id,
      quantity: item.quantity,
      subtotal: item.subtotal,
      created_at: item.created_at,
      created_by: item.created_by,
      menu_id: item.menu_id
    }))
    
    return mappedData
  }

  /**
   * Update an order item
   */
  static async updateOrderItem(id: string, updates: Partial<OrderItem>): Promise<OrderItem> {
    const { data, error } = await supabase.rpc('update_order_item', {
      p_id: id,
      p_quantity: updates.quantity || null,
      p_subtotal: updates.subtotal || null
    })
    
    if (error) {
      console.error('Error updating order item:', error)
      throw error
    }
    
    // Map the database result to our expected interface
    return {
      id: data.id,
      order_id: data.order_id,
      quantity: data.quantity,
      subtotal: data.subtotal,
      created_at: data.created_at,
      created_by: data.created_by,
      menu_id: data.menu_id
    }
  }

  /**
   * Delete an order item
   */
  static async deleteOrderItem(id: string): Promise<void> {
    const { error } = await supabase.rpc('delete_order_item', {
      p_id: id
    })
    
    if (error) {
      console.error('Error deleting order item:', error)
      throw error
    }
  }

  /**
   * Get orders with their items
   */
  static async getOrdersWithItems(): Promise<(Order & { items: OrderItem[] })[]> {
    const { data, error } = await supabase.rpc('get_orders_with_items')
    
    if (error) {
      console.error('Error fetching orders with items:', error)
      throw error
    }
    
    return data || []
  }

  /**
   * Get today's orders
   */
  static async getTodaysOrders(): Promise<Order[]> {
    const { data, error } = await supabase.rpc('get_todays_orders')
    
    if (error) {
      console.error('Error fetching today\'s orders:', error)
      throw error
    }
    
    return data || []
  }
}

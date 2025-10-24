import { supabase } from '../supabase'
import type { Order, OrderItem, CreateOrderInput, CreateOrderItemInput, OrderStatus } from '../models'
import { deductInventoryForOrder } from '../modules/orders/inventoryDeduction'

export class OrderService {
  /**
   * Get all orders
   */
  static async getOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('datetime', { ascending: false })
    
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
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', status)
      .order('datetime', { ascending: true })
    
    if (error) {
      console.error('Error fetching orders by status:', error)
      throw error
    }
    
    return data || []
  }

  /**
   * Get a single order by ID
   */
  static async getOrderById(id: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Error fetching order:', error)
      return null
    }
    
    return data
  }

  /**
   * Create a new order
   */
  static async createOrder(orderData: CreateOrderInput): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating order:', error)
      throw error
    }
    
    return data
  }

  /**
   * Update an order
   */
  static async updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
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
    
    // If order is being completed, deduct inventory
    if (status === 'Completed') {
      try {
        const orderItems = await this.getOrderItems(id)
        await deductInventoryForOrder(orderItems)
        console.log('Inventory deducted for completed order:', id)
      } catch (error) {
        console.error('Error deducting inventory for completed order:', error)
        // Note: We don't throw here to avoid breaking the order status update
        // The inventory deduction failure should be logged and handled separately
      }
    }
    
    return updatedOrder
  }

  /**
   * Delete an order
   */
  static async deleteOrder(id: string): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting order:', error)
      throw error
    }
  }

  /**
   * Get order items for a specific order
   */
  static async getOrderItems(orderId: string): Promise<OrderItem[]> {
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)
    
    if (error) {
      console.error('Error fetching order items:', error)
      throw error
    }
    
    return data || []
  }

  /**
   * Create order items for an order
   */
  static async createOrderItems(items: CreateOrderItemInput[]): Promise<OrderItem[]> {
    const { data, error } = await supabase
      .from('order_items')
      .insert(items)
      .select()
    
    if (error) {
      console.error('Error creating order items:', error)
      throw error
    }
    
    return data || []
  }

  /**
   * Update an order item
   */
  static async updateOrderItem(id: string, updates: Partial<OrderItem>): Promise<OrderItem> {
    const { data, error } = await supabase
      .from('order_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating order item:', error)
      throw error
    }
    
    return data
  }

  /**
   * Delete an order item
   */
  static async deleteOrderItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('order_items')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting order item:', error)
      throw error
    }
  }

  /**
   * Get orders with their items
   */
  static async getOrdersWithItems(): Promise<(Order & { items: OrderItem[] })[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .order('datetime', { ascending: false })
    
    if (error) {
      console.error('Error fetching orders with items:', error)
      throw error
    }
    
    return data?.map(order => ({
      ...order,
      items: order.order_items || []
    })) || []
  }

  /**
   * Get today's orders
   */
  static async getTodaysOrders(): Promise<Order[]> {
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .gte('datetime', `${today}T00:00:00Z`)
      .lt('datetime', `${today}T23:59:59Z`)
      .order('datetime', { ascending: false })
    
    if (error) {
      console.error('Error fetching today\'s orders:', error)
      throw error
    }
    
    return data || []
  }
}

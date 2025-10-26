// import { describe, it, expect, vi, beforeEach } from 'vitest'
// import { OrderService } from '../../src/services/orderService'
// import { supabase } from '../../src/supabase'
// import type { Order, OrderItem, CreateOrderInput, OrderStatus } from '../../src/models'

// // Mock supabase
// vi.mock('../../src/supabase', () => ({
//   supabase: {
//     rpc: vi.fn()
//   }
// }))

// // Mock inventory deduction
// vi.mock('../../src/modules/orders/inventoryDeduction', () => ({
//   deductInventoryForOrder: vi.fn(),
//   restoreInventoryForOrder: vi.fn(),
//   checkInventoryAvailability: vi.fn(),
//   getInventoryImpactSummary: vi.fn()
// }))

// // Helper function to create mock success response
// const createMockSuccessResponse = <T>(data: T) => ({
//   data,
//   error: null,
//   count: null,
//   status: 200,
//   statusText: 'OK'
// } as any)

// // Helper function to create mock error response
// const createMockErrorResponse = (message: string) => ({
//   data: null,
//   error: {
//     message,
//     details: null,
//     hint: null,
//     code: 'PGRST_ERROR'
//   },
//   count: null,
//   status: 400,
//   statusText: 'Bad Request'
// } as any)

// describe('OrderService', () => {
//   beforeEach(() => {
//     vi.clearAllMocks()
//   })

//   describe('getOrders', () => {
//     it('should fetch orders with default parameters', async () => {
//       const mockOrders: Order[] = [
//         {
//           id: '1',
//           total_amount: 99.99,
//           payment_method: 'cash',
//           status: 'pending',
//           created_at: '2023-01-01T00:00:00Z',
//           updated_at: '2023-01-01T00:00:00Z',
//           created_by: 'user1',
//           updated_by: 'user1'
//         }
//       ]

//       vi.mocked(supabase.rpc).mockResolvedValue(createMockSuccessResponse(mockOrders))

//       const result = await OrderService.getOrders()

//       expect(supabase.rpc).toHaveBeenCalledWith('get_orders', {
//         p_status: null,
//         p_limit: 50,
//         p_offset: 0
//       })
//       expect(result).toEqual(mockOrders)
//     })

//     it('should fetch orders with custom filters', async () => {
//       const mockOrders: Order[] = []
//       vi.mocked(supabase.rpc).mockResolvedValue(createMockSuccessResponse(mockOrders))

//       await OrderService.getOrders({
//         status: 'completed',
//         limit: 10,
//         offset: 20
//       })

//       expect(supabase.rpc).toHaveBeenCalledWith('get_orders', {
//         p_status: 'completed',
//         p_limit: 10,
//         p_offset: 20
//       })
//     })

//     it('should throw error when RPC fails', async () => {
//       vi.mocked(supabase.rpc).mockResolvedValue(createMockErrorResponse('RPC failed'))

//       await expect(OrderService.getOrders()).rejects.toThrow('RPC failed')
//     })
//   })

//   describe('getOrdersByStatus', () => {
//     it('should call getOrders with status filter', async () => {
//       const mockOrders: Order[] = []
//       vi.mocked(supabase.rpc).mockResolvedValue(createMockSuccessResponse(mockOrders))

//       await OrderService.getOrdersByStatus('pending')

//       expect(supabase.rpc).toHaveBeenCalledWith('get_orders', {
//         p_status: 'pending',
//         p_limit: 50,
//         p_offset: 0
//       })
//     })
//   })

//   describe('getOrderById', () => {
//     it('should fetch a single order by ID', async () => {
//       const mockOrder: Order = {
//         id: '1',
//         total_amount: 99.99,
//         payment_method: 'cash',
//         status: 'pending',
//         created_at: '2023-01-01T00:00:00Z',
//         updated_at: '2023-01-01T00:00:00Z',
//         created_by: 'user1',
//         updated_by: 'user1'
//       }

//       vi.mocked(supabase.rpc).mockResolvedValue(createMockSuccessResponse(mockOrder))

//       const result = await OrderService.getOrderById('1')

//       expect(supabase.rpc).toHaveBeenCalledWith('get_order', {
//         p_id: '1'
//       })
//       expect(result).toEqual(mockOrder)
//     })

//     it('should return null when order not found', async () => {
//       vi.mocked(supabase.rpc).mockResolvedValue(createMockErrorResponse('Order not found'))

//       const result = await OrderService.getOrderById('nonexistent')

//       expect(result).toBeNull()
//     })
//   })

//   describe('createOrder', () => {
//     it('should create a new order', async () => {
//       const orderData: CreateOrderInput = {
//         total_amount: 99.99,
//         payment_method: 'cash',
//         status: 'pending'
//       }

//       const mockOrder: Order = {
//         id: '1',
//         total_amount: 99.99,
//         payment_method: 'cash',
//         status: 'pending',
//         created_at: '2023-01-01T00:00:00Z',
//         updated_at: '2023-01-01T00:00:00Z',
//         created_by: 'user1',
//         updated_by: 'user1'
//       }

//       vi.mocked(supabase.rpc).mockResolvedValue(createMockSuccessResponse(mockOrder))

//       const result = await OrderService.createOrder(orderData)

//       expect(supabase.rpc).toHaveBeenCalledWith('create_order', {
//         p_total_amount: 99.99,
//         p_payment_method: 'cash',
//         p_status: 'pending'
//       })
//       expect(result).toEqual(mockOrder)
//     })

//     it('should create order with default values', async () => {
//       const orderData: CreateOrderInput = {
//         total_amount: 99.99
//       }

//       const mockOrder: Order = {
//         id: '1',
//         total_amount: 99.99,
//         payment_method: null,
//         status: 'pending',
//         created_at: '2023-01-01T00:00:00Z',
//         updated_at: '2023-01-01T00:00:00Z',
//         created_by: 'user1',
//         updated_by: 'user1'
//       }

//       vi.mocked(supabase.rpc).mockResolvedValue(createMockSuccessResponse(mockOrder))

//       await OrderService.createOrder(orderData)

//       expect(supabase.rpc).toHaveBeenCalledWith('create_order', {
//         p_total_amount: 99.99,
//         p_payment_method: null,
//         p_status: 'pending'
//       })
//     })
//   })

//   describe('updateOrder', () => {
//     it('should update an order', async () => {
//       const updates = {
//         status: 'completed' as OrderStatus,
//         payment_method: 'cash' as const
//       }

//       const mockOrder: Order = {
//         id: '1',
//         total_amount: 99.99,
//         payment_method: 'cash',
//         status: 'completed',
//         created_at: '2023-01-01T00:00:00Z',
//         updated_at: '2023-01-01T00:00:00Z',
//         created_by: 'user1',
//         updated_by: 'user1'
//       }

//       vi.mocked(supabase.rpc).mockResolvedValue(createMockSuccessResponse(mockOrder))

//       const result = await OrderService.updateOrder('1', updates)

//       expect(supabase.rpc).toHaveBeenCalledWith('update_order', {
//         p_id: '1',
//         p_total_amount: null,
//         p_payment_method: 'cash',
//         p_status: 'completed'
//       })
//       expect(result).toEqual(mockOrder)
//     })
//   })

//   describe('updateOrderStatus', () => {
//     it('should update order status and deduct inventory when preparing', async () => {
//       const { deductInventoryForOrder } = await import('../../src/modules/orders/inventoryDeduction')
      
//       const mockOrder: Order = {
//         id: '1',
//         total_amount: 99.99,
//         payment_method: 'cash',
//         status: 'preparing',
//         created_at: '2023-01-01T00:00:00Z',
//         updated_at: '2023-01-01T00:00:00Z',
//         created_by: 'user1',
//         updated_by: 'user1'
//       }

//       const mockOrderItems: OrderItem[] = [
//         {
//           id: '1',
//           order_id: '1',
//           menu_id: 'menu1',
//           created_at: '2023-01-01T00:00:00Z',
//           created_by: 'user1',
//           quantity: 2,
//           subtotal: 19.98
//         }
//       ]

//       vi.mocked(supabase.rpc)
//         .mockResolvedValueOnce(createMockSuccessResponse(mockOrder)) // updateOrder
//         .mockResolvedValueOnce(createMockSuccessResponse(mockOrderItems)) // getOrderItems

//       vi.mocked(deductInventoryForOrder).mockResolvedValue(undefined)

//       const result = await OrderService.updateOrderStatus('1', 'preparing')

//       expect(supabase.rpc).toHaveBeenCalledWith('update_order', {
//         p_id: '1',
//         p_total_amount: null,
//         p_payment_method: null,
//         p_status: 'preparing'
//       })
//       expect(deductInventoryForOrder).toHaveBeenCalledWith(mockOrderItems)
//       expect(result).toEqual(mockOrder)
//     })

//     it('should restore inventory when order is cancelled', async () => {
//       const { restoreInventoryForOrder } = await import('../../src/modules/orders/inventoryDeduction')
      
//       const mockOrder: Order = {
//         id: '1',
//         total_amount: 99.99,
//         payment_method: 'cash',
//         status: 'cancelled',
//         created_at: '2023-01-01T00:00:00Z',
//         updated_at: '2023-01-01T00:00:00Z',
//         created_by: 'user1',
//         updated_by: 'user1'
//       }

//       const mockOrderItems: OrderItem[] = [
//         {
//           id: '1',
//           order_id: '1',
//           menu_id: 'menu1',
//           created_at: '2023-01-01T00:00:00Z',
//           created_by: 'user1',
//           quantity: 2,
//           subtotal: 19.98
//         }
//       ]

//       vi.mocked(supabase.rpc)
//         .mockResolvedValueOnce(createMockSuccessResponse(mockOrder)) // updateOrder
//         .mockResolvedValueOnce(createMockSuccessResponse(mockOrderItems)) // getOrderItems

//       vi.mocked(restoreInventoryForOrder).mockResolvedValue(undefined)

//       const result = await OrderService.updateOrderStatus('1', 'cancelled')

//       expect(supabase.rpc).toHaveBeenCalledWith('update_order', {
//         p_id: '1',
//         p_total_amount: null,
//         p_payment_method: null,
//         p_status: 'cancelled'
//       })
//       expect(restoreInventoryForOrder).toHaveBeenCalledWith(mockOrderItems)
//       expect(result).toEqual(mockOrder)
//     })

//     it('should not handle inventory for other statuses', async () => {
//       const { deductInventoryForOrder, restoreInventoryForOrder } = await import('../../src/modules/orders/inventoryDeduction')
      
//       const mockOrder: Order = {
//         id: '1',
//         total_amount: 99.99,
//         payment_method: 'cash',
//         status: 'ready',
//         created_at: '2023-01-01T00:00:00Z',
//         updated_at: '2023-01-01T00:00:00Z',
//         created_by: 'user1',
//         updated_by: 'user1'
//       }

//       vi.mocked(supabase.rpc).mockResolvedValue(createMockSuccessResponse(mockOrder))

//       await OrderService.updateOrderStatus('1', 'ready')

//       expect(deductInventoryForOrder).not.toHaveBeenCalled()
//       expect(restoreInventoryForOrder).not.toHaveBeenCalled()
//     })
//   })

//   describe('deleteOrder', () => {
//     it('should delete an order', async () => {
//       vi.mocked(supabase.rpc).mockResolvedValue(createMockSuccessResponse(null))

//       await OrderService.deleteOrder('1')

//       expect(supabase.rpc).toHaveBeenCalledWith('delete_order', {
//         p_id: '1'
//       })
//     })
//   })

//   describe('getOrdersByUser', () => {
//     it('should fetch orders by user ID', async () => {
//       const mockOrders: Order[] = []
//       vi.mocked(supabase.rpc).mockResolvedValue(createMockSuccessResponse(mockOrders))

//       await OrderService.getOrdersByUser('user1')

//       expect(supabase.rpc).toHaveBeenCalledWith('get_orders_by_user', {
//         p_user_id: 'user1'
//       })
//     })

//     it('should fetch current user orders when no user ID provided', async () => {
//       const mockOrders: Order[] = []
//       vi.mocked(supabase.rpc).mockResolvedValue(createMockSuccessResponse(mockOrders))

//       await OrderService.getOrdersByUser()

//       expect(supabase.rpc).toHaveBeenCalledWith('get_orders_by_user', {
//         p_user_id: null
//       })
//     })
//   })

//   describe('getOrderItems', () => {
//     it('should fetch order items for a specific order', async () => {
//       const mockOrderItems: OrderItem[] = [
//         {
//           id: '1',
//           order_id: '1',
//           menu_id: 'menu1',
//           created_at: '2023-01-01T00:00:00Z',
//           created_by: 'user1',
//           quantity: 2,
//           subtotal: 19.98
//         }
//       ]

//       vi.mocked(supabase.rpc).mockResolvedValue(createMockSuccessResponse(mockOrderItems))

//       const result = await OrderService.getOrderItems('1')

//       expect(supabase.rpc).toHaveBeenCalledWith('get_order_items', {
//         p_order_id: '1'
//       })
//       expect(result).toEqual(mockOrderItems)
//     })
//   })

//   describe('createOrderItems', () => {
//     it('should create order items', async () => {
//       const items = [
//         {
//           order_id: '1',
//           menu_id: 'menu1',
//           created_at: '2023-01-01T00:00:00Z',
//           created_by: 'user1',
//           quantity: 2,
//           subtotal: 19.98
//         }
//       ]

//       const mockOrderItems: OrderItem[] = [
//         {
//           id: '1',
//           order_id: '1',
//           menu_id: 'menu1',
//           created_at: '2023-01-01T00:00:00Z',
//           created_by: 'user1',
//           quantity: 2,
//           subtotal: 19.98
//         }
//       ]

//       vi.mocked(supabase.rpc).mockResolvedValue(createMockSuccessResponse(mockOrderItems))

//       const result = await OrderService.createOrderItems(items)

//       expect(supabase.rpc).toHaveBeenCalledWith('create_order_items', {
//         p_items: items
//       })
//       expect(result).toEqual(mockOrderItems)
//     })
//   })

//   describe('updateOrderItem', () => {
//     it('should update an order item', async () => {
//       const updates = {
//         quantity: 3,
//         subtotal: 29.97
//       }

//       const mockOrderItem: OrderItem = {
//         id: '1',
//         order_id: '1',
//         menu_id: 'menu1',
//         created_at: '2023-01-01T00:00:00Z',
//         created_by: 'user1',
//         quantity: 3,
//         subtotal: 29.97
//       }

//       vi.mocked(supabase.rpc).mockResolvedValue(createMockSuccessResponse(mockOrderItem))

//       const result = await OrderService.updateOrderItem('1', updates)

//       expect(supabase.rpc).toHaveBeenCalledWith('update_order_item', {
//         p_id: '1',
//         p_quantity: 3,
//         p_subtotal: 29.97
//       })
//       expect(result).toEqual(mockOrderItem)
//     })
//   })

//   describe('deleteOrderItem', () => {
//     it('should delete an order item', async () => {
//       vi.mocked(supabase.rpc).mockResolvedValue(createMockSuccessResponse(null))

//       await OrderService.deleteOrderItem('1')

//       expect(supabase.rpc).toHaveBeenCalledWith('delete_order_item', {
//         p_id: '1'
//       })
//     })
//   })

//   describe('getOrdersWithItems', () => {
//     it('should fetch orders with their items', async () => {
//       const mockOrdersWithItems = [
//         {
//           id: '1',
//           total_amount: 99.99,
//           payment_method: 'cash',
//           status: 'pending',
//           created_at: '2023-01-01T00:00:00Z',
//           updated_at: '2023-01-01T00:00:00Z',
//           created_by: 'user1',
//           updated_by: 'user1',
//           items: [
//             {
//               id: '1',
//               order_id: '1',
//               menu_id: 'menu1',
//           created_at: '2023-01-01T00:00:00Z',
//           created_by: 'user1',
//               quantity: 2,
//               subtotal: 19.98
//             }
//           ]
//         }
//       ]

//       vi.mocked(supabase.rpc).mockResolvedValue(createMockSuccessResponse(mockOrdersWithItems))

//       const result = await OrderService.getOrdersWithItems()

//       expect(supabase.rpc).toHaveBeenCalledWith('get_orders_with_items')
//       expect(result).toEqual(mockOrdersWithItems)
//     })
//   })

//   describe('getTodaysOrders', () => {
//     it('should fetch today\'s orders', async () => {
//       const mockOrders: Order[] = []
//       vi.mocked(supabase.rpc).mockResolvedValue(createMockSuccessResponse(mockOrders))

//       const result = await OrderService.getTodaysOrders()

//       expect(supabase.rpc).toHaveBeenCalledWith('get_todays_orders')
//       expect(result).toEqual(mockOrders)
//     })
//   })

//   describe('createOrderItem', () => {
//     it('should create a single order item', async () => {
//       const mockOrderItem: OrderItem = {
//         id: '1',
//         order_id: 'order-1',
//         menu_id: 'menu-1',
//         created_at: '2023-01-01T00:00:00Z',
//         created_by: 'user1',
//         quantity: 2,
//         subtotal: 29.98
//       }

//       vi.mocked(supabase.rpc).mockResolvedValue(createMockSuccessResponse(mockOrderItem))

//       const result = await OrderService.createOrderItem('order-1', 'menu-1', 2, 29.98)

//       expect(supabase.rpc).toHaveBeenCalledWith('create_order_item', {
//         p_order_id: 'order-1',
//         p_menu_id: 'menu-1',
//         p_quantity: 2,
//         p_subtotal: 29.98
//       })
//       expect(result).toEqual(mockOrderItem)
//     })

//     it('should throw error when creation fails', async () => {
//       vi.mocked(supabase.rpc).mockResolvedValue(createMockErrorResponse('Creation failed'))

//       await expect(OrderService.createOrderItem('order-1', 'menu-1', 2, 29.98))
//         .rejects.toThrow('Creation failed')
//     })
//   })

//   describe('createOrderItemsBatch', () => {
//     it('should create multiple order items in batch', async () => {
//       const mockOrderItems: OrderItem[] = [
//         {
//           id: '1',
//           order_id: 'order-1',
//           menu_id: 'menu-1',
//         created_at: '2023-01-01T00:00:00Z',
//         created_by: 'user1',
//           quantity: 2,
//           subtotal: 29.98
//         },
//         {
//           id: '2',
//           order_id: 'order-1',
//           menu_id: 'menu-2',
//           created_at: '2023-01-01T00:00:00Z',
//           created_by: 'user1',
//           quantity: 1,
//           subtotal: 15.99
//         }
//       ]

//       vi.mocked(supabase.rpc).mockResolvedValue(createMockSuccessResponse(mockOrderItems))

//       const items = [
//         { menu_id: 'menu-1', quantity: 2, subtotal: 29.98 },
//         { menu_id: 'menu-2', quantity: 1, subtotal: 15.99 }
//       ]

//       const result = await OrderService.createOrderItemsBatch('order-1', items)

//       expect(supabase.rpc).toHaveBeenCalledWith('create_order_items_batch', {
//         p_order_id: 'order-1',
//         p_items: items
//       })
//       expect(result).toEqual(mockOrderItems)
//     })

//     it('should return empty array when no data returned', async () => {
//       vi.mocked(supabase.rpc).mockResolvedValue(createMockSuccessResponse(null))

//       const result = await OrderService.createOrderItemsBatch('order-1', [])

//       expect(result).toEqual([])
//     })
//   })

//   describe('getOrderItem', () => {
//     it('should fetch a single order item by ID', async () => {
//       const mockOrderItem: OrderItem = {
//         id: '1',
//         order_id: 'order-1',
//         menu_id: 'menu-1',
//         created_at: '2023-01-01T00:00:00Z',
//         created_by: 'user1',
//         quantity: 2,
//         subtotal: 29.98
//       }

//       vi.mocked(supabase.rpc).mockResolvedValue(createMockSuccessResponse(mockOrderItem))

//       const result = await OrderService.getOrderItem('1')

//       expect(supabase.rpc).toHaveBeenCalledWith('get_order_item', {
//         p_id: '1'
//       })
//       expect(result).toEqual(mockOrderItem)
//     })

//     it('should return null when item not found', async () => {
//       vi.mocked(supabase.rpc).mockResolvedValue(createMockSuccessResponse(null))

//       const result = await OrderService.getOrderItem('nonexistent')

//       expect(result).toBeNull()
//     })

//     it('should return null when error occurs', async () => {
//       vi.mocked(supabase.rpc).mockResolvedValue(createMockErrorResponse('Item not found'))

//       const result = await OrderService.getOrderItem('1')

//       expect(result).toBeNull()
//     })
//   })

//   describe('getOrderItemsWithFilters', () => {
//     it('should fetch order items with all filters', async () => {
//       const mockOrderItems: OrderItem[] = [
//         {
//           id: '1',
//           order_id: 'order-1',
//           menu_id: 'menu-1',
//         created_at: '2023-01-01T00:00:00Z',
//         created_by: 'user1',
//           quantity: 2,
//           subtotal: 29.98
//         }
//       ]

//       vi.mocked(supabase.rpc).mockResolvedValue(createMockSuccessResponse(mockOrderItems))

//       const result = await OrderService.getOrderItemsWithFilters({
//         orderId: 'order-1',
//         menuId: 'menu-1',
//         limit: 10,
//         offset: 0
//       })

//       expect(supabase.rpc).toHaveBeenCalledWith('get_order_items', {
//         p_order_id: 'order-1',
//         p_menu_id: 'menu-1',
//         p_limit: 10,
//         p_offset: 0
//       })
//       expect(result).toEqual(mockOrderItems)
//     })

//     it('should fetch order items with default parameters when no options provided', async () => {
//       vi.mocked(supabase.rpc).mockResolvedValue(createMockSuccessResponse([]))

//       const result = await OrderService.getOrderItemsWithFilters()

//       expect(supabase.rpc).toHaveBeenCalledWith('get_order_items', {
//         p_order_id: null,
//         p_menu_id: null,
//         p_limit: 50,
//         p_offset: 0
//       })
//       expect(result).toEqual([])
//     })

//     it('should throw error when fetch fails', async () => {
//       vi.mocked(supabase.rpc).mockResolvedValue(createMockErrorResponse('Fetch failed'))

//       await expect(OrderService.getOrderItemsWithFilters())
//         .rejects.toThrow('Fetch failed')
//     })
//   })

//   describe('getOrderItemsByOrder', () => {
//     it('should fetch order items by order ID', async () => {
//       const mockOrderItems: OrderItem[] = [
//         {
//           id: '1',
//           order_id: 'order-1',
//           menu_id: 'menu-1',
//         created_at: '2023-01-01T00:00:00Z',
//         created_by: 'user1',
//           quantity: 2,
//           subtotal: 29.98
//         }
//       ]

//       vi.mocked(supabase.rpc).mockResolvedValue(createMockSuccessResponse(mockOrderItems))

//       const result = await OrderService.getOrderItemsByOrder('order-1')

//       expect(supabase.rpc).toHaveBeenCalledWith('get_order_items_by_order', {
//         p_order_id: 'order-1'
//       })
//       expect(result).toEqual(mockOrderItems)
//     })

//     it('should return empty array when no items found', async () => {
//       vi.mocked(supabase.rpc).mockResolvedValue(createMockSuccessResponse(null))

//       const result = await OrderService.getOrderItemsByOrder('order-1')

//       expect(result).toEqual([])
//     })

//     it('should throw error when fetch fails', async () => {
//       vi.mocked(supabase.rpc).mockResolvedValue(createMockErrorResponse('Fetch failed'))

//       await expect(OrderService.getOrderItemsByOrder('order-1'))
//         .rejects.toThrow('Fetch failed')
//     })
//   })
// })

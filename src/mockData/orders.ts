import { type Order, type OrderItem, type OrderStatus } from '../models'

// Get current time for realistic timestamps
const now = new Date()
const getRecentTime = (minutesAgo: number) => {
  const time = new Date(now.getTime() - minutesAgo * 60000)
  return time.toISOString()
}

export const mockOrders: Order[] = [
  {
    id: 'order-001',
    datetime: getRecentTime(25),
    total_amount: 150,
    payment_method: 'Cash',
    status: 'Pending'
  },
  {
    id: 'order-002',
    datetime: getRecentTime(20),
    total_amount: 225,
    payment_method: 'GCash',
    status: 'Pending'
  },
  {
    id: 'order-003',
    datetime: getRecentTime(15),
    total_amount: 175,
    payment_method: 'Card',
    status: 'Preparing'
  },
  {
    id: 'order-004',
    datetime: getRecentTime(10),
    total_amount: 300,
    payment_method: 'Cash',
    status: 'Preparing'
  },
  {
    id: 'order-005',
    datetime: getRecentTime(8),
    total_amount: 125,
    payment_method: 'GCash',
    status: 'Ready'
  },
  {
    id: 'order-006',
    datetime: getRecentTime(5),
    total_amount: 200,
    payment_method: 'Card',
    status: 'Ready'
  },
  {
    id: 'order-007',
    datetime: getRecentTime(3),
    total_amount: 275,
    payment_method: 'Cash',
    status: 'Pending'
  },
  {
    id: 'order-008',
    datetime: getRecentTime(60),
    total_amount: 100,
    payment_method: 'GCash',
    status: 'Completed'
  },
  {
    id: 'order-009',
    datetime: getRecentTime(90),
    total_amount: 350,
    payment_method: 'Card',
    status: 'Completed'
  },
  {
    id: 'order-010',
    datetime: getRecentTime(45),
    total_amount: 75,
    payment_method: 'Cash',
    status: 'Cancelled'
  }
]

export const mockOrderItems: OrderItem[] = [
  // Order 001 items - Total: 150
  {
    id: 'item-001',
    order_id: 'order-001',
    item_id: 'menu-001',
    quantity: 2,
    subtotal: 100
  },
  {
    id: 'item-002',
    order_id: 'order-001',
    item_id: 'menu-002',
    quantity: 1,
    subtotal: 50
  },
  // Order 002 items - Total: 225
  {
    id: 'item-003',
    order_id: 'order-002',
    item_id: 'menu-003',
    quantity: 1,
    subtotal: 75
  },
  {
    id: 'item-004',
    order_id: 'order-002',
    item_id: 'menu-004',
    quantity: 2,
    subtotal: 100
  },
  {
    id: 'item-005',
    order_id: 'order-002',
    item_id: 'menu-005',
    quantity: 1,
    subtotal: 50
  },
  // Order 003 items - Total: 175
  {
    id: 'item-006',
    order_id: 'order-003',
    item_id: 'menu-001',
    quantity: 2,
    subtotal: 100
  },
  {
    id: 'item-007',
    order_id: 'order-003',
    item_id: 'menu-003',
    quantity: 1,
    subtotal: 75
  },
  // Order 004 items - Total: 300
  {
    id: 'item-008',
    order_id: 'order-004',
    item_id: 'menu-006',
    quantity: 3,
    subtotal: 150
  },
  {
    id: 'item-009',
    order_id: 'order-004',
    item_id: 'menu-007',
    quantity: 2,
    subtotal: 100
  },
  {
    id: 'item-010',
    order_id: 'order-004',
    item_id: 'menu-008',
    quantity: 1,
    subtotal: 50
  },
  // Order 005 items - Total: 125
  {
    id: 'item-011',
    order_id: 'order-005',
    item_id: 'menu-009',
    quantity: 1,
    subtotal: 75
  },
  {
    id: 'item-012',
    order_id: 'order-005',
    item_id: 'menu-005',
    quantity: 1,
    subtotal: 50
  },
  // Order 006 items - Total: 200
  {
    id: 'item-013',
    order_id: 'order-006',
    item_id: 'menu-001',
    quantity: 2,
    subtotal: 100
  },
  {
    id: 'item-014',
    order_id: 'order-006',
    item_id: 'menu-004',
    quantity: 2,
    subtotal: 100
  },
  // Order 007 items - Total: 275
  {
    id: 'item-015',
    order_id: 'order-007',
    item_id: 'menu-003',
    quantity: 2,
    subtotal: 150
  },
  {
    id: 'item-016',
    order_id: 'order-007',
    item_id: 'menu-006',
    quantity: 2,
    subtotal: 100
  },
  {
    id: 'item-017',
    order_id: 'order-007',
    item_id: 'menu-008',
    quantity: 1,
    subtotal: 50
  },
  // Order 008 items - Total: 100
  {
    id: 'item-018',
    order_id: 'order-008',
    item_id: 'menu-001',
    quantity: 2,
    subtotal: 100
  },
  // Order 009 items - Total: 350
  {
    id: 'item-019',
    order_id: 'order-009',
    item_id: 'menu-009',
    quantity: 2,
    subtotal: 150
  },
  {
    id: 'item-020',
    order_id: 'order-009',
    item_id: 'menu-004',
    quantity: 3,
    subtotal: 150
  },
  {
    id: 'item-021',
    order_id: 'order-009',
    item_id: 'menu-002',
    quantity: 1,
    subtotal: 50
  },
  // Order 010 items - Total: 75
  {
    id: 'item-022',
    order_id: 'order-010',
    item_id: 'menu-003',
    quantity: 1,
    subtotal: 75
  }
]

export const mockMenuItems = [
  {
    id: 'menu-001',
    name: 'Cheese Fries',
    price: 50,
    category: 'Snack'
  },
  {
    id: 'menu-002',
    name: 'Iced Tea',
    price: 50,
    category: 'Drink'
  },
  {
    id: 'menu-003',
    name: 'Combo A (Fries + Drink)',
    price: 75,
    category: 'Combo'
  },
  {
    id: 'menu-004',
    name: 'Chicken Wings',
    price: 50,
    category: 'Snack'
  },
  {
    id: 'menu-005',
    name: 'Soft Drink',
    price: 50,
    category: 'Drink'
  },
  {
    id: 'menu-006',
    name: 'Burger',
    price: 50,
    category: 'Snack'
  },
  {
    id: 'menu-007',
    name: 'Nachos',
    price: 50,
    category: 'Snack'
  },
  {
    id: 'menu-008',
    name: 'Coffee',
    price: 50,
    category: 'Drink'
  },
  {
    id: 'menu-009',
    name: 'Combo B (Burger + Drink)',
    price: 75,
    category: 'Combo'
  },
  {
    id: 'menu-010',
    name: 'Hotdog',
    price: 50,
    category: 'Snack'
  }
]

// Helper function to get orders by status
export function getOrdersByStatus(status: OrderStatus): Order[] {
  return mockOrders.filter(order => order.status === status)
}

// Helper function to get order items for a specific order
export function getOrderItemsByOrderId(orderId: string): OrderItem[] {
  return mockOrderItems.filter(item => item.order_id === orderId)
}

// Helper function to get menu item by ID
export function getMenuItemById(id: string) {
  return mockMenuItems.find(item => item.id === id)
}


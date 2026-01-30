import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { 
  calculateTotalExpenses, 
  calculateExpensesByCategory,
  filterExpensesByDateRange 
} from '../../src/modules/expenses/expenseUtils'
import { isLowStock } from '../../src/modules/inventory/inventoryUtils'
import type { Order, OrderItem, Expense, Inventory } from '../../src/models'

// Mock Chart.js
vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn(),
    registerables: []
  }
}))

describe('Dashboard Utility Functions', () => {
  const mockExpenses: Expense[] = [
    {
      id: '1',
      expense_date: '2024-01-15',
      category: 'Supplies',
      description: 'Cooking oil',
      amount: 50,
      supplier_id: 'supplier1',
      paid_by: 'user1',
      reimburse_status: 0,
      created_by: 'user1',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: null
    },
    {
      id: '2',
      expense_date: '2024-01-14',
      category: 'Gas',
      description: 'Fuel for truck',
      amount: 30,
      supplier_id: 'supplier2',
      paid_by: 'user1',
      reimburse_status: 0,
      created_by: 'user1',
      created_at: '2024-01-14T10:00:00Z',
      updated_at: null
    }
  ]

  const mockInventory: Inventory[] = [
    {
      id: '1',
      name: 'Cooking Oil',
      unit: 'L',
      quantity: 5,
      reorder_level: 10,
      supplier_id: 'supplier1',
      created_at: '2024-01-01T10:00:00Z',
      updated_at: null,
      created_by: 'user1',
      updated_by: null
    },
    {
      id: '2',
      name: 'Potatoes',
      unit: 'kg',
      quantity: 20,
      reorder_level: 5,
      supplier_id: 'supplier2',
      created_at: '2024-01-01T10:00:00Z',
      updated_at: null,
      created_by: 'user1',
      updated_by: null
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Expense Calculations', () => {
    it('calculates total expenses correctly', () => {
      const total = calculateTotalExpenses(mockExpenses)
      expect(total).toBe(80) // 50 + 30
    })

    it('calculates expenses by category correctly', () => {
      const byCategory = calculateExpensesByCategory(mockExpenses)
      expect(byCategory).toEqual({
        'Supplies': 50,
        'Gas': 30
      })
    })

    it('handles empty expenses array', () => {
      const total = calculateTotalExpenses([])
      expect(total).toBe(0)
      
      const byCategory = calculateExpensesByCategory([])
      expect(byCategory).toEqual({})
    })

    it('filters expenses by date range correctly', () => {
      const filtered = filterExpensesByDateRange(
        mockExpenses,
        '2024-01-14',
        '2024-01-15'
      )
      expect(filtered).toHaveLength(2)
      
      const singleDay = filterExpensesByDateRange(
        mockExpenses,
        '2024-01-15',
        '2024-01-15'
      )
      expect(singleDay).toHaveLength(1)
      expect(singleDay[0].category).toBe('Supplies')
    })
  })

  describe('Inventory Calculations', () => {
    it('identifies low stock items correctly', () => {
      const lowStockItems = mockInventory.filter(item => 
        isLowStock(item.quantity, item.reorder_level)
      )
      
      expect(lowStockItems).toHaveLength(1)
      expect(lowStockItems[0].name).toBe('Cooking Oil')
    })

    it('identifies well-stocked items correctly', () => {
      const wellStockedItems = mockInventory.filter(item => 
        !isLowStock(item.quantity, item.reorder_level)
      )
      
      expect(wellStockedItems).toHaveLength(1)
      expect(wellStockedItems[0].name).toBe('Potatoes')
    })

    it('handles edge cases for stock levels', () => {
      expect(isLowStock(0, 5)).toBe(true)
      expect(isLowStock(5, 5)).toBe(true)
      expect(isLowStock(6, 5)).toBe(false)
      expect(isLowStock(10, 5)).toBe(false)
    })
  })

  describe('Dashboard Data Processing', () => {
    it('calculates trend correctly', () => {
      const calculateTrend = (current: number, previous: number): number => {
        if (previous === 0) return 0
        return ((current - previous) / previous) * 100
      }

      expect(calculateTrend(100, 80)).toBe(25) // 25% increase
      expect(calculateTrend(80, 100)).toBe(-20) // 20% decrease
      expect(calculateTrend(100, 0)).toBe(0) // No previous data
      expect(calculateTrend(0, 100)).toBe(-100) // 100% decrease
    })

    it('calculates average order value from totalSales and totalOrders', () => {
      const getAverageOrderValue = (totalSales: number, totalOrders: number): number =>
        totalOrders > 0 ? totalSales / totalOrders : 0

      expect(getAverageOrderValue(1000, 10)).toBe(100)
      expect(getAverageOrderValue(450, 5)).toBe(90)
      expect(getAverageOrderValue(0, 0)).toBe(0)
      expect(getAverageOrderValue(100, 0)).toBe(0)
    })

    it('calculates average order value trend correctly', () => {
      const calculateTrend = (current: number, previous: number): number => {
        if (previous === 0) return 0
        return ((current - previous) / previous) * 100
      }
      const getAverageOrderValue = (totalSales: number, totalOrders: number): number =>
        totalOrders > 0 ? totalSales / totalOrders : 0

      const currentAOV = getAverageOrderValue(1000, 10) // 100
      const previousAOV = getAverageOrderValue(800, 10) // 80
      expect(calculateTrend(currentAOV, previousAOV)).toBe(25) // 25% increase

      const prevZeroOrders = getAverageOrderValue(100, 0) // 0 when no orders
      expect(calculateTrend(100, prevZeroOrders)).toBe(0) // trend is 0 when previous is 0
    })

    it('formats numbers correctly', () => {
      const formatNumber = (num: number): string => {
        return new Intl.NumberFormat('en-US').format(num)
      }

      expect(formatNumber(1234)).toBe('1,234')
      expect(formatNumber(1234567)).toBe('1,234,567')
      expect(formatNumber(0)).toBe('0')
      expect(formatNumber(123.45)).toBe('123.45')
    })

    it('calculates period dates correctly', () => {
      const getPeriodStartDate = (date: Date, period: string): Date => {
        const start = new Date(date)
        
        switch (period) {
          case 'today':
            start.setHours(0, 0, 0, 0)
            break
          case 'week':
            start.setDate(start.getDate() - 7)
            start.setHours(0, 0, 0, 0)
            break
          case 'month':
            start.setMonth(start.getMonth() - 1)
            start.setHours(0, 0, 0, 0)
            break
          case 'year':
            start.setFullYear(start.getFullYear() - 1)
            start.setHours(0, 0, 0, 0)
            break
        }
        
        return start
      }

      const testDate = new Date('2024-01-15T12:00:00Z')
      
      const todayStart = getPeriodStartDate(testDate, 'today')
      expect(todayStart.getHours()).toBe(0)
      expect(todayStart.getMinutes()).toBe(0)
      
      const weekStart = getPeriodStartDate(testDate, 'week')
      expect(weekStart.getDate()).toBe(8) // 15 - 7
      
      const monthStart = getPeriodStartDate(testDate, 'month')
      expect(monthStart.getMonth()).toBe(11) // December (0-indexed)
    })
  })

  describe('Time Formatting', () => {
    it('formats time ago correctly', () => {
      const formatTimeAgo = (date: Date): string => {
        const now = new Date()
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
        
        if (diffInMinutes < 1) return 'Just now'
        if (diffInMinutes < 60) return `${diffInMinutes} min ago`
        
        const diffInHours = Math.floor(diffInMinutes / 60)
        if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
        
        const diffInDays = Math.floor(diffInHours / 24)
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
      }

      const now = new Date()
      const oneMinuteAgo = new Date(now.getTime() - 1 * 60 * 1000)
      const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000)
      const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)

      expect(formatTimeAgo(oneMinuteAgo)).toBe('1 min ago')
      expect(formatTimeAgo(oneHourAgo)).toBe('1 hour ago')
      expect(formatTimeAgo(oneDayAgo)).toBe('1 day ago')
    })
  })

  describe('Top Items Data Processing', () => {
    const mockOrderItems = [
      {
        id: '1',
        order_id: 'order1',
        menu_id: 'menu1',
        quantity: 5,
        subtotal: 50,
        created_at: '2024-01-15T10:00:00Z',
        created_by: 'user1'
      },
      {
        id: '2',
        order_id: 'order1',
        menu_id: 'menu2',
        quantity: 3,
        subtotal: 30,
        created_at: '2024-01-15T10:00:00Z',
        created_by: 'user1'
      },
      {
        id: '3',
        order_id: 'order2',
        menu_id: 'menu1',
        quantity: 2,
        subtotal: 20,
        created_at: '2024-01-15T10:00:00Z',
        created_by: 'user1'
      }
    ]

    const mockMenuItems = [
      {
        id: 'menu1',
        name: 'Cheese Fries',
        price: 10,
        category: 'Snack',
        created_at: '2024-01-01T10:00:00Z',
        updated_at: null,
        created_by: 'user1',
        updated_by: null
      },
      {
        id: 'menu2',
        name: 'Iced Tea',
        price: 10,
        category: 'Drink',
        created_at: '2024-01-01T10:00:00Z',
        updated_at: null,
        created_by: 'user1',
        updated_by: null
      }
    ]

    it('calculates top selling items correctly', () => {
      const getTopItemsData = (orderItems: any[], menuItems: any[], orders: any[]) => {
        const itemCounts: Record<string, number> = {}
        
        // Get completed order IDs
        const completedOrderIds = new Set(
          orders
            .filter(order => order.status === 'completed')
            .map(order => order.id)
        )
        
        orderItems.forEach(orderItem => {
          const menuItemId = orderItem.menu_id
          if (menuItemId && orderItem.order_id && completedOrderIds.has(orderItem.order_id)) {
            itemCounts[menuItemId] = (itemCounts[menuItemId] || 0) + orderItem.quantity
          }
        })
        
        const sortedItems = Object.entries(itemCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
        
        const labels: string[] = []
        const data: number[] = []
        
        sortedItems.forEach(([menuItemId, quantity]) => {
          const menuItem = menuItems.find(item => item.id === menuItemId)
          if (menuItem) {
            labels.push(menuItem.name)
            data.push(quantity)
          }
        })
        
        if (labels.length === 0) {
          return {
            labels: ['No sales data'],
            data: [0]
          }
        }
        
        return { labels, data }
      }

      const mockOrders = [
        { id: 'order1', status: 'completed' },
        { id: 'order2', status: 'completed' }
      ]

      const result = getTopItemsData(mockOrderItems, mockMenuItems, mockOrders)
      
      expect(result.labels).toEqual(['Cheese Fries', 'Iced Tea'])
      expect(result.data).toEqual([7, 3]) // Cheese Fries: 5+2=7, Iced Tea: 3
    })

    it('handles empty order items', () => {
      const getTopItemsData = (orderItems: any[], menuItems: any[], orders: any[]) => {
        const itemCounts: Record<string, number> = {}
        
        // Get completed order IDs
        const completedOrderIds = new Set(
          orders
            .filter(order => order.status === 'completed')
            .map(order => order.id)
        )
        
        orderItems.forEach(orderItem => {
          const menuItemId = orderItem.menu_id
          if (menuItemId && orderItem.order_id && completedOrderIds.has(orderItem.order_id)) {
            itemCounts[menuItemId] = (itemCounts[menuItemId] || 0) + orderItem.quantity
          }
        })
        
        const sortedItems = Object.entries(itemCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
        
        const labels: string[] = []
        const data: number[] = []
        
        sortedItems.forEach(([menuItemId, quantity]) => {
          const menuItem = menuItems.find(item => item.id === menuItemId)
          if (menuItem) {
            labels.push(menuItem.name)
            data.push(quantity)
          }
        })
        
        if (labels.length === 0) {
          return {
            labels: ['No sales data'],
            data: [0]
          }
        }
        
        return { labels, data }
      }

      const mockOrders = [{ id: 'order1', status: 'completed' }]
      const result = getTopItemsData([], mockMenuItems, mockOrders)
      
      expect(result.labels).toEqual(['No sales data'])
      expect(result.data).toEqual([0])
    })

    it('handles null menu_id in order items', () => {
      const orderItemsWithNull = [
        {
          id: '1',
          order_id: 'order1',
          menu_id: null,
          quantity: 5,
          subtotal: 50,
          created_at: '2024-01-15T10:00:00Z',
          created_by: 'user1'
        }
      ]

      const getTopItemsData = (orderItems: any[], menuItems: any[], orders: any[]) => {
        const itemCounts: Record<string, number> = {}
        
        // Get completed order IDs
        const completedOrderIds = new Set(
          orders
            .filter(order => order.status === 'completed')
            .map(order => order.id)
        )
        
        orderItems.forEach(orderItem => {
          const menuItemId = orderItem.menu_id
          if (menuItemId && orderItem.order_id && completedOrderIds.has(orderItem.order_id)) {
            itemCounts[menuItemId] = (itemCounts[menuItemId] || 0) + orderItem.quantity
          }
        })
        
        const sortedItems = Object.entries(itemCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
        
        const labels: string[] = []
        const data: number[] = []
        
        sortedItems.forEach(([menuItemId, quantity]) => {
          const menuItem = menuItems.find(item => item.id === menuItemId)
          if (menuItem) {
            labels.push(menuItem.name)
            data.push(quantity)
          }
        })
        
        if (labels.length === 0) {
          return {
            labels: ['No sales data'],
            data: [0]
          }
        }
        
        return { labels, data }
      }

      const mockOrders = [{ id: 'order1', status: 'completed' }]
      const result = getTopItemsData(orderItemsWithNull, mockMenuItems, mockOrders)
      
      expect(result.labels).toEqual(['No sales data'])
      expect(result.data).toEqual([0])
    })

    it('only includes completed orders in top items calculation', () => {
      const mixedOrderItems = [
        {
          id: '1',
          order_id: 'order1',
          menu_id: 'menu1',
          quantity: 5,
          subtotal: 50,
          created_at: '2024-01-15T10:00:00Z',
          created_by: 'user1'
        },
        {
          id: '2',
          order_id: 'order2',
          menu_id: 'menu1',
          quantity: 3,
          subtotal: 30,
          created_at: '2024-01-15T10:00:00Z',
          created_by: 'user1'
        },
        {
          id: '3',
          order_id: 'order3',
          menu_id: 'menu2',
          quantity: 10,
          subtotal: 100,
          created_at: '2024-01-15T10:00:00Z',
          created_by: 'user1'
        }
      ]

      const mixedOrders = [
        { id: 'order1', status: 'completed' },
        { id: 'order2', status: 'pending' },  // This should be excluded
        { id: 'order3', status: 'completed' }
      ]

      const getTopItemsData = (orderItems: any[], menuItems: any[], orders: any[]) => {
        const itemCounts: Record<string, number> = {}
        
        // Get completed order IDs
        const completedOrderIds = new Set(
          orders
            .filter(order => order.status === 'completed')
            .map(order => order.id)
        )
        
        orderItems.forEach(orderItem => {
          const menuItemId = orderItem.menu_id
          if (menuItemId && orderItem.order_id && completedOrderIds.has(orderItem.order_id)) {
            itemCounts[menuItemId] = (itemCounts[menuItemId] || 0) + orderItem.quantity
          }
        })
        
        const sortedItems = Object.entries(itemCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
        
        const labels: string[] = []
        const data: number[] = []
        
        sortedItems.forEach(([menuItemId, quantity]) => {
          const menuItem = menuItems.find(item => item.id === menuItemId)
          if (menuItem) {
            labels.push(menuItem.name)
            data.push(quantity)
          }
        })
        
        if (labels.length === 0) {
          return {
            labels: ['No sales data'],
            data: [0]
          }
        }
        
        return { labels, data }
      }

      const result = getTopItemsData(mixedOrderItems, mockMenuItems, mixedOrders)
      
      // Should only include completed orders: Cheese Fries (5) + Iced Tea (10) = 15 total
      // Pending order with 3 Cheese Fries should be excluded
      expect(result.labels).toEqual(['Iced Tea', 'Cheese Fries'])
      expect(result.data).toEqual([10, 5]) // Iced Tea: 10, Cheese Fries: 5 (excluding pending order)
    })
  })

  describe('Sales Chart Data Processing', () => {
    it('only includes completed orders in sales chart data', () => {
      const mixedOrders = [
        {
          id: '1',
          total_amount: 100,
          payment_method: 'cash',
          status: 'completed',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: null,
          created_by: 'user1',
          updated_by: null
        },
        {
          id: '2',
          total_amount: 50,
          payment_method: 'gcash',
          status: 'pending',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: null,
          created_by: 'user1',
          updated_by: null
        },
        {
          id: '3',
          total_amount: 75,
          payment_method: 'cash',
          status: 'completed',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: null,
          created_by: 'user1',
          updated_by: null
        }
      ]

      const getSalesChartData = (orders: any[]) => {
        const days = 7
        const data = []
        const labels = []
        
        // Use a fixed date for testing
        const testDate = new Date('2024-01-15T12:00:00Z')
        
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date(testDate)
          date.setDate(date.getDate() - i)
          
          const dayOrders = orders.filter(order => {
            if (!order.created_at) return false
            if (order.status !== 'completed') return false
            const orderDate = new Date(order.created_at)
            return orderDate.toDateString() === date.toDateString()
          })
          
          const daySales = dayOrders.reduce((sum, order) => sum + order.total_amount, 0)
          
          data.push(daySales)
          labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }))
        }
        
        return { data, labels }
      }

      const result = getSalesChartData(mixedOrders)
      
      // Should only include completed orders: 100 + 75 = 175 total
      // Pending order with 50 should be excluded
      // Find the index for January 15, 2024 (Monday)
      const mondayIndex = result.labels.findIndex(label => label === 'Mon')
      expect(result.data[mondayIndex]).toBe(175) // Only completed orders
    })
  })
})
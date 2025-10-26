import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { isLowStock } from '../../src/modules/inventory/inventoryUtils'
import type { Inventory } from '../../src/models/Inventory'

// Mock Chart.js
vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn(),
    registerables: []
  }
}))

describe('Inventory Status Filtering', () => {
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
    },
    {
      id: '3',
      name: 'Salt',
      unit: 'g',
      quantity: 0,
      reorder_level: 100,
      supplier_id: 'supplier3',
      created_at: '2024-01-01T10:00:00Z',
      updated_at: null,
      created_by: 'user1',
      updated_by: null
    },
    {
      id: '4',
      name: 'Sugar',
      unit: 'kg',
      quantity: 2,
      reorder_level: 5,
      supplier_id: 'supplier4',
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

  describe('Inventory Status Calculations', () => {
    it('calculates in-stock items correctly', () => {
      const inStockItems = mockInventory.filter(item => item.quantity > item.reorder_level)
      expect(inStockItems).toHaveLength(1)
      expect(inStockItems[0].name).toBe('Potatoes')
    })

    it('calculates low-stock items correctly', () => {
      const lowStockItems = mockInventory.filter(item => 
        item.quantity > 0 && item.quantity <= item.reorder_level
      )
      expect(lowStockItems).toHaveLength(2)
      expect(lowStockItems.map(item => item.name)).toEqual(['Cooking Oil', 'Sugar'])
    })

    it('calculates out-of-stock items correctly', () => {
      const outOfStockItems = mockInventory.filter(item => item.quantity === 0)
      expect(outOfStockItems).toHaveLength(1)
      expect(outOfStockItems[0].name).toBe('Salt')
    })
  })

  describe('Status Filtering Logic', () => {
    it('filters items by in-stock status', () => {
      const filterByStatus = (items: Inventory[], status: string) => {
        switch (status) {
          case 'in-stock':
            return items.filter(item => item.quantity > item.reorder_level)
          case 'low-stock':
            return items.filter(item => item.quantity > 0 && item.quantity <= item.reorder_level)
          case 'out-of-stock':
            return items.filter(item => item.quantity === 0)
          case 'all':
          default:
            return items
        }
      }

      const inStockItems = filterByStatus(mockInventory, 'in-stock')
      expect(inStockItems).toHaveLength(1)
      expect(inStockItems[0].name).toBe('Potatoes')
    })

    it('filters items by low-stock status', () => {
      const filterByStatus = (items: Inventory[], status: string) => {
        switch (status) {
          case 'in-stock':
            return items.filter(item => item.quantity > item.reorder_level)
          case 'low-stock':
            return items.filter(item => item.quantity > 0 && item.quantity <= item.reorder_level)
          case 'out-of-stock':
            return items.filter(item => item.quantity === 0)
          case 'all':
          default:
            return items
        }
      }

      const lowStockItems = filterByStatus(mockInventory, 'low-stock')
      expect(lowStockItems).toHaveLength(2)
      expect(lowStockItems.map(item => item.name)).toEqual(['Cooking Oil', 'Sugar'])
    })

    it('filters items by out-of-stock status', () => {
      const filterByStatus = (items: Inventory[], status: string) => {
        switch (status) {
          case 'in-stock':
            return items.filter(item => item.quantity > item.reorder_level)
          case 'low-stock':
            return items.filter(item => item.quantity > 0 && item.quantity <= item.reorder_level)
          case 'out-of-stock':
            return items.filter(item => item.quantity === 0)
          case 'all':
          default:
            return items
        }
      }

      const outOfStockItems = filterByStatus(mockInventory, 'out-of-stock')
      expect(outOfStockItems).toHaveLength(1)
      expect(outOfStockItems[0].name).toBe('Salt')
    })

    it('returns all items when status is all', () => {
      const filterByStatus = (items: Inventory[], status: string) => {
        switch (status) {
          case 'in-stock':
            return items.filter(item => item.quantity > item.reorder_level)
          case 'low-stock':
            return items.filter(item => item.quantity > 0 && item.quantity <= item.reorder_level)
          case 'out-of-stock':
            return items.filter(item => item.quantity === 0)
          case 'all':
          default:
            return items
        }
      }

      const allItems = filterByStatus(mockInventory, 'all')
      expect(allItems).toHaveLength(4)
      expect(allItems).toEqual(mockInventory)
    })
  })

  describe('Combined Filtering', () => {
    it('combines status filter with search query', () => {
      const applyFilters = (items: Inventory[], statusFilter: string, searchQuery: string) => {
        let filtered = items
        
        // Apply status filter
        if (statusFilter !== 'all') {
          filtered = filtered.filter(item => {
            switch (statusFilter) {
              case 'in-stock':
                return item.quantity > item.reorder_level
              case 'low-stock':
                return item.quantity > 0 && item.quantity <= item.reorder_level
              case 'out-of-stock':
                return item.quantity === 0
              default:
                return true
            }
          })
        }
        
        // Apply search filter
        if (searchQuery) {
          filtered = filtered.filter(item => 
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.id.toLowerCase().includes(searchQuery.toLowerCase())
          )
        }
        
        return filtered
      }

      // Test low-stock filter with search
      const lowStockWithSearch = applyFilters(mockInventory, 'low-stock', 'oil')
      expect(lowStockWithSearch).toHaveLength(1)
      expect(lowStockWithSearch[0].name).toBe('Cooking Oil')

      // Test out-of-stock filter with search
      const outOfStockWithSearch = applyFilters(mockInventory, 'out-of-stock', 'salt')
      expect(outOfStockWithSearch).toHaveLength(1)
      expect(outOfStockWithSearch[0].name).toBe('Salt')

      // Test search without status filter
      const searchOnly = applyFilters(mockInventory, 'all', 'potato')
      expect(searchOnly).toHaveLength(1)
      expect(searchOnly[0].name).toBe('Potatoes')
    })
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { inventoryChangeLogService } from '../../src/services/inventoryChangeLogService'
import { supabase } from '../../src/supabase'
import { authService } from '../../src/services/authService'
import {
  formatInventoryQuantityLogMessage,
  formatInventoryFieldChangeLogMessage
} from '../../src/modules/inventory/inventoryLogUtils'
import type { Inventory } from '../../src/models/Inventory'

vi.mock('../../src/supabase', () => ({
  supabase: {
    from: vi.fn()
  }
}))

vi.mock('../../src/services/authService', () => ({
  authService: {
    getCurrentUser: vi.fn()
  }
}))

vi.mock('../../src/modules/inventory/inventoryLogUtils', () => ({
  formatInventoryQuantityLogMessage: vi.fn(),
  formatInventoryFieldChangeLogMessage: vi.fn()
}))

// Helper functions for supabase responses
const createMockSuccessResponse = <T>(data: T) => ({
  data,
  error: null,
  count: null,
  status: 200,
  statusText: 'OK'
} as any)

const createMockErrorResponse = (message: string) => ({
  data: null,
  error: {
    message,
    details: null,
    hint: null,
    code: 'PGRST_ERROR'
  },
  count: null,
  status: 400,
  statusText: 'Bad Request'
} as any)

describe('inventoryChangeLogService', () => {
  const baseInventory: Inventory = {
    id: 'inv-1',
    name: 'Fries',
    unit: 'pcs',
    quantity: 10,
    reorder_level: 2,
    supplier_id: 'sup-1'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('logQuantityChange', () => {
    it('should create a quantity change log with current user context', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null })
      vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as any)

      vi.mocked(authService.getCurrentUser).mockReturnValue({
        id: 'user-1',
        username: 'jane.doe',
        roleId: 1
      } as any)

      vi.mocked(formatInventoryQuantityLogMessage).mockReturnValue(
        'Jane Doe added 3 pcs to Fries. (Prev: 5 pcs. New: 8 pcs)'
      )

      await inventoryChangeLogService.logQuantityChange({
        inventory: baseInventory,
        prevQty: 5,
        newQty: 8
      })

      expect(formatInventoryQuantityLogMessage).toHaveBeenCalledWith({
        displayName: 'jane.doe',
        itemName: 'Fries',
        unit: 'pcs',
        prevQty: 5,
        newQty: 8
      })

      expect(supabase.from).toHaveBeenCalledWith('inventory_change_logs')
      expect(mockInsert).toHaveBeenCalledWith({
        inventory_id: 'inv-1',
        user_id: 'user-1',
        message:
          'Jane Doe added 3 pcs to Fries. (Prev: 5 pcs. New: 8 pcs)'
      })
    })

    it('should handle missing user by logging with null user_id', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null })
      vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as any)

      vi.mocked(authService.getCurrentUser).mockReturnValue(null)

      vi.mocked(formatInventoryQuantityLogMessage).mockReturnValue(
        'System added 3 pcs to Fries. (Prev: 5 pcs. New: 8 pcs)'
      )

      await inventoryChangeLogService.logQuantityChange({
        inventory: baseInventory,
        prevQty: 5,
        newQty: 8
      })

      expect(mockInsert).toHaveBeenCalledWith({
        inventory_id: 'inv-1',
        user_id: null,
        message:
          'System added 3 pcs to Fries. (Prev: 5 pcs. New: 8 pcs)'
      })
    })
  })

  describe('logFieldChanges', () => {
    it('should create field change logs for changed fields only', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null })
      vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as any)

      vi.mocked(authService.getCurrentUser).mockReturnValue({
        id: 'user-1',
        username: 'jane.doe',
        roleId: 1
      } as any)

      vi.mocked(formatInventoryFieldChangeLogMessage)
        .mockReturnValueOnce('name changed')
        .mockReturnValueOnce('reorder level changed')

      const prev: Inventory = {
        ...baseInventory,
        name: 'Old Fries',
        reorder_level: 2
      }

      const next: Inventory = {
        ...baseInventory,
        name: 'New Fries',
        reorder_level: 5
      }

      await inventoryChangeLogService.logFieldChanges({
        prev,
        next
      })

      expect(formatInventoryFieldChangeLogMessage).toHaveBeenCalledTimes(2)
      expect(formatInventoryFieldChangeLogMessage).toHaveBeenCalledWith({
        displayName: 'jane.doe',
        itemName: 'Old Fries',
        fieldLabel: 'name',
        prevValue: 'Old Fries',
        newValue: 'New Fries'
      })
      expect(formatInventoryFieldChangeLogMessage).toHaveBeenCalledWith({
        displayName: 'jane.doe',
        itemName: 'Old Fries',
        fieldLabel: 'reorder level',
        prevValue: 2,
        newValue: 5
      })

      expect(mockInsert).toHaveBeenCalledTimes(2)
      expect(mockInsert).toHaveBeenNthCalledWith(1, {
        inventory_id: 'inv-1',
        user_id: 'user-1',
        message: 'name changed'
      })
      expect(mockInsert).toHaveBeenNthCalledWith(2, {
        inventory_id: 'inv-1',
        user_id: 'user-1',
        message: 'reorder level changed'
      })
    })

    it('should not create logs when there are no changes', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null })
      vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as any)

      vi.mocked(authService.getCurrentUser).mockReturnValue({
        id: 'user-1',
        username: 'jane.doe',
        roleId: 1
      } as any)

      await inventoryChangeLogService.logFieldChanges({
        prev: baseInventory,
        next: { ...baseInventory }
      })

      expect(formatInventoryFieldChangeLogMessage).not.toHaveBeenCalled()
      expect(mockInsert).not.toHaveBeenCalled()
    })
  })

  describe('fetchLogs', () => {
    it('should fetch all logs and apply client-side filters', async () => {
      const mockLogs = [
        {
          id: 'log-1',
          inventory_id: 'inv-1',
          user_id: 'user-1',
          message: 'Log 1',
          created_at: '2025-01-02T10:00:00Z'
        },
        {
          id: 'log-2',
          inventory_id: 'inv-2',
          user_id: 'user-2',
          message: 'Log 2',
          created_at: '2025-01-03T10:00:00Z'
        },
        {
          id: 'log-3',
          inventory_id: 'inv-1',
          user_id: 'user-1',
          message: 'Log 3',
          created_at: '2025-01-01T10:00:00Z'
        }
      ]

      const mockOrder = vi.fn(() => createMockSuccessResponse(mockLogs))
      const mockSelect = vi.fn(() => ({ order: mockOrder }))

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect
      } as any)

      const result = await inventoryChangeLogService.fetchLogs({
        inventoryId: 'inv-1',
        userId: 'user-1',
        limit: 10
      })

      expect(supabase.from).toHaveBeenCalledWith('inventory_change_logs')
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(mockOrder).toHaveBeenCalled()

      // Should filter by inventory_id and user_id and sort by created_at desc
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('log-1') // 2025-01-02
      expect(result[1].id).toBe('log-3') // 2025-01-01
    })

    it('should throw when supabase returns an error', async () => {
      const mockOrder = vi.fn(() => createMockErrorResponse('Failed to fetch logs'))
      const mockSelect = vi.fn(() => ({ order: mockOrder }))

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect
      } as any)

      await expect(
        inventoryChangeLogService.fetchLogs({})
      ).rejects.toThrow()
    })
  })
})


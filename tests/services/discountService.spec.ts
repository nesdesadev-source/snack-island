import { describe, it, expect, vi, beforeEach } from 'vitest'
import { discountService } from '../../src/services/discountService'
import { supabase } from '../../src/supabase'
import type { Discount } from '../../src/models'

// Mock supabase
vi.mock('../../src/supabase', () => ({
  supabase: {
    rpc: vi.fn(),
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          data: [],
          error: null
        }))
      }))
    }))
  }
}))

// Helper function to create mock success response
const createMockSuccessResponse = <T>(data: T) => ({
  data,
  error: null,
  count: null,
  status: 200,
  statusText: 'OK'
} as any)

// Helper function to create mock error response
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

describe('discountService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('addDiscount', () => {
    it('should create a new discount', async () => {
      const mockDiscount: Discount = {
        id: '123',
        name: 'Test Discount',
        description: 'Test Description',
        amount: 10,
        discount_type: 'flat',
        is_active: true,
        created_by: 'user-123',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      vi.mocked(supabase.rpc).mockResolvedValueOnce(createMockSuccessResponse(mockDiscount))

      const result = await discountService.addDiscount({
        name: 'Test Discount',
        description: 'Test Description',
        amount: 10,
        discount_type: 'flat',
        is_active: true
      })

      expect(supabase.rpc).toHaveBeenCalledWith('add_discount', {
        p_name: 'Test Discount',
        p_description: 'Test Description',
        p_amount: 10,
        p_discount_type: 'flat',
        p_is_active: true
      })
      expect(result).toEqual(mockDiscount)
    })

    it('should handle errors when creating discount', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce(createMockErrorResponse('Failed to create discount'))

      await expect(
        discountService.addDiscount({
          name: 'Test Discount',
          amount: 10,
          discount_type: 'flat'
        })
      ).rejects.toThrow()
    })
  })

  describe('getAll', () => {
    it('should fetch all discounts', async () => {
      const mockDiscounts: Discount[] = [
        {
          id: '123',
          name: 'Discount 1',
          amount: 10,
          discount_type: 'flat',
          is_active: true
        },
        {
          id: '456',
          name: 'Discount 2',
          amount: 15,
          discount_type: 'percentage',
          is_active: false
        }
      ]

      vi.mocked(supabase.rpc).mockResolvedValueOnce(createMockSuccessResponse(mockDiscounts))

      const result = await discountService.getAll()

      expect(supabase.rpc).toHaveBeenCalledWith('get_discounts')
      expect(result).toEqual(mockDiscounts)
    })

    it('should fallback to direct query if RPC fails', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce(createMockErrorResponse('RPC failed'))
      
      const mockDiscounts: Discount[] = [
        {
          id: '123',
          name: 'Discount 1',
          amount: 10,
          discount_type: 'flat',
          is_active: true
        }
      ]

      const mockFrom = {
        select: vi.fn(() => ({
          order: vi.fn(() => createMockSuccessResponse(mockDiscounts))
        }))
      }

      vi.mocked(supabase.from).mockReturnValue(mockFrom as any)

      const result = await discountService.getAll()

      expect(supabase.from).toHaveBeenCalledWith('discounts')
      expect(result).toEqual(mockDiscounts)
    })
  })

  describe('updateDiscount', () => {
    it('should update a discount', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce(createMockSuccessResponse(true))

      const result = await discountService.updateDiscount({
        id: '123',
        name: 'Updated Discount',
        amount: 20,
        discount_type: 'percentage',
        is_active: false
      })

      expect(supabase.rpc).toHaveBeenCalledWith('update_discount', {
        p_id: '123',
        p_name: 'Updated Discount',
        p_description: null,
        p_amount: 20,
        p_discount_type: 'percentage',
        p_is_active: false
      })
      expect(result).toBe(true)
    })

    it('should handle partial updates', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce(createMockSuccessResponse(true))

      await discountService.updateDiscount({
        id: '123',
        is_active: false
      })

      expect(supabase.rpc).toHaveBeenCalledWith('update_discount', {
        p_id: '123',
        p_name: null,
        p_description: null,
        p_amount: null,
        p_discount_type: null,
        p_is_active: false
      })
    })
  })

  describe('deleteDiscount', () => {
    it('should delete a discount', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce(createMockSuccessResponse(true))

      const result = await discountService.deleteDiscount('123')

      expect(supabase.rpc).toHaveBeenCalledWith('delete_discount', { p_id: '123' })
      expect(result).toBe(true)
    })

    it('should handle errors when deleting discount', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce(createMockErrorResponse('Failed to delete'))

      await expect(discountService.deleteDiscount('123')).rejects.toThrow()
    })
  })
})

import { describe, it, expect } from 'vitest'
import type { Order, OrderStatus } from '../../src/models'
import { sortOrdersForQueue } from '../../src/utils/orderQueueSort'

const baseOrder: Order = {
  id: 'order-1',
  total_amount: 100,
  payment_method: 'cash',
  status: 'pending',
  created_at: null,
  updated_at: null,
  created_by: null,
  updated_by: null
}

describe('sortOrdersForQueue', () => {
  describe('pending', () => {
    it('sorts by created_at ascending (earliest leftmost)', () => {
      const orders: Order[] = [
        { ...baseOrder, id: 'a', created_at: '2025-02-15T14:00:00Z' },
        { ...baseOrder, id: 'b', created_at: '2025-02-15T12:00:00Z' },
        { ...baseOrder, id: 'c', created_at: '2025-02-15T13:00:00Z' }
      ]
      const result = sortOrdersForQueue(orders, 'pending')
      expect(result.map(o => o.id)).toEqual(['b', 'c', 'a'])
    })

    it('returns single order unchanged', () => {
      const orders: Order[] = [{ ...baseOrder, id: 'only', created_at: '2025-02-15T12:00:00Z' }]
      const result = sortOrdersForQueue(orders, 'pending')
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('only')
    })

    it('returns empty array for empty input', () => {
      const result = sortOrdersForQueue([], 'pending')
      expect(result).toEqual([])
    })

    it('puts null created_at at end', () => {
      const orders: Order[] = [
        { ...baseOrder, id: 'no-date', created_at: null },
        { ...baseOrder, id: 'with-date', created_at: '2025-02-15T12:00:00Z' }
      ]
      const result = sortOrdersForQueue(orders, 'pending')
      expect(result.map(o => o.id)).toEqual(['with-date', 'no-date'])
    })
  })

  describe('ready', () => {
    it('sorts by created_at ascending (earliest leftmost)', () => {
      const orders: Order[] = [
        { ...baseOrder, id: 'a', status: 'ready', created_at: '2025-02-15T15:00:00Z' },
        { ...baseOrder, id: 'b', status: 'ready', created_at: '2025-02-15T14:00:00Z' },
        { ...baseOrder, id: 'c', status: 'ready', created_at: '2025-02-15T14:30:00Z' }
      ]
      const result = sortOrdersForQueue(orders, 'ready')
      expect(result.map(o => o.id)).toEqual(['b', 'c', 'a'])
    })
  })

  describe('completed', () => {
    it('sorts by created_at descending (latest leftmost)', () => {
      const orders: Order[] = [
        { ...baseOrder, id: 'a', status: 'completed', created_at: '2025-02-15T12:00:00Z' },
        { ...baseOrder, id: 'b', status: 'completed', created_at: '2025-02-15T14:00:00Z' },
        { ...baseOrder, id: 'c', status: 'completed', created_at: '2025-02-15T13:00:00Z' }
      ]
      const result = sortOrdersForQueue(orders, 'completed')
      expect(result.map(o => o.id)).toEqual(['b', 'c', 'a'])
    })

    it('returns single order unchanged', () => {
      const orders: Order[] = [{ ...baseOrder, id: 'only', status: 'completed', created_at: '2025-02-15T12:00:00Z' }]
      const result = sortOrdersForQueue(orders, 'completed')
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('only')
    })

    it('puts null created_at at end', () => {
      const orders: Order[] = [
        { ...baseOrder, id: 'with-date', status: 'completed', created_at: '2025-02-15T12:00:00Z' },
        { ...baseOrder, id: 'no-date', status: 'completed', created_at: null }
      ]
      const result = sortOrdersForQueue(orders, 'completed')
      expect(result.map(o => o.id)).toEqual(['with-date', 'no-date'])
    })
  })
})

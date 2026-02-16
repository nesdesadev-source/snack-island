import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OrderService } from '../../src/services/orderService'
import { supabase } from '../../src/supabase'
import type { CreateOrderInput } from '../../src/models'

const mockOrder = {
  id: 'ord-1',
  total_amount: 99.99,
  payment_method: 'cash',
  status: 'pending',
  order_fulfillment: 'take_out',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  created_by: null,
  updated_by: null,
}

vi.mock('../../src/supabase', () => ({
  supabase: {
    rpc: vi.fn(),
  },
}))

describe('OrderService createOrder order_fulfillment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: mockOrder,
      error: null,
      count: null,
      status: 200,
      statusText: 'OK',
    } as any)
  })

  it('passes p_order_fulfillment to create_order RPC when provided', async () => {
    const orderData: CreateOrderInput = {
      total_amount: 100,
      payment_method: 'cash',
      status: 'pending',
      order_fulfillment: 'take_out',
    }

    await OrderService.createOrder(orderData)

    expect(supabase.rpc).toHaveBeenCalledWith('create_order', {
      p_total_amount: 100,
      p_payment_method: 'cash',
      p_status: 'pending',
      p_discount_id: null,
      p_order_fulfillment: 'take_out',
    })
  })

  it('passes p_order_fulfillment null when not provided (backend defaults to dine_in)', async () => {
    const orderData: CreateOrderInput = {
      total_amount: 100,
      payment_method: 'cash',
      status: 'pending',
    }

    await OrderService.createOrder(orderData)

    expect(supabase.rpc).toHaveBeenCalledWith('create_order', {
      p_total_amount: 100,
      p_payment_method: 'cash',
      p_status: 'pending',
      p_discount_id: null,
      p_order_fulfillment: null,
    })
  })
})

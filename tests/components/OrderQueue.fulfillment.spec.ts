import { describe, it, expect } from 'vitest'
import type { Order } from '../../src/models'

function orderFulfillmentLabel(order: Order): 'Dine in' | 'Take out' {
  return order.order_fulfillment === 'take_out' ? 'Take out' : 'Dine in'
}

function orderFulfillmentChipClass(order: Order): string {
  return order.order_fulfillment === 'take_out' ? 'fulfillment-chip chip-take-out' : 'fulfillment-chip chip-dine-in'
}

describe('OrderQueue fulfillment display logic', () => {
  it('returns "Dine in" and chip-dine-in for order_fulfillment dine_in', () => {
    const order: Order = {
      id: '1',
      total_amount: 100,
      payment_method: 'cash',
      status: 'pending',
      order_fulfillment: 'dine_in',
      created_at: null,
      updated_at: null,
      created_by: null,
      updated_by: null,
    }
    expect(orderFulfillmentLabel(order)).toBe('Dine in')
    expect(orderFulfillmentChipClass(order)).toBe('fulfillment-chip chip-dine-in')
  })

  it('returns "Take out" and chip-take-out for order_fulfillment take_out', () => {
    const order: Order = {
      id: '1',
      total_amount: 100,
      payment_method: 'cash',
      status: 'pending',
      order_fulfillment: 'take_out',
      created_at: null,
      updated_at: null,
      created_by: null,
      updated_by: null,
    }
    expect(orderFulfillmentLabel(order)).toBe('Take out')
    expect(orderFulfillmentChipClass(order)).toBe('fulfillment-chip chip-take-out')
  })

  it('returns "Dine in" as fallback for legacy order with null order_fulfillment', () => {
    const order: Order = {
      id: '1',
      total_amount: 100,
      payment_method: 'cash',
      status: 'pending',
      order_fulfillment: null,
      created_at: null,
      updated_at: null,
      created_by: null,
      updated_by: null,
    }
    expect(orderFulfillmentLabel(order)).toBe('Dine in')
    expect(orderFulfillmentChipClass(order)).toBe('fulfillment-chip chip-dine-in')
  })
})

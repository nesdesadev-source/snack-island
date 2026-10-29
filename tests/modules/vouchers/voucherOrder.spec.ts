import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createVoucherOrder } from '../../../src/modules/vouchers/voucherOrder'
import { OrderService } from '../../../src/services/orderService'
import { voucherService } from '../../../src/services/voucherService'
import { deductInventoryForOrder } from '../../../src/modules/orders/inventoryDeduction'
import { VOUCHER_MENU_ITEM_ID } from '../../../src/modules/vouchers/voucherUtils'

vi.mock('../../../src/supabase', () => ({ supabase: { rpc: vi.fn(), from: vi.fn() } }))
vi.mock('../../../src/modules/orders/inventoryDeduction', () => ({
  deductInventoryForOrder: vi.fn(),
  restoreInventoryForOrder: vi.fn(),
  checkInventoryAvailability: vi.fn(),
}))

const lines = [
  { code: 'SI-AAAAAA', fries_option: 'cheese' as const, is_spicy: true },
  { code: 'SI-BBBBBB' },
]

describe('createVoucherOrder', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(OrderService, 'createOrder').mockResolvedValue({ id: 'o1', status: 'pending' } as any)
    vi.spyOn(OrderService, 'createOrderItemsBatch').mockResolvedValue([])
    vi.spyOn(OrderService, 'deleteOrder').mockResolvedValue()
    vi.spyOn(voucherService, 'redeemVouchers').mockResolvedValue([])
    vi.spyOn(voucherService, 'releaseVouchersForOrder').mockResolvedValue([])
    vi.mocked(deductInventoryForOrder).mockResolvedValue()
  })

  it('creates a free cash order with one burger per voucher', async () => {
    await createVoucherOrder(lines, 'dine_in')

    expect(OrderService.createOrder).toHaveBeenCalledWith({
      total_amount: 0,
      payment_method: 'cash',
      status: 'pending',
      order_fulfillment: 'dine_in',
      discount_id: null,
    })
    expect(voucherService.redeemVouchers).toHaveBeenCalledWith(['SI-AAAAAA', 'SI-BBBBBB'], 'o1')
    expect(OrderService.createOrderItemsBatch).toHaveBeenCalledWith('o1', [
      { menu_id: VOUCHER_MENU_ITEM_ID, quantity: 1, subtotal: 0, fries_option: 'cheese', is_spicy: true, drink_option: undefined },
      { menu_id: VOUCHER_MENU_ITEM_ID, quantity: 1, subtotal: 0, fries_option: undefined, is_spicy: undefined, drink_option: undefined },
    ])
  })

  it('still deducts the ingredients for the free burgers', async () => {
    await createVoucherOrder(lines, 'take_out')
    const deducted = vi.mocked(deductInventoryForOrder).mock.calls[0]![0]
    expect(deducted).toHaveLength(2)
    expect(deducted.every(i => i.menu_id === VOUCHER_MENU_ITEM_ID && i.quantity === 1 && i.subtotal === 0)).toBe(true)
  })

  it('deletes the order and passes the message on if a code can no longer be used', async () => {
    vi.mocked(voucherService.redeemVouchers).mockRejectedValue(new Error('Code SI-AAAAAA was already used.'))

    await expect(createVoucherOrder(lines, 'dine_in')).rejects.toThrow('Code SI-AAAAAA was already used.')
    expect(OrderService.deleteOrder).toHaveBeenCalledWith('o1')
    expect(OrderService.createOrderItemsBatch).not.toHaveBeenCalled()
    expect(deductInventoryForOrder).not.toHaveBeenCalled()
  })

  it('frees the codes and deletes the order if saving the items fails', async () => {
    vi.mocked(OrderService.createOrderItemsBatch).mockRejectedValue(new Error('db down'))

    await expect(createVoucherOrder(lines, 'dine_in')).rejects.toThrow()
    expect(voucherService.releaseVouchersForOrder).toHaveBeenCalledWith('o1')
    expect(OrderService.deleteOrder).toHaveBeenCalledWith('o1')
  })

  it('refuses an empty order', async () => {
    await expect(createVoucherOrder([], 'dine_in')).rejects.toThrow(/at least one/i)
    expect(OrderService.createOrder).not.toHaveBeenCalled()
  })
})

describe('OrderService voucher hooks', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(voucherService, 'releaseVouchersForOrder').mockResolvedValue([])
  })

  it('puts the codes back to unused when an order is cancelled', async () => {
    vi.spyOn(OrderService, 'updateOrder').mockResolvedValue({ id: 'o1', status: 'cancelled' } as any)
    vi.spyOn(OrderService, 'getOrderItems').mockResolvedValue([])

    await OrderService.updateOrderStatus('o1', 'cancelled')

    expect(voucherService.releaseVouchersForOrder).toHaveBeenCalledWith('o1')
  })

  it('does not touch codes for other status changes', async () => {
    vi.spyOn(OrderService, 'updateOrder').mockResolvedValue({ id: 'o1', status: 'ready' } as any)
    vi.spyOn(OrderService, 'getOrderItems').mockResolvedValue([])

    await OrderService.updateOrderStatus('o1', 'ready')

    expect(voucherService.releaseVouchersForOrder).not.toHaveBeenCalled()
  })
})

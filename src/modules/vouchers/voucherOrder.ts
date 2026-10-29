import type { DrinkOption, FriesOption, Order, OrderFulfillment, OrderItem } from '../../models'
import { OrderService } from '../../services/orderService'
import { voucherService } from '../../services/voucherService'
import { deductInventoryForOrder } from '../orders/inventoryDeduction'
import { VOUCHER_MENU_ITEM_ID } from './voucherUtils'

/** One redeemed code = one free burger, with the customer's choices. */
export interface VoucherOrderLine {
  code: string
  fries_option?: FriesOption
  is_spicy?: boolean
  drink_option?: DrinkOption
}

export function voucherLinesToOrderItems(lines: VoucherOrderLine[], orderId = 'temp-order-id'): OrderItem[] {
  return lines.map((line, i) => ({
    id: `voucher-${i}`,
    order_id: orderId,
    menu_id: VOUCHER_MENU_ITEM_ID,
    quantity: 1,
    subtotal: 0,
    created_at: null,
    created_by: null,
    fries_option: line.fries_option,
    is_spicy: line.is_spicy,
    drink_option: line.drink_option,
  }))
}

/**
 * Creates a separate ₱0 cash order for voucher burgers.
 * If any code can't be used, nothing is saved and the error says why.
 */
export async function createVoucherOrder(lines: VoucherOrderLine[], fulfillment: OrderFulfillment): Promise<Order> {
  if (lines.length === 0) throw new Error('Add at least one voucher code.')

  const order = await OrderService.createOrder({
    total_amount: 0,
    payment_method: 'cash',
    status: 'pending',
    order_fulfillment: fulfillment,
    discount_id: null,
  })

  try {
    await voucherService.redeemVouchers(lines.map(l => l.code), order.id)
  } catch (error) {
    await OrderService.deleteOrder(order.id).catch(e => console.error('Error removing voucher order:', e))
    throw error
  }

  const items = voucherLinesToOrderItems(lines, order.id)
  try {
    await OrderService.createOrderItemsBatch(
      order.id,
      items.map(item => ({
        menu_id: VOUCHER_MENU_ITEM_ID,
        quantity: 1,
        subtotal: 0,
        fries_option: item.fries_option,
        is_spicy: item.is_spicy,
        drink_option: item.drink_option,
      })),
    )
  } catch (error) {
    await voucherService.releaseVouchersForOrder(order.id).catch(e => console.error('Error releasing vouchers:', e))
    await OrderService.deleteOrder(order.id).catch(e => console.error('Error removing voucher order:', e))
    throw error
  }

  // Free to the customer, but the ingredients are still used.
  await deductInventoryForOrder(items)
  return order
}

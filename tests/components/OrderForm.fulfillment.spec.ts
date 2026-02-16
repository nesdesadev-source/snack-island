import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createApp, nextTick } from 'vue'
import OrderForm from '../../src/components/OrderForm.vue'
import { OrderService } from '../../src/services/orderService'

const hasDom = typeof document !== 'undefined'

vi.mock('../../src/services/menuItemService', () => ({
  menuItemService: {
    getMenuItems: vi.fn().mockResolvedValue([
      { id: 'm-1', name: 'Burger', price: 120, category: 'Food', has_fries: false, has_spicy: false, has_drink: false, is_active: true },
      { id: 'm-2', name: 'Fries', price: 60, category: 'Food', has_fries: false, has_spicy: false, has_drink: false, is_active: true },
    ]),
  },
}))

vi.mock('../../src/services/discountService', () => ({
  discountService: {
    getAll: vi.fn().mockResolvedValue([]),
  },
}))

vi.mock('../../src/services/orderService', () => ({
  OrderService: {
    createOrderWithInventoryCheck: vi.fn().mockResolvedValue({
      order: { id: 'ord-1', status: 'pending', total_amount: 120 },
      inventoryCheck: { isAvailable: true, insufficientItems: [] },
    }),
    createOrderItemsBatch: vi.fn().mockResolvedValue([]),
  },
}))

vi.mock('../../src/modules/orders/inventoryDeduction', () => ({
  deductInventoryForOrder: vi.fn().mockResolvedValue(undefined),
}))

describe.skipIf(!hasDom)('OrderForm.vue dine in / take out', () => {
  let el: HTMLDivElement

  beforeEach(() => {
    el = document.createElement('div')
    document.body.innerHTML = ''
    document.body.appendChild(el)
    vi.mocked(OrderService.createOrderWithInventoryCheck).mockClear()
  })

  it('submit button is disabled when fulfillment is not selected', async () => {
    const app = createApp(OrderForm)
    app.mount(el)

    await nextTick()
    await nextTick()

    const menuBtn = el.querySelector('.menu-item') as HTMLElement
    if (!menuBtn) throw new Error('No menu item found')
    menuBtn.click()
    await nextTick()

    const paymentBtns = el.querySelectorAll('.payment-btn')
    const cashBtn = Array.from(paymentBtns).find(b => (b as HTMLElement).textContent?.trim() === 'cash') as HTMLElement
    if (!cashBtn) throw new Error('Cash payment button not found')
    cashBtn.click()
    await nextTick()

    const submitBtn = el.querySelector('[data-testid="submit-order-btn"]') as HTMLButtonElement
    expect(submitBtn).toBeTruthy()
    expect(submitBtn.disabled).toBe(true)
    app.unmount()
  })

  it('submit sends order_fulfillment when Take out is selected', async () => {
    const app = createApp(OrderForm)
    app.mount(el)

    await nextTick()
    await nextTick()

    const menuBtn = el.querySelector('.menu-item') as HTMLElement
    if (!menuBtn) throw new Error('No menu item found')
    menuBtn.click()
    await nextTick()

    const takeOutBtn = el.querySelector('[data-testid="fulfillment-take-out"]') as HTMLElement
    if (!takeOutBtn) throw new Error('fulfillment-take-out button not found')
    takeOutBtn.click()
    await nextTick()

    const paymentBtns = el.querySelectorAll('.payment-btn')
    const cashBtn = Array.from(paymentBtns).find(b => (b as HTMLElement).textContent?.trim() === 'cash') as HTMLElement
    if (!cashBtn) throw new Error('Cash payment button not found')
    cashBtn.click()
    await nextTick()

    const submitBtn = el.querySelector('[data-testid="submit-order-btn"]') as HTMLButtonElement
    expect(submitBtn).toBeTruthy()
    expect(submitBtn.disabled).toBe(false)

    submitBtn.click()
    await nextTick()

    expect(OrderService.createOrderWithInventoryCheck).toHaveBeenCalled()
    const call = vi.mocked(OrderService.createOrderWithInventoryCheck).mock.calls[0]
    expect(call[0]).toMatchObject({ order_fulfillment: 'take_out' })
    app.unmount()
  })

  it('submit sends order_fulfillment when Dine in is selected', async () => {
    const app = createApp(OrderForm)
    app.mount(el)

    await nextTick()
    await nextTick()

    const menuBtn = el.querySelector('.menu-item') as HTMLElement
    if (!menuBtn) throw new Error('No menu item found')
    menuBtn.click()
    await nextTick()

    const dineInBtn = el.querySelector('[data-testid="fulfillment-dine-in"]') as HTMLElement
    if (!dineInBtn) throw new Error('fulfillment-dine-in button not found')
    dineInBtn.click()
    await nextTick()

    const paymentBtns = el.querySelectorAll('.payment-btn')
    const cashBtn = Array.from(paymentBtns).find(b => (b as HTMLElement).textContent?.trim() === 'cash') as HTMLElement
    if (!cashBtn) throw new Error('Cash payment button not found')
    cashBtn.click()
    await nextTick()

    const submitBtn = el.querySelector('[data-testid="submit-order-btn"]') as HTMLButtonElement
    expect(submitBtn).toBeTruthy()
    expect(submitBtn.disabled).toBe(false)

    submitBtn.click()
    await nextTick()

    expect(OrderService.createOrderWithInventoryCheck).toHaveBeenCalled()
    const call = vi.mocked(OrderService.createOrderWithInventoryCheck).mock.calls[0]
    expect(call[0]).toMatchObject({ order_fulfillment: 'dine_in' })
    app.unmount()
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createApp, nextTick } from 'vue'
import OrderForm from '../../src/components/OrderForm.vue'

vi.mock('../../src/services/menuItemService', () => ({
  menuItemService: {
    getMenuItems: vi.fn().mockResolvedValue([
      { id: '1', name: 'Apple Pie', price: 100, category: 'Snack' },
    ]),
  },
}))

describe('OrderForm.vue layout', () => {
  let el: HTMLDivElement

  beforeEach(() => {
    el = document.createElement('div')
    document.body.innerHTML = ''
    document.body.appendChild(el)
  })

  it('renders menu on the left and order details on the right', async () => {
    const app = createApp(OrderForm)
    app.mount(el)

    await nextTick()
    await nextTick()

    const layout = el.querySelector('.order-layout')
    expect(layout).toBeTruthy()

    const left = el.querySelector('.left-panel')
    const right = el.querySelector('.right-panel')
    expect(left).toBeTruthy()
    expect(right).toBeTruthy()

    // Left contains menu grid or loading state
    expect(left!.querySelector('.menu-grid') || left!.querySelector('.loading-container')).toBeTruthy()

    // Initially, there are no order items, so right panel shows empty state
    expect(right!.querySelector('.empty-state')).toBeTruthy()

    app.unmount()
  })
})



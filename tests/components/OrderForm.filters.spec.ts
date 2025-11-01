import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createApp, nextTick } from 'vue'
import OrderForm from '../../src/components/OrderForm.vue'

const mockMenuItems = [
  { id: 'm-1', name: 'Burger', price: 120, category: 'Food' },
  { id: 'm-2', name: 'Fries', price: 60, category: 'Food' },
  { id: 'm-3', name: 'Iced Tea', price: 45, category: 'Drink' },
]

vi.mock('../../src/services/menuItemService', () => ({
  menuItemService: {
    getMenuItems: vi.fn().mockResolvedValue(mockMenuItems),
  },
}))

describe('OrderForm.vue category filter', () => {
  let el: HTMLDivElement

  beforeEach(() => {
    el = document.createElement('div')
    document.body.innerHTML = ''
    document.body.appendChild(el)
  })

  it('filters menu items by category selection', async () => {
    const app = createApp(OrderForm)
    app.mount(el)

    await nextTick()
    await nextTick()

    // Sanity: all items initially
    expect(el.querySelectorAll('.menu-item').length).toBe(3)

    const select = el.querySelector<HTMLSelectElement>('select[data-testid="category-select"]')!
    expect(select).toBeTruthy()

    // Choose Drink -> only Iced Tea
    select.value = 'Drink'
    select.dispatchEvent(new Event('change'))
    await nextTick()
    let items = Array.from(el.querySelectorAll('.menu-item')).map(b => b.textContent?.toLowerCase() || '')
    expect(items.length).toBe(1)
    expect(items[0]).toContain('iced tea')

    // Choose Food -> Burger and Fries
    select.value = 'Food'
    select.dispatchEvent(new Event('change'))
    await nextTick()
    items = Array.from(el.querySelectorAll('.menu-item')).map(b => b.textContent?.toLowerCase() || '')
    expect(items.length).toBe(2)
    expect(items.some(t => t.includes('burger'))).toBe(true)
    expect(items.some(t => t.includes('fries'))).toBe(true)

    // All
    select.value = ''
    select.dispatchEvent(new Event('change'))
    await nextTick()
    expect(el.querySelectorAll('.menu-item').length).toBe(3)

    app.unmount()
  })
})



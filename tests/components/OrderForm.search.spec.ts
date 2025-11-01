import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createApp, nextTick } from 'vue'
import OrderForm from '../../src/components/OrderForm.vue'

const mockMenuItems = [
  { id: 'm-1', name: 'Burger', price: 120, category: 'Food' },
  { id: 'm-2', name: 'Fries', price: 60, category: 'Food' },
  { id: 'm-3', name: 'Iced Tea', price: 45, category: 'Drinks' },
]

vi.mock('../../src/services/menuItemService', () => ({
  menuItemService: {
    getMenuItems: vi.fn().mockResolvedValue(mockMenuItems),
  },
}))

describe('OrderForm.vue search filter', () => {
  let el: HTMLDivElement

  beforeEach(() => {
    vi.clearAllMocks()
    el = document.createElement('div')
    document.body.innerHTML = ''
    document.body.appendChild(el)
  })

  it('filters menu items by name using the search input', async () => {
    const app = createApp(OrderForm)
    app.mount(el)

    // Wait for menu items to load
    await nextTick()
    await nextTick()

    // Sanity: all items rendered initially
    expect(el.querySelectorAll('.menu-item').length).toBe(3)

    const searchInput = el.querySelector<HTMLInputElement>('input.search-input')!
    searchInput.value = 'fr'
    searchInput.dispatchEvent(new Event('input'))
    await nextTick()

    // Only Fries should match 'fr'
    const buttons = Array.from(el.querySelectorAll('.menu-item'))
    expect(buttons.length).toBe(1)
    expect(buttons[0].textContent?.toLowerCase()).toContain('fries')

    // Clear search, all items return
    searchInput.value = ''
    searchInput.dispatchEvent(new Event('input'))
    await nextTick()
    expect(el.querySelectorAll('.menu-item').length).toBe(3)

    // Case-insensitive match
    searchInput.value = 'ICED'
    searchInput.dispatchEvent(new Event('input'))
    await nextTick()
    const iced = Array.from(el.querySelectorAll('.menu-item'))
    expect(iced.length).toBe(1)
    expect(iced[0].textContent?.toLowerCase()).toContain('iced tea')

    app.unmount()
  })
})



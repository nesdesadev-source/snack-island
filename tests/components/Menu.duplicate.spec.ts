import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createApp } from 'vue'
import Menu from '../../src/components/Menu.vue'

// Mocks
const mockMenuItems = [
  { id: 'item-1', name: 'Original', price: 100, category: 'Snack' }
]

const mockRecipeMaps = [
  {
    id: 'rm-1',
    menu_item_id: 'item-1',
    ingredient_id: 'ing-1',
    usage_per_order: 1,
    usage_type: 'per_order',
    purchase_price: 50,
    purchase_quantity: 1,
    purchase_unit: 'pc'
  },
  {
    id: 'rm-2',
    menu_item_id: 'item-1',
    ingredient_id: 'ing-2',
    usage_per_order: 0.5,
    usage_type: 'per_order',
    purchase_price: 20,
    purchase_quantity: 1,
    purchase_unit: 'pc'
  }
]

vi.mock('../../src/services/menuItemService', () => ({
  menuItemService: {
    getMenuItems: vi.fn().mockResolvedValue(mockMenuItems),
    createMenuItem: vi.fn().mockResolvedValue('new-item-id'),
    deleteMenuItem: vi.fn()
  }
}))

vi.mock('../../src/services/recipeMapService', () => ({
  recipeMapService: {
    getRecipeMaps: vi.fn().mockResolvedValue(mockRecipeMaps),
    createRecipeMap: vi.fn().mockResolvedValue(undefined),
    deleteRecipeMap: vi.fn()
  }
}))

async function flush() {
  await Promise.resolve()
  await Promise.resolve()
}

describe('Menu.vue — Duplicate menu item', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('adds a Duplicate button and clones item + recipe maps with name (2)', async () => {
    const el = document.createElement('div')
    const app = createApp(Menu)
    app.mount(el)

    await flush()

    // Find the Duplicate button
    const buttons = Array.from(el.querySelectorAll('button'))
    const duplicateBtn = buttons.find(b => (b.textContent || '').includes('Duplicate'))
    expect(duplicateBtn, 'Duplicate button should exist').toBeTruthy()

    duplicateBtn && duplicateBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    await flush()

    const { menuItemService } = await import('../../src/services/menuItemService')
    const { recipeMapService } = await import('../../src/services/recipeMapService')

    expect(menuItemService.createMenuItem).toHaveBeenCalledWith({
      name: 'Original (2)',
      price: 100,
      category: 'Snack'
    })

    // Should create a recipe map per existing map for the new item id
    expect(vi.mocked(recipeMapService.createRecipeMap).mock.calls.length).toBe(mockRecipeMaps.length)

    const calls = vi.mocked(recipeMapService.createRecipeMap).mock.calls
    for (let i = 0; i < mockRecipeMaps.length; i++) {
      const arg = calls[i][0]
      expect(arg.menu_item_id).toBe('new-item-id')
      expect(arg.ingredient_id).toBe(mockRecipeMaps[i].ingredient_id)
      expect(arg.usage_per_order).toBe(mockRecipeMaps[i].usage_per_order)
      expect(arg.usage_type).toBe(mockRecipeMaps[i].usage_type)
      expect(arg.purchase_price).toBe(mockRecipeMaps[i].purchase_price)
      expect(arg.purchase_quantity).toBe(mockRecipeMaps[i].purchase_quantity)
      expect(arg.purchase_unit).toBe(mockRecipeMaps[i].purchase_unit)
    }

    app.unmount()
  })
})



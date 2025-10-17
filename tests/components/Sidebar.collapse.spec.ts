import { describe, it, expect } from 'vitest'
import { createApp } from 'vue'
import Sidebar from '../../src/components/Sidebar.vue'

describe('Sidebar collapse toggle', () => {
  it('toggles collapsed class when clicking the menu button', async () => {
    const container = document.createElement('div')
    const app = createApp(Sidebar)
    app.mount(container)

    const sidebar = container.querySelector('.sidebar') as HTMLElement
    const btn = container.querySelector('.menu-toggle') as HTMLButtonElement

    expect(sidebar.classList.contains('collapsed')).toBe(false)

    btn.click()
    await Promise.resolve()
    expect(sidebar.classList.contains('collapsed')).toBe(true)

    btn.click()
    await Promise.resolve()
    expect(sidebar.classList.contains('collapsed')).toBe(false)

    app.unmount()
  })
})



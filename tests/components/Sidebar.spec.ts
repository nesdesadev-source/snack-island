import { describe, it, expect } from 'vitest'
import { createApp } from 'vue'
import Sidebar from '../../src/components/Sidebar.vue'

describe('Sidebar.vue', () => {
  it('mounts without crashing', () => {
    const el = document.createElement('div')
    const app = createApp(Sidebar)
    app.mount(el)
    expect(el.innerHTML.length).toBeGreaterThan(0)
    app.unmount()
  })
})



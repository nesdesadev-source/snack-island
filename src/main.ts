import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import logoUrl from './assets/logo.png'

createApp(App).use(router).mount('#app')

// Set favicon to our logo to keep brand consistent
const ensureFavicon = () => {
  const existing = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
  if (existing) {
    existing.type = 'image/png'
    existing.href = logoUrl
    return
  }
  const link = document.createElement('link')
  link.rel = 'icon'
  link.type = 'image/png'
  link.href = logoUrl
  document.head.appendChild(link)
}

ensureFavicon()

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Sidebar from './components/Sidebar.vue'
import Dashboard from './components/Dashboard.vue'
import Inventory from './components/Inventory.vue'
import Sales from './components/Sales.vue'
import Users from './components/Users.vue'

const activeTab = ref('dashboard')
const showMobileSidebar = ref(false)
const isMobile = ref(false)

const handleTabChange = (tab: string) => {
  activeTab.value = tab
  // Close mobile sidebar when tab changes
  if (isMobile.value) {
    showMobileSidebar.value = false
  }
}

const toggleMobileSidebar = () => {
  showMobileSidebar.value = !showMobileSidebar.value
}

const checkMobile = () => {
  const width = window.innerWidth
  isMobile.value = width <= 480
  console.log('Screen width:', width, 'isMobile:', isMobile.value)
  if (!isMobile.value) {
    showMobileSidebar.value = false
  }
}

const getCurrentComponent = () => {
  switch (activeTab.value) {
    case 'dashboard':
      return Dashboard
    case 'inventory':
      return Inventory
    case 'sales':
      return Sales
    case 'users':
      return Users
    default:
      return Dashboard
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  // Force initial check
  setTimeout(checkMobile, 100)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<template>
  <div class="app-layout">
    <!-- Mobile Header -->
    <div class="mobile-header" v-if="isMobile">
      <button class="mobile-menu-btn" @click="toggleMobileSidebar">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
      <div class="mobile-brand">
        <div class="brand-icon">C</div>
        <span class="brand-name">Snack Island</span>
      </div>
    </div>
    
    <Sidebar 
      @tab-change="handleTabChange" 
      :class="{ 'mobile-open': showMobileSidebar }"
      @close-mobile="showMobileSidebar = false"
    />
    
    <!-- Mobile Overlay -->
    <div 
      class="mobile-overlay" 
      v-if="isMobile && showMobileSidebar"
      @click="showMobileSidebar = false"
    ></div>
    
    <main class="main-content">
      <component :is="getCurrentComponent()" />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
}

.main-content {
  background-color: #f8f9fa;
  min-height: 100vh;
  box-sizing: border-box;
}

/* Mobile Header */
.mobile-header {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: #1A1A2E;
  z-index: 1002;
  padding: 0 16px;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.mobile-menu-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.mobile-menu-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.mobile-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mobile-brand .brand-icon {
  width: 32px;
  height: 32px;
  background-color: #fff;
  color: #1A1A2E;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
}

.mobile-brand .brand-name {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

/* Desktop layout - ensure it's applied */
@media (min-width: 481px) {
  .app-layout {
    flex-direction: row !important;
  }
  
  .main-content {
    margin-left: 280px !important;
    width: calc(100% - 280px) !important;
    padding: 40px !important;
    margin-top: 0 !important;
    min-height: 100vh !important;
  }
  
  .mobile-header {
    display: none !important;
  }
  
  /* Override any mobile styles in child components */
  .main-content > * {
    padding: 0 !important;
  }
  
  /* Force desktop styles for all components */
  .main-content .dashboard,
  .main-content .inventory,
  .main-content .sales,
  .main-content .users {
    padding: 0 !important;
  }
  
  /* Override component-specific mobile styles */
  .main-content .dashboard-header h1 {
    font-size: 2rem !important;
  }
  
  .main-content .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)) !important;
    gap: 1.5rem !important;
  }
  
  .main-content .inventory-header,
  .main-content .sales-header,
  .main-content .users-header {
    flex-direction: row !important;
    justify-content: space-between !important;
    align-items: center !important;
  }
  
  .main-content .inventory-filters,
  .main-content .users-filters {
    flex-direction: row !important;
    gap: 1rem !important;
  }
  
  .main-content .users-grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)) !important;
  }
  
  .main-content .sales-content {
    grid-template-columns: 2fr 1fr !important;
  }
}

/* Tablet responsive design */
@media (max-width: 1024px) and (min-width: 481px) {
  .main-content {
    padding: 30px 24px;
  }
}

/* Mobile responsive design */
@media (max-width: 480px) {
  .mobile-header {
    display: flex;
  }
  
  .app-layout {
    flex-direction: column;
  }
  
  .main-content {
    margin-left: 0;
    padding: 20px 16px;
    width: 100%;
    min-height: calc(100vh - 60px);
    margin-top: 60px;
  }
}
</style>

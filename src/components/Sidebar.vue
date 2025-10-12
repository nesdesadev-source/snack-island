<template>
  <div class="sidebar">
    <!-- Header Section -->
    <div class="sidebar-header">
      <div class="brand">
        <div class="brand-icon">S</div>
        <span class="brand-name">Snack Bar Island</span>
      </div>
      <button class="menu-toggle" @click="toggleSidebar">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
    </div>

    <!-- Search Section -->
    <div class="search-section">
      <div class="search-container">
        <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input type="text" placeholder="Search..." class="search-input" />
      </div>
    </div>

    <!-- Navigation Section -->
    <nav class="navigation">
      <ul class="nav-list">
        <!-- <li class="nav-item" :class="{ active: activeItem === 'dashboard' }" @click="setActiveItem('dashboard')">
          <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <span class="nav-text">Dashboard</span>
        </li> -->
        
        <li class="nav-item" :class="{ active: activeItem === 'inventory' }" @click="setActiveItem('inventory')">
          <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
          </svg>
          <span class="nav-text">Inventory</span>
        </li>
        
        <!-- <li class="nav-item" :class="{ active: activeItem === 'sales' }" @click="setActiveItem('sales')">
          <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
          <span class="nav-text">Sales</span>
        </li> -->
        
        <li class="nav-item" :class="{ active: activeItem === 'expenses' }" @click="setActiveItem('expenses')">
          <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
          <span class="nav-text">Expenses</span>
        </li>
        
        <!-- <li class="nav-item" :class="{ active: activeItem === 'users' }" @click="setActiveItem('users')">
          <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span class="nav-text">Users</span>
        </li> -->
      </ul>
    </nav>

    <!-- User Profile Section -->
    <div class="user-profile">
      <div class="profile-picture">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </div>
      <div class="profile-info">
        <div class="profile-name">Fayzullo Saidakbarov</div>
        <div class="profile-role">Frontend vue developer</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  tabChange: [tab: string]
}>()

const activeItem = ref('dashboard')
const isCollapsed = ref(false)

const setActiveItem = (item: string) => {
  activeItem.value = item
  emit('tabChange', item)
}

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<style scoped>
.sidebar {
  width: 280px;
  height: 100vh;
  background-color: #1A1A2E;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-icon {
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

.brand-name {
  color: #fff;
  font-size: 20px;
  font-weight: 600;
}

.menu-toggle {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.menu-toggle:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.search-section {
  padding: 20px;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: rgba(255, 255, 255, 0.6);
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  background-color: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  outline: none;
  transition: background-color 0.2s;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.search-input:focus {
  background-color: rgba(255, 255, 255, 0.15);
}

.navigation {
  flex: 1;
  padding: 0 20px;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin-bottom: 4px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: rgba(255, 255, 255, 0.8);
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.nav-item.active {
  background-color: rgba(255, 255, 255, 0.15);
  color: #fff;
}

.nav-icon {
  flex-shrink: 0;
}

.nav-text {
  font-size: 14px;
  font-weight: 500;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.profile-picture {
  width: 40px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.8);
  flex-shrink: 0;
}

.profile-info {
  flex: 1;
  min-width: 0;
}

.profile-name {
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile-role {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Responsive design */
@media (max-width: 480px) {
  .sidebar {
    width: 100%;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 1001;
    top: 60px;
    height: calc(100vh - 60px);
  }
  
  .sidebar.mobile-open {
    transform: translateX(0);
  }
  
  .sidebar-header {
    padding: 16px;
  }
  
  .brand-name {
    font-size: 18px;
  }
  
  .search-section {
    padding: 16px;
  }
  
  .search-input {
    font-size: 16px; /* Prevents zoom on iOS */
  }
  
  .navigation {
    padding: 0 16px;
  }
  
  .nav-text {
    font-size: 16px;
  }
  
  .user-profile {
    padding: 16px;
  }
  
  .profile-name {
    font-size: 16px;
  }
  
  .profile-role {
    font-size: 14px;
  }
}
</style>

<template>
  <div class="menu-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-text">
        <h1>Menu Management</h1>
        <p>Manage your menu items, recipes, and pricing</p>
      </div>
      <button class="btn-primary" @click="openAddModal">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Add Menu Item
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon total">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Total Items</span>
          <span class="stat-value">{{ menuItems.length }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon success">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Avg Price</span>
          <span class="stat-value">₱{{ averagePrice.toFixed(2) }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon warning">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Categories</span>
          <span class="stat-value">{{ categoryCount }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon danger">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 3h18v18H3zM12 8v4M12 16h.01"></path>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Avg Cost</span>
          <span class="stat-value">₱{{ averageCost.toFixed(2) }}</span>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-section">
      <div class="search-container">
        <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input 
          type="text" 
          class="search-input" 
          placeholder="Search menu items..." 
          v-model="searchQuery" 
        />
      </div>
      
      <div class="filter-group">
        <label class="filter-label">Category</label>
        <select v-model="selectedCategory" class="filter-select">
          <option value="">All Categories</option>
          <option value="Snack">Snack</option>
          <option value="Drink">Drink</option>
          <option value="Combo">Combo</option>
          <option value="Side">Side</option>
        </select>
      </div>
    </div>

    <!-- Menu Items Grid -->
    <div class="content-container">
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading menu items...</p>
      </div>

      <div v-else-if="errorMessage" class="error-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p>{{ errorMessage }}</p>
      </div>

      <div v-else-if="filteredItems.length === 0" class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
        <h3>No menu items found</h3>
        <p>Try adjusting your search or add a new menu item</p>
      </div>

      <div v-else class="menu-grid">
        <div v-for="item in filteredItems" :key="item.id" class="menu-card" @click="openModal(item)">
          <div class="card-header">
            <div class="card-avatar">
              {{ getInitials(item.name) }}
            </div>
            <span class="category-badge" :class="getCategoryClass(item.category)">
              {{ item.category }}
            </span>
          </div>
          <div class="card-body">
            <h3 class="card-title">{{ item.name }}</h3>
            <div class="card-pricing">
              <div class="price-row">
                <span class="label">Selling Price</span>
                <span class="value price">₱{{ item.price.toFixed(2) }}</span>
              </div>
              <div class="price-row">
                <span class="label">Cost/Order</span>
                <span class="value cost">₱{{ costPerItem[item.id]?.toFixed(2) ?? '0.00' }}</span>
              </div>
              <div class="price-row profit-row">
                <span class="label">Profit</span>
                <span class="value profit">₱{{ calculateProfit(item.id, item.price).toFixed(2) }}</span>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <div class="actions-row">
              <button class="card-btn edit-btn" @click.stop="openModal(item)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Edit
              </button>
              <button class="card-btn duplicate-btn" @click.stop="duplicateMenuItem(item)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                Duplicate
              </button>
            </div>
            <button class="card-btn delete-btn full-width" @click.stop="deleteMenuItem(item)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3,6 5,6 21,6"></polyline>
                <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <MenuItemModal
      v-if="showModal && activeItem"
      :menu-item="activeItem"
      :recipe-maps="recipeMapsByItem[activeItem.id] ?? []"
      @close="closeModal"
      @saved="handleSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import type { MenuItem } from '../models/MenuItem'
import type { RecipeMap } from '../models/RecipeMap'
import { menuItemService } from '../services/menuItemService'
import { recipeMapService } from '../services/recipeMapService'
import { computeCostPerOrderForMenuItem } from '../modules/menu/menuPageUtils'
import MenuItemModal from './MenuItemModal.vue'

const menuItems = ref<MenuItem[]>([])
const allRecipeMaps = ref<RecipeMap[]>([])
const showModal = ref(false)
const activeItem = ref<MenuItem | null>(null)
const errorMessage = ref('')
const searchQuery = ref('')
const selectedCategory = ref('')
const isLoading = ref(true)

const recipeMapsByItem = computed<Record<string, RecipeMap[]>>(() => {
  return allRecipeMaps.value.reduce((acc, map) => {
    ;(acc[map.menu_item_id] ||= []).push(map)
    return acc
  }, {} as Record<string, RecipeMap[]>)
})

const costPerItem = computed<Record<string, number>>(() => {
  const result: Record<string, number> = {}
  for (const item of menuItems.value) {
    result[item.id] = computeCostPerOrderForMenuItem(allRecipeMaps.value, item.id)
  }
  return result
})

const filteredItems = computed(() => {
  let filtered = menuItems.value
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    )
  }
  
  if (selectedCategory.value) {
    filtered = filtered.filter(item => item.category === selectedCategory.value)
  }
  
  return filtered
})

const averagePrice = computed(() => {
  if (menuItems.value.length === 0) return 0
  const total = menuItems.value.reduce((sum, item) => sum + item.price, 0)
  return total / menuItems.value.length
})

const averageCost = computed(() => {
  if (menuItems.value.length === 0) return 0
  const total = menuItems.value.reduce((sum, item) => sum + (costPerItem.value[item.id] || 0), 0)
  return total / menuItems.value.length
})

const categoryCount = computed(() => {
  const categories = new Set(menuItems.value.map(item => item.category))
  return categories.size
})

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

function getCategoryClass(category: string): string {
  const classes: Record<string, string> = {
    'Snack': 'category-snack',
    'Drink': 'category-drink',
    'Combo': 'category-combo',
    'Side': 'category-side'
  }
  return classes[category] || 'category-default'
}

function calculateProfit(itemId: string, price: number): number {
  const cost = costPerItem.value[itemId] || 0
  return Math.max(0, price - cost)
}

function openAddModal() {
  // Create a new empty menu item for the modal
  activeItem.value = {
    id: '', // Empty ID indicates this is a new item
    name: '',
    price: 0,
    category: 'Snack'
  }
  showModal.value = true
}

async function loadData() {
  errorMessage.value = ''
  isLoading.value = true
  try {
    const [items, maps] = await Promise.all([
      menuItemService.getMenuItems(),
      recipeMapService.getRecipeMaps()
    ])
    menuItems.value = items
    allRecipeMaps.value = maps
  } catch (err: any) {
    errorMessage.value = err?.message ?? 'Failed to load menu data'
  } finally {
    isLoading.value = false
  }
}

function openModal(item: MenuItem) {
  activeItem.value = item
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  activeItem.value = null
}

async function handleSaved() {
  // After saving, refresh to reflect updates
  await loadData()
  closeModal()
}

async function deleteMenuItem(item: MenuItem) {
  if (!confirm(`Are you sure you want to delete "${item.name}"? This will also delete all associated recipe ingredients.`)) {
    return
  }

  try {
    // First, delete all recipe maps associated with this menu item
    const recipeMapsToDelete = recipeMapsByItem.value[item.id] || []
    for (const recipeMap of recipeMapsToDelete) {
      await recipeMapService.deleteRecipeMap(recipeMap.id)
    }

    // Then delete the menu item itself
    await menuItemService.deleteMenuItem(item.id)

    // Refresh the data
    await loadData()
  } catch (err: any) {
    errorMessage.value = err?.message ?? 'Failed to delete menu item'
    console.error('Error deleting menu item:', err)
  }
}

onMounted(loadData)

async function duplicateMenuItem(item: MenuItem) {
  try {
    const newItemId = await menuItemService.createMenuItem({
      name: `${item.name} (2)`,
      price: item.price,
      category: item.category
    })
    const maps = recipeMapsByItem.value[item.id] ?? []
    for (const rm of maps) {
      await recipeMapService.createRecipeMap({
        menu_item_id: newItemId,
        ingredient_id: rm.ingredient_id,
        usage_per_order: rm.usage_per_order,
        usage_type: rm.usage_type,
        purchase_price: rm.purchase_price,
        purchase_quantity: rm.purchase_quantity,
        purchase_unit: rm.purchase_unit
      })
    }
    await loadData()
  } catch (err: any) {
    errorMessage.value = err?.message ?? 'Failed to duplicate menu item'
    console.error('Error duplicating menu item:', err)
  }
}
</script>

<style scoped>
.menu-page {
  padding: 0;
  min-height: 100vh;
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
}

.header-text h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.25rem 0;
}

.header-text p {
  font-size: 0.95rem;
  color: #6b7280;
  margin: 0;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.875rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  white-space: nowrap;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-icon.success {
  background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
  color: white;
}

.stat-icon.warning {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
}

.stat-icon.danger {
  background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
  color: white;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
}

/* Filters Section */
.filters-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: flex-end;
}

.search-container {
  position: relative;
  flex: 1;
  max-width: 500px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  pointer-events: none;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.2s;
  background: white;
  box-sizing: border-box;
}

.search-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 200px;
}

.filter-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-select {
  padding: 0.875rem 2.5rem 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  font-size: 0.95rem;
  outline: none;
  cursor: pointer;
  transition: all 0.2s;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  box-sizing: border-box;
}

.filter-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Content Container */
.content-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  padding: 1.5rem;
}

/* Loading, Error, Empty States */
.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.loading-state {
  color: #6b7280;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  font-size: 1rem;
  margin: 0;
}

.error-state svg {
  color: #ef4444;
  margin-bottom: 1rem;
}

.error-state p {
  color: #6b7280;
  font-size: 1rem;
  margin: 0.5rem 0 0 0;
}

.empty-state svg {
  color: #d1d5db;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  color: #6b7280;
  margin: 0;
}

/* Menu Grid */
.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}

.menu-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;
  cursor: pointer;
}

.menu-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  border-color: #667eea;
}

.menu-card .card-header {
  padding: 1rem;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e5e7eb;
}

.card-avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.category-badge {
  display: inline-flex;
  padding: 0.375rem 0.875rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.category-snack { background: #e0e7ff; color: #4f46e5; }
.category-drink { background: #dbeafe; color: #1e40af; }
.category-combo { background: #fef3c7; color: #92400e; }
.category-side { background: #d1fae5; color: #065f46; }
.category-default { background: #f3f4f6; color: #374151; }

.menu-card .card-body {
  padding: 1.25rem;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 1rem 0;
}

.card-pricing {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.price-row:last-child {
  border-bottom: none;
}

.price-row.profit-row {
  background: #f0fdf4;
  margin: 0 -1.25rem;
  padding: 0.75rem 1.25rem;
  border-bottom: none;
}

.price-row .label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.price-row .value {
  font-size: 1rem;
  font-weight: 700;
}

.price-row .value.price {
  color: #111827;
}

.price-row .value.cost {
  color: #ef4444;
}

.price-row .value.profit {
  color: #10b981;
}

.menu-card .card-footer {
  padding: 1rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.card-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.actions-row {
  display: flex;
  gap: 0.5rem;
}

.full-width {
  width: 100%;
}

.card-btn.edit-btn {
  color: #667eea;
}

.card-btn.edit-btn:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.card-btn.delete-btn {
  color: #ef4444;
}

.card-btn.delete-btn:hover {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

/* Duplicate button (neutral/ghost style with subtle hover) */
.card-btn.duplicate-btn {
  color: #374151;
}

.card-btn.duplicate-btn:hover {
  background: #f3f4f6;
  border-color: #e5e7eb;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .menu-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-text h1 {
    font-size: 1.5rem;
  }

  .btn-primary {
    width: 100%;
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }

  .search-container {
    max-width: none;
  }

  .filter-select {
    width: 100%;
  }

  .menu-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .page-header {
    margin-bottom: 1.5rem;
  }

  .header-text h1 {
    font-size: 1.25rem;
  }

  .stat-card {
    padding: 1.25rem;
  }

  .stat-icon {
    width: 48px;
    height: 48px;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .content-container {
    padding: 1rem;
  }
}
</style>




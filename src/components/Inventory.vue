<template>
  <div class="inventory-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-text">
        <h1>Inventory Management</h1>
        <p>Track and manage your stock levels in real-time</p>
      </div>
      <button class="btn-primary" @click="openAddModal">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Add New Item
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card" @click="setStatusFilter('all')" :class="{ active: statusFilter === 'all' }">
        <div class="stat-icon total">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Total Items</span>
          <span class="stat-value">{{ inventoryItems.length }}</span>
        </div>
      </div>

      <div class="stat-card" @click="setStatusFilter('in-stock')" :class="{ active: statusFilter === 'in-stock' }">
        <div class="stat-icon success">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">In Stock</span>
          <span class="stat-value">{{ inStockCount }}</span>
        </div>
      </div>

      <div class="stat-card" @click="setStatusFilter('low-stock')" :class="{ active: statusFilter === 'low-stock' }">
        <div class="stat-icon warning">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Low Stock</span>
          <span class="stat-value">{{ lowStockCount }}</span>
        </div>
      </div>

      <div class="stat-card" @click="setStatusFilter('out-of-stock')" :class="{ active: statusFilter === 'out-of-stock' }">
        <div class="stat-icon danger">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Out of Stock</span>
          <span class="stat-value">{{ outOfStockCount }}</span>
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
          placeholder="Search by item name or ID..." 
          v-model="searchQuery" 
        />
      </div>
      
      <div class="filter-group">
        <label class="filter-label">Unit Type</label>
        <select v-model="selectedCategory" class="filter-select">
          <option value="">All Units</option>
          <option value="pcs">Pieces</option>
          <option value="kg">Kilograms</option>
          <option value="g">Grams</option>
          <option value="L">Liters</option>
          <option value="mL">Milliliters</option>
        </select>
      </div>
    </div>
    
    <!-- Inventory Table -->
    <div class="table-container">
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading inventory data...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p>{{ error }}</p>
      </div>

      <div v-else-if="filteredItems.length === 0" class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        </svg>
        <h3>No items found</h3>
        <p>Try adjusting your search or filters</p>
      </div>

      <table v-else class="inventory-table">
        <thead>
          <tr>
            <th>Item Details</th>
            <th>Unit</th>
            <th>Stock Level</th>
            <th>Supplier</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in filteredItems"
            :key="item.id"
            class="table-row"
            :class="{ 'row-highlight': item.id === lastAddedStockId }"
          >
            <td>
              <div class="item-cell">
                <div class="item-avatar">
                  {{ getInitials(item.name) }}
                </div>
                <div class="item-details">
                  <div class="item-name">{{ item.name }}</div>
                  <div class="item-id">ID: {{ item.id.substring(0, 8) }}...</div>
                </div>
              </div>
            </td>
            
            <td>
              <span class="unit-badge">{{ item.unit }}</span>
            </td>
            
            <td>
              <div class="stock-cell">
                <span class="stock-text">{{ formatNumber(item.quantity) }} {{ item.unit }}</span>
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    :class="getProgressClass(item.quantity, item.reorder_level)"
                    :style="{ width: getStockPercentage(item.quantity, item.reorder_level) + '%' }"
                  ></div>
                </div>
              </div>
            </td>
            
            <td>
              <span class="supplier-text">{{ item.supplier_id || 'N/A' }}</span>
            </td>
            
            <td>
              <span class="status-badge" :class="getStatusClass(item.quantity, item.reorder_level)">
                <span class="status-dot"></span>
                {{ getStatusText(item.quantity, item.reorder_level) }}
              </span>
            </td>
            
            <td>
              <div class="action-cell">
                <button
                  class="action-btn dropdown-trigger"
                  type="button"
                  :aria-expanded="openDropdownId === item.id"
                  aria-haspopup="true"
                  aria-label="Row actions"
                  title="Actions"
                  @click="toggleDropdown(item.id)"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="6" r="1.5"></circle>
                    <circle cx="12" cy="12" r="1.5"></circle>
                    <circle cx="12" cy="18" r="1.5"></circle>
                  </svg>
                </button>
                <Transition name="dropdown">
                  <div
                    v-show="openDropdownId === item.id"
                    class="dropdown-panel"
                    role="menu"
                    @click.stop
                  >
                    <button type="button" role="menuitem" class="dropdown-item" @click="onDropdownAction(() => openEditModal(item))">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                      Edit
                    </button>
                    <button type="button" role="menuitem" class="dropdown-item add-stock" @click="onDropdownAction(() => openAddStockModal(item))">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 5v14M5 12h14"></path>
                      </svg>
                      Add stock
                    </button>
                    <button type="button" role="menuitem" class="dropdown-item delete" @click="onDropdownAction(() => deleteItem(item))">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3,6 5,6 21,6"></polyline>
                        <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                      </svg>
                      Delete
                    </button>
                  </div>
                </Transition>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Component -->
    <InventoryModal
      :is-open="showModal"
      :is-edit-mode="isEditMode"
      :form-data="formData"
      @close="closeModal"
      @submit="saveItem"
    />

    <!-- Add Stock Modal -->
    <AddStockModal
      :is-open="showAddStockModal"
      :item="addStockItem"
      :api-error="addStockError"
      @close="closeAddStockModal"
      @submit="submitAddStock"
      @clear-error="addStockError = null"
    />

    <!-- Success Toast -->
    <Transition name="toast">
      <div v-if="showToast" class="toast-notification" role="status">
        <div class="toast-body">
          <div class="toast-icon-wrapper">
            <svg class="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <div class="toast-text">
            <div class="toast-title">Stock updated</div>
            <div class="toast-description">{{ toastMessage }}</div>
          </div>
          <button @click="showToast = false" class="toast-close" aria-label="Close notification">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { inventoryService } from '../services/inventoryService'
import type { Inventory, InventoryUnit } from '../models/Inventory'
import InventoryModal from './InventoryModal.vue'
import AddStockModal from './AddStockModal.vue'

const searchQuery = ref('')
const selectedCategory = ref('')
const statusFilter = ref('all')
const inventoryItems = ref<Inventory[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

// Modal state
const showModal = ref(false)
const isEditMode = ref(false)
const currentItemId = ref<string | null>(null)

// Dropdown state (only one open at a time)
const openDropdownId = ref<string | null>(null)

// Add Stock modal state
const showAddStockModal = ref(false)
const addStockItem = ref<Inventory | null>(null)
const addStockError = ref<string | null>(null)

// Toast state
const showToast = ref(false)
const toastMessage = ref('')

// Row highlight after add stock (cleared after 2.5s)
const lastAddedStockId = ref<string | null>(null)
let highlightTimeout: ReturnType<typeof setTimeout> | null = null

// Form data
const formData = ref({
  name: '',
  unit: 'pcs' as InventoryUnit,
  quantity: 0,
  reorder_level: 0,
  supplier_id: ''
})

// Load inventory from Supabase
const loadInventory = async () => {
  try {
    isLoading.value = true
    error.value = null
    const data = await inventoryService.getAll()
    inventoryItems.value = data.filter((item: Inventory) => item.is_active) || []
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load inventory'
    console.error('Error loading inventory:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await loadInventory()
})

// Computed stats
const inStockCount = computed(() => {
  return inventoryItems.value.filter(item => item.quantity > item.reorder_level).length
})

const lowStockCount = computed(() => {
  return inventoryItems.value.filter(item => 
    item.quantity > 0 && item.quantity <= item.reorder_level
  ).length
})

const outOfStockCount = computed(() => {
  return inventoryItems.value.filter(item => item.quantity === 0).length
})

// Filtered items
const filteredItems = computed(() => {
  let filtered = inventoryItems.value
  
  // Apply status filter
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(item => {
      switch (statusFilter.value) {
        case 'in-stock':
          return item.quantity > item.reorder_level
        case 'low-stock':
          return item.quantity > 0 && item.quantity <= item.reorder_level
        case 'out-of-stock':
          return item.quantity === 0
        default:
          return true
      }
    })
  }
  
  if (searchQuery.value) {
    filtered = filtered.filter(item => 
      item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  
  if (selectedCategory.value) {
    filtered = filtered.filter(item => item.unit === selectedCategory.value)
  }
  
  return filtered
})

// Status filter function
const setStatusFilter = (status: string) => {
  statusFilter.value = status
}

// Helper functions
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

const formatNumber = (num: number): string => {
  return num % 1 === 0 ? num.toString() : num.toFixed(2)
}

const getStockPercentage = (stock: number, reorderLevel: number): number => {
  const estimatedMax = reorderLevel * 3
  return Math.min(Math.round((stock / estimatedMax) * 100), 100)
}

const getProgressClass = (stock: number, reorderLevel: number): string => {
  if (stock < 0) return 'danger'
  if (stock === 0) return 'danger'
  if (stock <= reorderLevel) return 'warning'
  return 'success'
}

const getStatusClass = (stock: number, reorderLevel: number): string => {
  if (stock < 0) return 'status-negative'
  if (stock === 0) return 'status-out'
  if (stock <= reorderLevel) return 'status-low'
  return 'status-good'
}

const getStatusText = (stock: number, reorderLevel: number): string => {
  if (stock < 0) return 'Negative stock'
  if (stock === 0) return 'Out of Stock'
  if (stock <= reorderLevel) return 'Low Stock'
  return 'In Stock'
}

// Modal handlers
const resetForm = () => {
  formData.value = {
    name: '',
    unit: 'pcs',
    quantity: 0,
    reorder_level: 0,
    supplier_id: ''
  }
  currentItemId.value = null
  isEditMode.value = false
}

const openAddModal = () => {
  resetForm()
  showModal.value = true
  isEditMode.value = false
}

const openEditModal = (item: Inventory) => {
  formData.value = {
    name: item.name,
    unit: item.unit,
    quantity: item.quantity,
    reorder_level: item.reorder_level,
    supplier_id: item.supplier_id || ''
  }
  currentItemId.value = item.id
  isEditMode.value = true
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  resetForm()
}

const saveItem = async (data: typeof formData.value) => {
  try {
    if (!data.name && !data.unit && !data.quantity && !data.reorder_level) {
      alert('Please fill in all required fields')
      return
    }

    if (isEditMode.value && currentItemId.value) {
      await inventoryService.updateItem({
        id: currentItemId.value,
        name: data.name,
        unit: data.unit,
        quantity: data.quantity,
        reorder_level: data.reorder_level,
        supplier_id: data.supplier_id || null,
      })
    } else {
      await inventoryService.addItem({
        name: data.name,
        unit: data.unit,
        quantity: data.quantity,
        reorder_level: data.reorder_level,
        supplier_id: data.supplier_id || null,
      })
    }

    await loadInventory()
    closeModal()
  } catch (err) {
    console.error('Error saving item:', err)
    alert(err instanceof Error ? err.message : 'Failed to save item')
  }
}

const deleteItem = async (item: Inventory) => {
  if (!confirm(`Are you sure you want to delete "${item.name}"?`)) {
    return
  }

  try {
    await inventoryService.deleteItem(item.id)
    await loadInventory()
  } catch (err) {
    console.error('Error deleting item:', err)
    alert(err instanceof Error ? err.message : 'Failed to delete item')
  }
}

// Dropdown: toggle and close on outside click
function toggleDropdown(itemId: string) {
  const next = openDropdownId.value === itemId ? null : itemId
  openDropdownId.value = next
  if (next) {
    nextTick(() => {
      setTimeout(() => {
        const close = () => {
          openDropdownId.value = null
          document.removeEventListener('click', close)
        }
        document.addEventListener('click', close)
      }, 0)
    })
  }
}

function onDropdownAction(fn: () => void) {
  openDropdownId.value = null
  fn()
}

// Add Stock modal
function openAddStockModal(item: Inventory) {
  addStockItem.value = item
  addStockError.value = null
  showAddStockModal.value = true
}

function closeAddStockModal() {
  showAddStockModal.value = false
  addStockItem.value = null
  addStockError.value = null
}

function formatNumberForToast(num: number): string {
  return num % 1 === 0 ? num.toString() : num.toFixed(2)
}

const submitAddStock = async (amount: number) => {
  const item = addStockItem.value
  if (!item) return

  try {
    const newQuantity = item.quantity + amount
    await inventoryService.updateItem({
      id: item.id,
      name: item.name,
      unit: item.unit,
      quantity: newQuantity,
      reorder_level: item.reorder_level,
      supplier_id: item.supplier_id || null,
    })
    await loadInventory()

    toastMessage.value = `Added ${formatNumberForToast(amount)} ${item.unit} to ${item.name}. New stock: ${formatNumberForToast(newQuantity)}`
    showToast.value = true
    if (highlightTimeout) clearTimeout(highlightTimeout)
    lastAddedStockId.value = item.id
    highlightTimeout = setTimeout(() => {
      lastAddedStockId.value = null
      highlightTimeout = null
    }, 2500)

    setTimeout(() => {
      showToast.value = false
    }, 4000)

    closeAddStockModal()
  } catch (err) {
    addStockError.value = err instanceof Error ? err.message : 'Failed to update stock'
  }
}
</script>

<style scoped>
.inventory-page {
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
  cursor: pointer;
}

.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.stat-card.active {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
  border: 2px solid #667eea;
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
}

.search-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-left: 70px;
}

.filter-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-select {
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  font-size: 0.95rem;
  outline: none;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 160px;
}

.filter-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Table Container */
.table-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
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

.loading-state p,
.error-state p {
  color: #6b7280;
  font-size: 1rem;
  margin: 0.5rem 0 0 0;
}

.error-state svg {
  color: #ef4444;
  margin-bottom: 1rem;
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

/* Table Styles */
.inventory-table {
  width: 100%;
  border-collapse: collapse;
}

.inventory-table thead {
  background: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
}

.inventory-table th {
  padding: 1rem 1.5rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.875rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.table-row {
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s;
}

.table-row:hover {
  background: #f9fafb;
}

.inventory-table td {
  padding: 1.25rem 1.5rem;
  vertical-align: middle;
}

/* Item Cell */
.item-cell {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.item-avatar {
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

.item-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.item-name {
  font-weight: 600;
  color: #111827;
  font-size: 0.95rem;
}

.item-id {
  font-size: 0.8rem;
  color: #9ca3af;
  font-family: 'Monaco', monospace;
}

/* Unit Badge */
.unit-badge {
  display: inline-flex;
  padding: 0.375rem 0.875rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  background: #e0e7ff;
  color: #4f46e5;
}

/* Stock Cell */
.stock-cell {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 120px;
}

.stock-text {
  font-weight: 600;
  color: #111827;
  font-size: 0.95rem;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease, background 0.3s ease;
  border-radius: 3px;
}

.progress-fill.success {
  background: linear-gradient(90deg, #34d399, #10b981);
}

.progress-fill.warning {
  background: linear-gradient(90deg, #fbbf24, #f59e0b);
}

.progress-fill.danger {
  background: linear-gradient(90deg, #f87171, #ef4444);
}

/* Supplier Text */
.supplier-text {
  color: #6b7280;
  font-size: 0.9rem;
  font-family: 'Monaco', monospace;
}

/* Status Badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  white-space: nowrap;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-badge.status-good {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.status-good .status-dot {
  background: #10b981;
}

.status-badge.status-low {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.status-low .status-dot {
  background: #f59e0b;
}

.status-badge.status-out {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge.status-out .status-dot {
  background: #ef4444;
}

.status-badge.status-negative {
  background: #fecaca;
  color: #b91c1c;
}

.status-badge.status-negative .status-dot {
  background: #dc2626;
}

/* Action cell & dropdown */
.action-cell {
  position: relative;
  display: flex;
  align-items: center;
}

.action-btn.dropdown-trigger {
  min-width: 44px;
  min-height: 44px;
  padding: 10px;
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.action-btn.dropdown-trigger:hover {
  background: #f3f4f6;
  color: #111827;
}

.dropdown-panel {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  min-width: 160px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 100;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  min-height: 44px;
  padding: 0.625rem 0.75rem;
  border: none;
  border-radius: 8px;
  background: none;
  font-size: 0.9rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: background 0.15s;
  text-align: left;
}

.dropdown-item:hover {
  background: #f3f4f6;
}

.dropdown-item.add-stock {
  color: #059669;
}

.dropdown-item.delete {
  color: #dc3545;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Row highlight after add stock */
.table-row.row-highlight {
  animation: rowHighlight 2.5s ease-out;
}

@keyframes rowHighlight {
  0% {
    background: rgba(52, 211, 153, 0.25);
  }
  100% {
    background: transparent;
  }
}

/* Toast */
.toast-notification {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 10000;
  min-width: 320px;
  max-width: 420px;
}

.toast-body {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  padding: 1rem;
  gap: 0.75rem;
}

.toast-icon-wrapper {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  background: #10b981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-icon {
  width: 1rem;
  height: 1rem;
  color: #ffffff;
  stroke-width: 3;
}

.toast-text {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.125rem 0;
}

.toast-description {
  font-size: 0.8125rem;
  color: #6b7280;
  margin: 0;
}

.toast-close {
  flex-shrink: 0;
  min-width: 44px;
  min-height: 44px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: #6b7280;
  transition: color 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.toast-close:hover {
  color: #111827;
  background: #f3f4f6;
}

.toast-enter-active {
  transition: all 0.2s ease-out;
}

.toast-enter-from {
  transform: translateX(2rem);
  opacity: 0;
}

.toast-leave-active {
  transition: all 0.15s ease-in;
}

.toast-leave-from {
  opacity: 1;
}

.toast-leave-to {
  opacity: 0;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
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

  .table-container {
    overflow-x: auto;
  }

  .inventory-table {
    min-width: 800px;
  }

  .inventory-table th,
  .inventory-table td {
    padding: 1rem;
    font-size: 0.875rem;
  }

  .item-avatar {
    width: 40px;
    height: 40px;
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
}
</style>

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
      <div class="stat-card">
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

      <div class="stat-card">
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

      <div class="stat-card">
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

      <div class="stat-card">
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
          <tr v-for="item in filteredItems" :key="item.id" class="table-row">
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
              <div class="action-buttons">
                <button 
                  class="action-btn edit" 
                  @click="openEditModal(item)"
                  aria-label="Edit item"
                  title="Edit"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button 
                  class="action-btn delete" 
                  @click="deleteItem(item)"
                  aria-label="Delete item"
                  title="Delete"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3,6 5,6 21,6"></polyline>
                    <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                  </svg>
                </button>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { inventoryService } from '../services/inventoryService'
import { supabase } from '../supabase'
import type { Inventory, InventoryUnit } from '../models/Inventory'
import InventoryModal from './InventoryModal.vue'

const searchQuery = ref('')
const selectedCategory = ref('')
const inventoryItems = ref<Inventory[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

// Modal state
const showModal = ref(false)
const isEditMode = ref(false)
const currentItemId = ref<string | null>(null)

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
    inventoryItems.value = data || []
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
  if (stock === 0) return 'danger'
  if (stock <= reorderLevel) return 'warning'
  return 'success'
}

const getStatusClass = (stock: number, reorderLevel: number): string => {
  if (stock === 0) return 'status-out'
  if (stock <= reorderLevel) return 'status-low'
  return 'status-good'
}

const getStatusText = (stock: number, reorderLevel: number): string => {
  if (stock === 0) return 'Out of Stock'
  if (stock <= reorderLevel) return 'Low Stock'
  return 'In Stock'
}

const getCurrentUserId = async (): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id || 'system-user'
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

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 8px;
  background: none;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn.edit {
  color: #667eea;
}

.action-btn.edit:hover {
  background: #f0f3ff;
}

.action-btn.delete {
  color: #dc3545;
}

.action-btn.delete:hover {
  background: #ffebee;
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

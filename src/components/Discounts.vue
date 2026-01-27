<template>
  <div class="discounts-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-text">
        <h1>Discount Management</h1>
        <p>Create and manage discount codes and promotions</p>
      </div>
      <button class="btn-primary" @click="openAddModal">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Add New Discount
      </button>
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
          placeholder="Search by name or description..." 
          v-model="searchQuery" 
        />
      </div>
      
      <div class="filter-group">
        <label class="filter-label">Discount Type</label>
        <select v-model="selectedDiscountType" class="filter-select">
          <option value="">All Types</option>
          <option value="flat">Flat</option>
          <option value="percentage">Percentage</option>
        </select>
      </div>

      <div class="filter-group">
        <label class="filter-label">Status</label>
        <select v-model="selectedStatus" class="filter-select">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div class="filter-group">
        <button class="clear-filters-btn" @click="clearFilters">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          Clear Filters
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon total">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 11l3 3L22 4"></path>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Total Active</span>
          <span class="stat-value">{{ totalActiveDiscounts }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon success">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Total Discounts</span>
          <span class="stat-value">{{ totalDiscounts }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon warning">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Active Percentage</span>
          <span class="stat-value">{{ activePercentageDiscounts }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon danger">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Active Flat</span>
          <span class="stat-value">{{ activeFlatDiscounts }}</span>
        </div>
      </div>
    </div>

    <!-- Discounts Table -->
    <div class="table-container">
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading discount data...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p>{{ error }}</p>
      </div>

      <div v-else-if="filteredDiscounts.length === 0" class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M9 11l3 3L22 4"></path>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
        </svg>
        <h3>No discounts found</h3>
        <p>Try adjusting your search or filters</p>
      </div>

      <table v-else class="discounts-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="discount in filteredDiscounts" 
            :key="discount.id" 
            class="table-row"
            @click="openEditModal(discount)"
          >
            <td>
              <div class="name-cell">
                {{ discount.name }}
              </div>
            </td>

            <td>
              <div class="description-cell">
                {{ discount.description }}
              </div>
            </td>

            <td>
              <div class="amount-cell">
                {{ formatAmount(discount) }}
              </div>
            </td>
            
            <td>
              <button 
                class="status-toggle" 
                :class="{ active: discount.is_active, inactive: !discount.is_active }"
                @click.stop="toggleStatus(discount)"
                :title="discount.is_active ? 'Deactivate' : 'Activate'"
              >
                <svg v-if="discount.is_active" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {{ discount.is_active ? 'Active' : 'Inactive' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Discount Modal -->
    <DiscountModal
      :is-open="isModalOpen"
      :is-edit-mode="isEditMode"
      :initial-data="editingDiscount"
      @close="closeModal"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import DiscountModal from './DiscountModal.vue'
import { discountService } from '../services/discountService'
import type { Discount } from '../models/Discount'
import {
  filterDiscounts,
  countActiveDiscounts,
  countActiveDiscountsByType
} from '../modules/discounts/discountUtils'

const discounts = ref<Discount[]>([])
const isLoading = ref(true)
const error = ref('')
const searchQuery = ref('')
const selectedDiscountType = ref('')
const selectedStatus = ref('')
const isModalOpen = ref(false)
const isEditMode = ref(false)
const editingDiscount = ref<any>(null)

const loadDiscounts = async () => {
  try {
    isLoading.value = true
    error.value = ''
    const data = await discountService.getAll()
    discounts.value = data
  } catch (err) {
    error.value = 'Failed to load discounts. Please try again.'
    console.error('Error loading discounts:', err)
  } finally {
    isLoading.value = false
  }
}

const filteredDiscounts = computed(() => {
  const options: {
    searchQuery?: string
    discountType?: 'flat' | 'percentage'
    isActive?: boolean
  } = {}

  if (searchQuery.value) {
    options.searchQuery = searchQuery.value
  }

  if (selectedDiscountType.value) {
    options.discountType = selectedDiscountType.value as 'flat' | 'percentage'
  }

  if (selectedStatus.value === 'active') {
    options.isActive = true
  } else if (selectedStatus.value === 'inactive') {
    options.isActive = false
  }

  const filtered = filterDiscounts(discounts.value, options)

  return filtered.sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
    return dateB - dateA
  })
})

const totalActiveDiscounts = computed(() => countActiveDiscounts(discounts.value))
const totalDiscounts = computed(() => discounts.value.length)
const activePercentageDiscounts = computed(() => countActiveDiscountsByType(discounts.value, 'percentage'))
const activeFlatDiscounts = computed(() => countActiveDiscountsByType(discounts.value, 'flat'))

const openAddModal = () => {
  isEditMode.value = false
  editingDiscount.value = null
  isModalOpen.value = true
}

const openEditModal = (discount: Discount) => {
  isEditMode.value = true
  editingDiscount.value = {
    id: discount.id,
    name: discount.name,
    description: discount.description || '',
    amount: discount.amount,
    discount_type: discount.discount_type,
    is_active: discount.is_active,
    created_at: discount.created_at,
    updated_at: discount.updated_at
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  isEditMode.value = false
  editingDiscount.value = null
}

const handleSubmit = async (formData: any) => {
  try {
    if (isEditMode.value && editingDiscount.value) {
      await discountService.updateDiscount({
        id: editingDiscount.value.id,
        name: formData.name,
        description: formData.description,
        amount: formData.amount,
        discount_type: formData.discount_type,
        is_active: formData.is_active
      })
    } else {
      await discountService.addDiscount({
        name: formData.name,
        description: formData.description,
        amount: formData.amount,
        discount_type: formData.discount_type,
        is_active: formData.is_active
      })
    }
    
    await loadDiscounts()
    closeModal()
  } catch (err) {
    console.error('Error saving discount:', err)
    error.value = 'Failed to save discount. Please try again.'
  }
}

const toggleStatus = async (discount: Discount, event?: Event) => {
  if (event) {
    event.stopPropagation()
  }
  try {
    await discountService.updateDiscount({
      id: discount.id,
      is_active: !discount.is_active
    })
    await loadDiscounts()
  } catch (err) {
    console.error('Error toggling discount status:', err)
    error.value = 'Failed to update discount status. Please try again.'
  }
}

const formatAmount = (discount: Discount): string => {
  if (discount.discount_type === 'flat') {
    return `₱${discount.amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
  } else {
    return `${discount.amount}%`
  }
}


const clearFilters = () => {
  searchQuery.value = ''
  selectedDiscountType.value = ''
  selectedStatus.value = ''
}

onMounted(() => {
  loadDiscounts()
})
</script>

<style scoped>
.discounts-page {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-text h1 {
  margin: 0 0 0.25rem 0;
  font-size: 2rem;
  color: #212529;
  font-weight: 700;
}

.header-text p {
  margin: 0;
  color: #6c757d;
  font-size: 0.95rem;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
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
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
}

.stat-icon.warning {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: white;
}

.stat-icon.danger {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  color: white;
}

.stat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.85rem;
  color: #6c757d;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #212529;
}

.filters-section {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  align-items: end;
}

.search-container {
  position: relative;
  flex: 1;
  min-width: 250px;
  max-width: 500px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 12px 12px 12px 42px;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 0.95rem;
  transition: all 0.2s;
  background: white;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 150px;
}

.filter-label {
  font-size: 0.85rem;
  color: #495057;
  font-weight: 600;
}

.filter-select {
  padding: 12px 14px;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 0.9rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.clear-filters-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  color: #6c757d;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 20px;
  justify-content: end;
}

.clear-filters-btn:hover {
  background: #e9ecef;
  border-color: #dee2e6;
  color: #495057;
}

.clear-filters-btn:active {
  transform: translateY(1px);
}

.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin-bottom: 2rem;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #6c757d;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #f3f4f6;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state svg {
  color: #dc3545;
  margin-bottom: 1rem;
}

.empty-state svg {
  color: #adb5bd;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0.5rem 0 0.25rem 0;
  color: #495057;
}

.discounts-table {
  width: 100%;
  border-collapse: collapse;
}

.discounts-table thead {
  background: #f8f9fa;
}

.discounts-table th {
  padding: 1rem;
  text-align: left;
  font-size: 0.85rem;
  font-weight: 700;
  color: #495057;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e9ecef;
}

.table-row {
  border-bottom: 1px solid #f1f3f5;
  transition: background-color 0.2s;
  cursor: pointer;
}

.table-row:hover {
  background-color: #f8f9fa;
}

.table-row td {
  padding: 1rem;
  font-size: 0.95rem;
  color: #495057;
}

.name-cell {
  font-weight: 600;
  color: #212529;
}

.amount-cell {
  font-weight: 700;
  color: #28a745;
  font-size: 1.05rem;
}

.status-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.status-toggle.active {
  background: #d4edda;
  color: #155724;
}

.status-toggle.inactive {
  background: #f8d7da;
  color: #721c24;
}

.status-toggle:hover {
  opacity: 0.8;
  transform: translateY(-1px);
}

@media (max-width: 480px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
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
    gap: 1rem;
  }

  .filters-section {
    flex-direction: column;
  }

  .search-container {
    min-width: 100%;
    max-width: none;
  }

  .filter-group {
    width: 100%;
  }

  .clear-filters-btn {
    width: 100%;
    justify-content: center;
    margin-top: 0;
  }

  .table-container {
    overflow-x: auto;
  }

  .discounts-table {
    min-width: 400px;
  }
}
</style>

<template>
  <div class="expenses-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-text">
        <h1>Expense Management</h1>
        <p>Track and manage your business expenses</p>
      </div>
      <button class="btn-primary" @click="openAddModal">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Add New Expense
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
          placeholder="Search by description or category..." 
          v-model="searchQuery" 
        />
      </div>
      
      <div class="filter-group">
        <label class="filter-label">Category</label>
        <select v-model="selectedCategory" class="filter-select">
          <option value="">All Categories</option>
          <option value="Supplies">Supplies</option>
          <option value="Gas">Gas</option>
          <option value="Misc">Misc</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Equipment">Equipment</option>
          <option value="Food">Food</option>
          <option value="Utilities">Utilities</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div class="filter-group">
        <label class="filter-label">Start Date</label>
        <input type="date" v-model="startDate" class="filter-input" />
      </div>

      <div class="filter-group">
        <label class="filter-label">End Date</label>
        <input type="date" v-model="endDate" class="filter-input" />
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
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Total Expenses</span>
          <span class="stat-value">₱{{ formatCurrency(totalExpenses) }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon success">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 3v18h18"></path>
            <path d="m19 9-5 5-4-4-3 3"></path>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Average Expense</span>
          <span class="stat-value">₱{{ formatCurrency(averageExpense) }}</span>
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
          <span class="stat-label">Total Categories</span>
          <span class="stat-value">{{ totalCategories }}</span>
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
          <span class="stat-label">This Month</span>
          <span class="stat-value">₱{{ formatCurrency(thisMonthTotal) }}</span>
        </div>
      </div>
    </div>

    <!-- Expenses Table -->
    <div class="table-container">
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading expense data...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p>{{ error }}</p>
      </div>

      <div v-else-if="filteredExpenses.length === 0" class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
        </svg>
        <h3>No expenses found</h3>
        <p>Try adjusting your search or filters</p>
      </div>

      <table v-else class="expenses-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Supplier</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="expense in filteredExpenses" :key="expense.id" class="table-row">
            <td>
              <div class="date-cell">
                {{ formatDate(expense.expense_date) }}
              </div>
            </td>
            
            <td>
              <span class="category-badge" :class="getCategoryClass(expense.category)">
                {{ expense.category }}
              </span>
            </td>
            
            <td>
              <div class="description-cell">
                {{ expense.description }}
              </div>
            </td>
            
            <td>
              <div class="amount-cell">
                ₱{{ formatCurrency(expense.amount) }}
              </div>
            </td>
            
            <td>
              <span class="supplier-text">{{ expense.supplier_id || 'N/A' }}</span>
            </td>
            
            <td>
              <div class="action-buttons">
                <button 
                  class="action-btn edit" 
                  @click="openEditModal(expense)"
                  aria-label="Edit expense"
                  title="Edit"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button 
                  class="action-btn delete" 
                  @click="deleteExpense(expense)"
                  aria-label="Delete expense"
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

    <!-- Category Breakdown Section -->
    <div v-if="expenses.length > 0" class="category-breakdown">
      <h2>Expenses by Category</h2>
      <div class="category-list">
        <div 
          v-for="(amount, category) in expensesByCategory" 
          :key="category" 
          class="category-item"
        >
          <div class="category-info">
            <span class="category-badge" :class="getCategoryClass(category)">
              {{ category }}
            </span>
            <div class="category-stats">
              <span class="category-amount">₱{{ formatCurrency(amount) }}</span>
              <span class="category-percentage">{{ calculatePercentage(category) }}%</span>
            </div>
          </div>
          <div class="category-progress">
            <div 
              class="category-progress-bar" 
              :class="getCategoryClass(category)"
              :style="{ width: calculatePercentage(category) + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Expense Modal -->
    <ExpenseModal
      :is-open="isModalOpen"
      :is-edit-mode="isEditMode"
      :initial-data="editingExpense"
      @close="closeModal"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import ExpenseModal from './ExpenseModal.vue'
import { expenseService } from '../services/expenseService'
import type { Expense } from '../models/Expense'
import {
  calculateTotalExpenses,
  calculateExpensesByCategory,
  calculateAverageExpense,
  calculateCategoryPercentage,
  filterExpensesByDateRange
} from '../modules/expenses/expenseUtils'

const expenses = ref<Expense[]>([])
const isLoading = ref(true)
const error = ref('')
const searchQuery = ref('')
const selectedCategory = ref('')
const startDate = ref('')
const endDate = ref('')
const isModalOpen = ref(false)
const isEditMode = ref(false)
const editingExpense = ref<any>(null)

const loadExpenses = async () => {
  try {
    isLoading.value = true
    error.value = ''
    const data = await expenseService.getAll()
    expenses.value = data
  } catch (err) {
    error.value = 'Failed to load expenses. Please try again.'
    console.error('Error loading expenses:', err)
  } finally {
    isLoading.value = false
  }
}

const filteredExpenses = computed(() => {
  let filtered = [...expenses.value]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(expense => 
      expense.description.toLowerCase().includes(query) ||
      expense.category.toLowerCase().includes(query)
    )
  }

  if (selectedCategory.value) {
    filtered = filtered.filter(expense => expense.category === selectedCategory.value)
  }

  if (startDate.value && endDate.value) {
    filtered = filterExpensesByDateRange(filtered, startDate.value, endDate.value)
  }

  return filtered.sort((a, b) => 
    new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime()
  )
})

const totalExpenses = computed(() => calculateTotalExpenses(filteredExpenses.value))
const averageExpense = computed(() => calculateAverageExpense(filteredExpenses.value))
const expensesByCategory = computed(() => calculateExpensesByCategory(filteredExpenses.value))
const totalCategories = computed(() => Object.keys(expensesByCategory.value).length)

const thisMonthTotal = computed(() => {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0] as string
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0] as string
  const monthExpenses = filterExpensesByDateRange(expenses.value, startOfMonth, endOfMonth)
  return calculateTotalExpenses(monthExpenses)
})

const openAddModal = () => {
  isEditMode.value = false
  editingExpense.value = null
  isModalOpen.value = true
}

const openEditModal = (expense: Expense) => {
  isEditMode.value = true
  editingExpense.value = {
    id: expense.id,
    expense_date: expense.expense_date,
    category: expense.category,
    description: expense.description,
    amount: expense.amount,
    supplier_id: expense.supplier_id || ''
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  isEditMode.value = false
  editingExpense.value = null
}

const handleSubmit = async (formData: any) => {
  try {
    if (isEditMode.value && editingExpense.value) {
      await expenseService.updateExpense({
        id: editingExpense.value.id,
        date: formData.expense_date,
        category: formData.category,
        description: formData.description,
        amount: formData.amount,
        supplier_id: formData.supplier_id
      })
    } else {
      await expenseService.addExpense({
        date: formData.expense_date,
        category: formData.category,
        description: formData.description,
        amount: formData.amount,
        supplier_id: formData.supplier_id
      })
    }
    
    await loadExpenses()
    closeModal()
  } catch (err) {
    console.error('Error saving expense:', err)
    error.value = 'Failed to save expense. Please try again.'
  }
}

const deleteExpense = async (expense: Expense) => {
  if (!confirm(`Are you sure you want to delete this expense: "${expense.description}"?`)) {
    return
  }

  try {
    await expenseService.deleteExpense(expense.id)
    await loadExpenses()
  } catch (err) {
    console.error('Error deleting expense:', err)
    error.value = 'Failed to delete expense. Please try again.'
  }
}

const formatCurrency = (value: number): string => {
  return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

const getCategoryClass = (category: string): string => {
  const classes: Record<string, string> = {
    'Supplies': 'category-supplies',
    'Gas': 'category-gas',
    'Misc': 'category-misc',
    'Maintenance': 'category-maintenance',
    'Equipment': 'category-equipment',
    'Food': 'category-food',
    'Utilities': 'category-utilities',
    'Other': 'category-other'
  }
  return classes[category] || 'category-default'
}

const calculatePercentage = (category: string): string => {
  return calculateCategoryPercentage(filteredExpenses.value, category).toFixed(1)
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  startDate.value = ''
  endDate.value = ''
}

onMounted(() => {
  loadExpenses()
})
</script>

<style scoped>
.expenses-page {
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

.filter-select,
.filter-input {
  padding: 12px 14px;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 0.9rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-select:focus,
.filter-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.date-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.date-input {
  padding-right: 40px;
  width: 100%;
}

.date-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  pointer-events: none;
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

.expenses-table {
  width: 100%;
  border-collapse: collapse;
}

.expenses-table thead {
  background: #f8f9fa;
}

.expenses-table th {
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
}

.table-row:hover {
  background-color: #f8f9fa;
}

.table-row td {
  padding: 1rem;
  font-size: 0.95rem;
  color: #495057;
}

.date-cell {
  font-weight: 600;
  color: #212529;
}

.category-badge {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
}

.category-supplies { background: #e3f2fd; color: #1976d2; }
.category-gas { background: #fff3e0; color: #f57c00; }
.category-misc { background: #f3e5f5; color: #7b1fa2; }
.category-maintenance { background: #e8f5e9; color: #388e3c; }
.category-equipment { background: #fce4ec; color: #c2185b; }
.category-food { background: #fff9c4; color: #f9a825; }
.category-utilities { background: #e0f2f1; color: #00796b; }
.category-other { background: #eceff1; color: #546e7a; }
.category-default { background: #f5f5f5; color: #616161; }

.description-cell {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.amount-cell {
  font-weight: 700;
  color: #dc3545;
  font-size: 1.05rem;
}

.supplier-text {
  color: #6c757d;
  font-size: 0.9rem;
}

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

.category-breakdown {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
}

.category-breakdown h2 {
  margin: 0 0 1.5rem 0;
  font-size: 1.3rem;
  color: #212529;
}

.category-list {
  display: grid;
  gap: 1rem;
}

.category-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.category-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-stats {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.category-amount {
  font-weight: 700;
  color: #212529;
  font-size: 1.1rem;
}

.category-percentage {
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 600;
}

.category-progress {
  height: 8px;
  background: #f1f3f5;
  border-radius: 4px;
  overflow: hidden;
}

.category-progress-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.category-progress-bar.category-supplies { background: #1976d2; }
.category-progress-bar.category-gas { background: #f57c00; }
.category-progress-bar.category-misc { background: #7b1fa2; }
.category-progress-bar.category-maintenance { background: #388e3c; }
.category-progress-bar.category-equipment { background: #c2185b; }
.category-progress-bar.category-food { background: #f9a825; }
.category-progress-bar.category-utilities { background: #00796b; }
.category-progress-bar.category-other { background: #546e7a; }

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

  .expenses-table {
    min-width: 800px;
  }

  .category-breakdown {
    padding: 1rem;
  }
}
</style>


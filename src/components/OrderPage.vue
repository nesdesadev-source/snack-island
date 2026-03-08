<template>
  <div class="order-page">
    <!-- Loading Overlay -->
    <Transition name="fade">
      <div v-if="isLoading" class="loading-overlay">
        <div class="loading-spinner"></div>
        <p class="loading-text">Loading...</p>
      </div>
    </Transition>

    <!-- Professional Header -->
    <div class="header">
      <div class="header-content">
        <div class="header-left">
          <div class="brand-section">
            <h1 class="brand-title">SNACK ISLAND</h1>
            <span class="brand-divider">|</span>
            <span class="brand-subtitle">POS SYSTEM</span>
          </div>
        </div>
        <div class="header-right">
          <div class="session-controls">
            <button v-if="!activeSession && !isSessionLoading" @click="handleStartDay" class="session-btn session-btn-start">
              Start Day
            </button>
            <button v-else-if="activeSession" @click="handleEndDay" class="session-btn session-btn-end">
              End of Day
            </button>
            <span v-else-if="isSessionLoading" class="session-loading">Loading...</span>
          </div>
          <div class="datetime-section">
            <div class="date-display date-display-desktop">{{ currentDate }}</div>
            <div class="date-display date-display-mobile">{{ currentDateMobile }}</div>
            <div class="time-display">{{ currentTime }}</div>
          </div>
          <div class="status-badge" :class="{ 'session-closed': !activeSession }">
            <span class="status-dot"></span>
            <span class="status-label">{{ activeSession ? 'SESSION ACTIVE' : 'SESSION CLOSED' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Store closed banner -->
    <Transition name="fade">
      <div v-if="!activeSession && !isSessionLoading" class="closed-banner-wrap">
        <div class="closed-banner">
          <p>Store is currently closed. Tap <strong>Start Day</strong> to begin a new session.</p>
        </div>
      </div>
    </Transition>

    <!-- Total Sales Display -->
    <div class="sales-summary">
      <div class="sales-summary-content">
        <div class="sales-label">Total Completed Sales</div>
        <div class="sales-right">
          <div class="sales-amount-wrapper">
            <div class="sales-amount">
              <span v-if="showSalesAmount">
                ₱{{ formatNumber(totalCompletedSales) }} 
                <span class="sales-breakdown">
                  (Cash: ₱{{ formatNumber(cashSales) }}, GCash: ₱{{ formatNumber(gcashSales) }})
                </span>
              </span>
              <span v-else>₱****</span>
            </div>
            <button @click="toggleSalesVisibility" class="eye-button" :class="{ 'active': showSalesAmount }">
              <svg v-if="showSalesAmount" class="eye-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
              </svg>
              <svg v-else class="eye-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
            </button>
          </div>
          <ProfitProgressCircle :profit="todayProfit" />
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Order Queue Card - Full Width -->
      <div class="card order-queue-card">
        <div class="card-header">
          <h2 class="card-title">Order Queue</h2>
          <button
            @click="openModal"
            class="new-order-btn"
            :class="{ 'new-order-btn-disabled': !activeSession }"
            :disabled="!activeSession"
            :title="!activeSession ? 'Start Day to create orders' : ''"
          >
            + New Order
          </button>
        </div>
        <div class="card-body">
          <OrderQueue 
            ref="orderQueueRef"
            :session-range="sessionRange"
            @order-updated="handleOrderUpdated" 
          />
        </div>
      </div>
    </div>

    <!-- Order Form Modal -->
    <Transition name="modal">
      <div v-if="showModal" class="modal-backdrop" @click="closeModal">
        <div class="modal-dialog" @click.stop>
          <div class="modal-header">
            <h2 class="modal-title">New Order</h2>
            <button @click="closeModal" class="modal-close">
              <svg class="close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <OrderForm @order-submitted="handleOrderSubmitted" @close="closeModal" />
          </div>
        </div>
      </div>
    </Transition>

    <!-- Session closed toast -->
    <Transition name="toast">
      <div v-if="sessionError" class="toast-notification toast-warning">
        <div class="toast-body">
          <div class="toast-text">
            <div class="toast-title">Store Closed</div>
            <div class="toast-description">{{ sessionError }}</div>
          </div>
          <button @click="sessionError = null" class="toast-close">
            <svg class="close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Success Toast -->
    <Transition name="toast">
      <div v-if="showSuccessMessage" class="toast-notification">
        <div class="toast-body">
          <div class="toast-icon-wrapper">
            <svg class="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <div class="toast-text">
            <div class="toast-title">Order Submitted</div>
            <div class="toast-description">Order has been added to the queue</div>
          </div>
          <button @click="showSuccessMessage = false" class="toast-close">
            <svg class="close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import OrderForm from './OrderForm.vue'
import OrderQueue from './OrderQueue.vue'
import ProfitProgressCircle from './ProfitProgressCircle.vue'
import { OrderService } from '../services/orderService'
import { expenseService } from '../services/expenseService'
import { StoreSessionService } from '../services/storeSessionService'
import { calculateTotalExpenses } from '../modules/expenses/expenseUtils'
import type { Order, Expense, StoreSession } from '../models'

// State
const orderQueueRef = ref<InstanceType<typeof OrderQueue> | null>(null)
const showSuccessMessage = ref(false)
const showModal = ref(false)
const currentTime = ref('')
const currentDate = ref('')
const currentDateMobile = ref('')
const orders = ref<Order[]>([])
const expenses = ref<Expense[]>([])
const showSalesAmount = ref(false)
const isLoading = ref(true)
const activeSession = ref<StoreSession | null>(null)
const isSessionLoading = ref(true)
const sessionError = ref<string | null>(null)
let salesVisibilityTimeout: number | null = null

// Session range for OrderQueue and filtering (null when no active session)
const sessionRange = computed(() => {
  if (!activeSession.value) return null
  return StoreSessionService.getSessionRange(activeSession.value)
})

// Computed properties for real-time updates
let timeInterval: number | null = null

// Helper: completed orders within the active session range
const getSessionCompletedOrders = () => {
  if (!sessionRange.value) return []
  const { start, end } = sessionRange.value
  return orders.value.filter(order => {
    if (order.status !== 'completed' || !order.created_at) return false
    const t = new Date(order.created_at).getTime()
    return t >= start.getTime() && t <= end.getTime()
  })
}

// Computed total sales from completed orders (session only)
const totalCompletedSales = computed(() => {
  return getSessionCompletedOrders()
    .reduce((total, order) => total + (order.total_amount || 0), 0)
})

// Computed cash sales from completed orders (session only)
const cashSales = computed(() => {
  return getSessionCompletedOrders()
    .filter(order => order.payment_method === 'cash')
    .reduce((total, order) => total + (order.total_amount || 0), 0)
})

// Computed gcash sales from completed orders (session only)
const gcashSales = computed(() => {
  return getSessionCompletedOrders()
    .filter(order => order.payment_method === 'gcash')
    .reduce((total, order) => total + (order.total_amount || 0), 0)
})

// Computed total expenses for the active session
const todayExpenses = computed(() => {
  if (!sessionRange.value) return 0
  const { start, end } = sessionRange.value
  const sessionExpenses = expenses.value.filter(expense => {
    if (!expense.expense_date) return false
    const expenseTime = new Date(expense.expense_date).getTime()
    return expenseTime >= start.getTime() && expenseTime <= end.getTime()
  })
  return calculateTotalExpenses(sessionExpenses)
})

// Computed session profit
const todayProfit = computed(() => {
  return totalCompletedSales.value - todayExpenses.value
})

// Methods
const updateDateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  })
  currentDate.value = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  // Mobile format: Saturday, 11/15/25
  const weekday = now.toLocaleDateString('en-US', { weekday: 'long' })
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const year = now.getFullYear().toString().slice(-2)
  currentDateMobile.value = `${weekday}, ${month}/${day}/${year}`
}

const openModal = () => {
  if (!activeSession.value) {
    showSessionClosedToast()
    return
  }
  showModal.value = true
}

const showSessionClosedToast = () => {
  sessionError.value = 'Store is closed. Start Day to create orders.'
  setTimeout(() => { sessionError.value = null }, 4000)
}

const closeModal = () => {
  showModal.value = false
}

const handleOrderSubmitted = async () => {
  // Close modal
  closeModal()
  
  // Refresh the order queue
  if (orderQueueRef.value) {
    await orderQueueRef.value.refreshAll()
  }
  
  // Refresh orders to update total sales
  await loadOrders()
  
  // Show success message
  showSuccessMessage.value = true
  setTimeout(() => {
    showSuccessMessage.value = false
  }, 5000)
}

const handleOrderUpdated = async () => {
  // Refresh orders when orders are updated
  await loadOrders()
  // Refresh expenses to update profit calculation
  await loadExpenses()
}

// Load active session
const loadSession = async () => {
  isSessionLoading.value = true
  sessionError.value = null
  try {
    activeSession.value = await StoreSessionService.getActiveSession()
  } catch (error) {
    console.error('Error loading session:', error)
    sessionError.value = 'Failed to load session. Please refresh.'
  } finally {
    isSessionLoading.value = false
  }
}

const handleStartDay = async () => {
  try {
    activeSession.value = await StoreSessionService.openSession()
    await Promise.all([loadOrders(), loadExpenses()])
    if (orderQueueRef.value) await orderQueueRef.value.refreshAll()
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to start day.'
    sessionError.value = msg
    setTimeout(() => { sessionError.value = null }, 5000)
  }
}

const handleEndDay = async () => {
  if (!activeSession.value) return
  const hasPending = orders.value.some(o => o.status === 'pending' || o.status === 'ready')
  if (hasPending && !confirm('There are still open orders. Are you sure you want to end the day?')) {
    return
  }
  try {
    await StoreSessionService.closeSession(activeSession.value.id)
    activeSession.value = null
    orders.value = []
    await loadExpenses()
    if (orderQueueRef.value) await orderQueueRef.value.refreshAll()
  } catch (error) {
    console.error('Error closing session:', error)
    sessionError.value = 'Failed to end day. Please try again.'
    setTimeout(() => { sessionError.value = null }, 5000)
  }
}

// Load orders (uses session range when activeSession exists)
const loadOrders = async () => {
  if (!sessionRange.value) {
    orders.value = []
    return
  }
  try {
    const { start, end } = sessionRange.value
    orders.value = await OrderService.getOrders({ startDate: start, endDate: end })
  } catch (error) {
    console.error('Error loading orders:', error)
  }
}

// Load expenses (full list; filtering by session is done in computed)
const loadExpenses = async () => {
  try {
    expenses.value = await expenseService.getAll()
  } catch (error) {
    console.error('Error loading expenses:', error)
  }
}

// Format number with commas
const formatNumber = (num: number): string => {
  return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// Toggle sales visibility with auto-hide
const toggleSalesVisibility = () => {
  showSalesAmount.value = !showSalesAmount.value
  
  // Clear existing timeout if any
  if (salesVisibilityTimeout) {
    clearTimeout(salesVisibilityTimeout)
    salesVisibilityTimeout = null
  }
  
  // Auto-hide after 5 seconds if showing
  if (showSalesAmount.value) {
    salesVisibilityTimeout = setTimeout(() => {
      showSalesAmount.value = false
      salesVisibilityTimeout = null
    }, 5000)
  }
}

// Lifecycle
onMounted(async () => {
  updateDateTime()
  timeInterval = setInterval(updateDateTime, 1000)
  try {
    isLoading.value = true
    await loadSession()
    if (activeSession.value) {
      await Promise.all([loadOrders(), loadExpenses()])
    }
  } catch (error) {
    console.error('Error loading data:', error)
    alert('Failed to load data. Please try again.')
  } finally {
    isLoading.value = false
  }
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
  if (salesVisibilityTimeout) {
    clearTimeout(salesVisibilityTimeout)
  }
})
</script>

<style scoped>
/* Modern Professional Layout - single scroll for whole page (no nested scroll) */
.order-page {
  min-height: 100vh;
  min-height: 100dvh;
  background: #f5f5f7;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  position: relative;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  gap: 1rem;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e5e5;
  border-top: 4px solid #1d1d1f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: 0.9375rem;
  font-weight: 500;
  color: #86868b;
  letter-spacing: 0.3px;
  margin: 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Fade Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Professional Header */
.header {
  background: #ffffff;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.08);
  border-bottom: 1px solid #e5e5e5;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 4rem;
}

.header-left {
  display: flex;
  align-items: center;
}

.brand-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.brand-title {
  font-size: 1.125rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: #1d1d1f;
  margin: 0;
}

.brand-divider {
  color: #d2d2d7;
  font-weight: 300;
}

.brand-subtitle {
  font-size: 0.875rem;
  font-weight: 400;
  color: #86868b;
  letter-spacing: 0.5px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.datetime-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.125rem;
}

.date-display {
  font-size: 0.8125rem;
  font-weight: 500;
  color: #1d1d1f;
  letter-spacing: 0.2px;
}

.date-display-mobile {
  display: none;
}

.time-display {
  font-size: 0.75rem;
  font-weight: 400;
  color: #86868b;
  font-variant-numeric: tabular-nums;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  background: #f5f5f7;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
}

.status-dot {
  width: 6px;
  height: 6px;
  background: #34c759;
  border-radius: 50%;
}

.status-label {
  font-size: 0.6875rem;
  font-weight: 600;
  color: #1d1d1f;
  letter-spacing: 0.5px;
}

.status-badge.session-closed .status-dot {
  background: #86868b;
}

.session-controls {
  display: flex;
  align-items: center;
}

.session-btn {
  padding: 0.375rem 0.75rem;
  border-radius: 4px;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid;
}

.session-btn-start {
  background: #34c759;
  color: #ffffff;
  border-color: #34c759;
}

.session-btn-start:hover {
  background: #2da84c;
  border-color: #2da84c;
}

.session-btn-end {
  background: #dc3545;
  color: #ffffff;
  border-color: #dc3545;
}

.session-btn-end:hover {
  background: #c82333;
  border-color: #c82333;
}

.session-loading {
  font-size: 0.75rem;
  color: #86868b;
}

.closed-banner-wrap {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  margin-top: 1rem;
}

.closed-banner {
  padding: 0.75rem 1.5rem;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 6px;
}

.closed-banner p {
  margin: 0;
  font-size: 0.875rem;
  color: #856404;
}

.closed-banner strong {
  font-weight: 700;
}

.new-order-btn-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.new-order-btn:disabled:hover {
  background: #1d1d1f;
  border-color: #1d1d1f;
}

.toast-warning .toast-body {
  border-color: #ffc107;
  background: #fffdf5;
}

.toast-warning .toast-title {
  color: #856404;
}

/* Sales Summary */
.sales-summary {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem 2rem 0;
}

.sales-summary-content {
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.04);
}

.sales-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.sales-label {
  font-size: 0.9375rem;
  font-weight: 500;
  color: #86868b;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.sales-amount-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.sales-amount {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1d1d1f;
  letter-spacing: 0.3px;
  font-variant-numeric: tabular-nums;
}

.sales-breakdown {
  font-size: 0.875rem;
  font-weight: 400;
  color: #86868b;
  margin-left: 0.5rem;
}

.eye-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.375rem;
  color: #86868b;
  transition: color 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.eye-button:hover {
  color: #1d1d1f;
  background: #f5f5f7;
}

.eye-button.active {
  color: #1d1d1f;
}

.eye-icon {
  width: 1.25rem;
  height: 1.25rem;
  stroke-width: 2;
}

/* Main Content - single scroll: no inner scroll container, page scrolls as one */
.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

/* Card Styles */
.card {
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.04);
}

.card-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e5e5e5;
  background: #fafafa;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.new-order-btn {
  background: #1d1d1f;
  color: #ffffff;
  border: 1px solid #1d1d1f;
  border-radius: 6px;
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  letter-spacing: 0.3px;
}

.new-order-btn:hover {
  background: #2c2c2e;
  border-color: #2c2c2e;
}

.card-body {
  padding: 1.5rem;
  background: #ffffff;
}

/* Order Queue Card - Full Width, grows with content (single page scroll) */
.order-queue-card {
  background: #ffffff;
  border: 1px solid #e5e5e5;
  display: flex;
  flex-direction: column;
}

.order-queue-card .card-body {
  flex: 1;
  padding: 0;
  min-height: 0;
}

/* Modal Styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-dialog {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
  max-width: 1000px;
  width: 100%;
  max-height: 90vh;
  max-height: min(90vh, 90dvh);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e5e5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fafafa;
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
  letter-spacing: 0.3px;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: #86868b;
  transition: color 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  color: #1d1d1f;
}

.modal-close .close-icon {
  width: 1.25rem;
  height: 1.25rem;
  stroke-width: 2;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;
  min-height: 0;
  -webkit-overflow-scrolling: touch;
}

/* Custom scrollbar for modal */
.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-track {
  background: #f5f5f7;
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #d2d2d7;
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: #86868b;
}

/* Modal Transitions */
.modal-enter-active {
  transition: all 0.3s ease-out;
}

.modal-leave-active {
  transition: all 0.2s ease-in;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-dialog {
  transform: scale(0.95) translateY(-20px);
}

.modal-enter-to .modal-dialog {
  transform: scale(1) translateY(0);
}

.modal-leave-from .modal-dialog {
  transform: scale(1) translateY(0);
}

.modal-leave-to .modal-dialog {
  transform: scale(0.95) translateY(-20px);
}

/* Toast Notification */
.toast-notification {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 200;
  min-width: 320px;
}

.toast-body {
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  padding: 1rem;
  gap: 0.75rem;
}

.toast-icon-wrapper {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  background: #34c759;
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
}

.toast-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 0.125rem 0;
}

.toast-description {
  font-size: 0.8125rem;
  color: #86868b;
  margin: 0;
}

.toast-close {
  flex-shrink: 0;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: #86868b;
  transition: color 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-close:hover {
  color: #1d1d1f;
}

.close-icon {
  width: 1rem;
  height: 1rem;
  stroke-width: 2;
}

/* Toast Transitions */
.toast-enter-active {
  transition: all 0.2s ease-out;
}

.toast-enter-from {
  transform: translateX(2rem);
  opacity: 0;
}

.toast-enter-to {
  transform: translateX(0);
  opacity: 1;
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
@media (max-width: 768px) {
  .header {
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .header-content {
    padding: 0.75rem 1rem;
    height: auto;
    min-height: 3.5rem;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .header-left {
    flex: 1;
    min-width: 0;
  }

  .brand-section {
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .brand-title {
    font-size: 0.9375rem;
    letter-spacing: 0.3px;
  }

  .brand-divider {
    display: none;
  }

  .brand-subtitle {
    font-size: 0.6875rem;
    display: none;
  }

  .header-right {
    gap: 1rem;
    flex-shrink: 0;
  }

  .datetime-section {
    gap: 0.0625rem;
  }

  .date-display-desktop {
    display: none;
  }

  .date-display-mobile {
    display: block;
    font-size: 0.6875rem;
    white-space: nowrap;
  }

  .time-display {
    font-size: 0.6875rem;
  }

  .status-badge {
    display: none;
  }

  .sales-summary {
    padding: 1rem 0.75rem 0;
  }

  .sales-summary-content {
    padding: 1rem;
    gap: 1rem;
    flex-direction: column;
    align-items: flex-start;
  }

  .sales-right {
    width: 100%;
    justify-content: space-between;
  }

  .sales-label {
    font-size: 0.8125rem;
  }

  .sales-amount-wrapper {
    width: 100%;
    justify-content: space-between;
  }

  .sales-amount {
    font-size: 1.25rem;
  }

  .main-content {
    padding: 0;
  }

  .card {
    border-radius: 0;
    border-left: none;
    border-right: none;
    box-shadow: none;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.75rem;
  }

  .card-title {
    font-size: 0.875rem;
  }

  .card-body {
    padding: 0;
  }

  .order-queue-card {
    border-radius: 0;
    border-left: none;
    border-right: none;
  }

  .new-order-btn {
    width: 100%;
  }

  .modal-backdrop {
    padding: 0;
    align-items: flex-start;
  }

  .modal-dialog {
    max-width: 100vw;
    max-height: 100vh;
    max-height: 100dvh;
    height: 100vh;
    height: 100dvh;
    margin: 0;
    border-radius: 0;
    width: 100vw;
    box-sizing: border-box;
  }

  .modal-header {
    padding: 0.875rem 1rem;
    flex-shrink: 0;
  }

  .modal-title {
    font-size: 1rem;
  }

  .modal-body {
    padding: 0.5rem;
    overflow-y: auto;
  }

  .toast-notification {
    right: 1rem;
    left: 1rem;
    min-width: unset;
  }
}

@media (max-width: 480px) {
  .header-content {
    padding: 0.625rem 0.75rem;
    min-height: 3rem;
  }

  .brand-title {
    font-size: 0.875rem;
  }

  .datetime-section {
    align-items: flex-end;
  }

  .date-display-mobile {
    font-size: 0.625rem;
    max-width: 120px;
  }

  .time-display {
    font-size: 0.625rem;
  }

  .sales-summary {
    padding: 0.75rem 0.625rem 0;
  }

  .sales-summary-content {
    padding: 0.875rem;
    gap: 0.75rem;
  }

  .sales-label {
    font-size: 0.75rem;
  }

  .sales-amount {
    font-size: 1.125rem;
  }

  .eye-icon {
    width: 1.125rem;
    height: 1.125rem;
  }

  .main-content {
    padding: 0;
  }

  .card-header {
    padding: 0.625rem;
    gap: 0.375rem;
  }

  .card-title {
    font-size: 0.8125rem;
  }

}

/* Tablet / iPad: single scroll, safe area, touch-friendly */
@media (min-width: 769px) and (max-width: 1024px) {
  .order-page {
    padding-bottom: env(safe-area-inset-bottom, 0);
  }

  .header {
    padding-left: env(safe-area-inset-left, 0);
    padding-right: env(safe-area-inset-right, 0);
  }

  .sales-summary,
  .main-content {
    padding-left: max(2rem, env(safe-area-inset-left, 0));
    padding-right: max(2rem, env(safe-area-inset-right, 0));
  }

  .modal-dialog {
    max-height: min(90vh, 90dvh);
    margin: env(safe-area-inset-top, 0) env(safe-area-inset-right, 0) env(safe-area-inset-bottom, 0) env(safe-area-inset-left, 0);
  }

  .new-order-btn {
    min-height: 44px;
    padding: 0.75rem 1.5rem;
  }
}
</style>


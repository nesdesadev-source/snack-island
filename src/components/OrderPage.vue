<template>
  <div class="order-page">
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
          <div class="datetime-section">
            <div class="date-display">{{ currentDate }}</div>
            <div class="time-display">{{ currentTime }}</div>
          </div>
          <div class="status-badge">
            <span class="status-dot"></span>
            <span class="status-label">ONLINE</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Order Queue Card - Full Width -->
      <div class="card order-queue-card">
        <div class="card-header">
          <h2 class="card-title">Order Queue</h2>
          <button @click="openModal" class="new-order-btn">+ New Order</button>
        </div>
        <div class="card-body">
          <OrderQueue 
            ref="orderQueueRef"
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
            <OrderForm @order-submitted="handleOrderSubmitted" />
          </div>
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
import { ref, onMounted, onUnmounted } from 'vue'
import OrderForm from './OrderForm.vue'
import OrderQueue from './OrderQueue.vue'

// State
const orderQueueRef = ref<InstanceType<typeof OrderQueue> | null>(null)
const showSuccessMessage = ref(false)
const showModal = ref(false)
const currentTime = ref('')
const currentDate = ref('')

// Computed properties for real-time updates
let timeInterval: number | null = null

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
}

const openModal = () => {
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const handleOrderSubmitted = () => {
  // Close modal
  closeModal()
  
  // Refresh the order queue
  if (orderQueueRef.value) {
    orderQueueRef.value.refreshOrders()
  }
  
  // Show success message
  showSuccessMessage.value = true
  setTimeout(() => {
    showSuccessMessage.value = false
  }, 5000)
}

const handleOrderUpdated = () => {
  // Handle any additional logic when orders are updated
  console.log('Order updated')
}

// Lifecycle
onMounted(() => {
  updateDateTime()
  timeInterval = setInterval(updateDateTime, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped>
/* Modern Professional Layout */
.order-page {
  min-height: 100vh;
  background: #f5f5f7;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
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

/* Main Content */
.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  max-height: calc(100vh - 4rem);
  overflow: hidden;
}

/* Custom scrollbar for main content */
.main-content::-webkit-scrollbar {
  width: 8px;
}

.main-content::-webkit-scrollbar-track {
  background: #f5f5f7;
  border-radius: 4px;
}

.main-content::-webkit-scrollbar-thumb {
  background: #d2d2d7;
  border-radius: 4px;
}

.main-content::-webkit-scrollbar-thumb:hover {
  background: #86868b;
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

/* Order Queue Card - Full Width */
.order-queue-card {
  background: #ffffff;
  border: 1px solid #e5e5e5;
  max-height: calc(100vh - 15rem);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.order-queue-card .card-body {
  flex: 1;
  overflow: auto;
  padding: 0;
  height: 100%;
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
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
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
  flex: 1;
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
  .header-content {
    padding: 0 1rem;
  }
  
  .brand-title {
    font-size: 1rem;
  }
  
  .brand-subtitle {
    font-size: 0.75rem;
  }
  
  .status-badge {
    display: none;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .new-order-btn {
    width: 100%;
  }
  
  .modal-dialog {
    max-width: 100%;
    max-height: 95vh;
    margin: 0.5rem;
  }
  
  .toast-notification {
    right: 1rem;
    left: 1rem;
    min-width: unset;
  }
}
</style>


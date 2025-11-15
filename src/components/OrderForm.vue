<template>
  <div class="order-form">
    <!-- Mobile Close Button Header -->
    <div class="mobile-header">
      <h3 class="mobile-title">New Order</h3>
      <button @click="closeForm" class="mobile-close-btn">
        <svg class="close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>

    <div class="order-layout">
      <div class="left-panel">
        <!-- Menu Items Selection -->
        <div class="section">
          <h3 class="section-title">MENU ITEMS</h3>
          <!-- Filters Row -->
          <div class="filters-row">
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
              <select v-model="selectedCategory" class="filter-select" data-testid="category-select">
                <option value="">All</option>
                <option v-for="c in availableCategories" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
          </div>
          
          <!-- Loading State -->
          <div v-if="isLoadingMenuItems" class="loading-container">
            <div class="spinner"></div>
            <p class="loading-text">Loading menu items...</p>
          </div>
          
          <!-- Menu Items Grid -->
          <div v-else class="menu-grid">
            <button
              v-for="item in filteredMenuItems"
              :key="item.id"
              @click="addItemToOrder(item)"
              class="menu-item"
            >
              <div class="item-name">{{ item.name }}</div>
              <div class="item-price">₱{{ item.price }}</div>
              <div class="item-category">{{ item.category }}</div>
            </button>
          </div>
        </div>
      </div>

      <div class="right-panel">
        <!-- Selected Items -->
        <div class="section" v-if="orderItems.length > 0">
          <h3 class="section-title">ORDER ITEMS</h3>
          <div class="order-items-list">
            <div
              v-for="(item, index) in orderItems"
              :key="index"
              class="order-item"
            >
              <div class="item-info">
                <div class="item-name">{{ getMenuItemName(item.menu_id || '') }}</div>
                <div class="item-unit-price">₱{{ getMenuItemPrice(item.menu_id || '') }} each</div>
              </div>
              <div class="item-controls">
                <button
                  @click="decreaseQuantity(index)"
                  class="quantity-btn"
                >
                  −
                </button>
                <span class="quantity-display">{{ item.quantity }}</span>
                <button
                  @click="increaseQuantity(index)"
                  class="quantity-btn"
                >
                  +
                </button>
                <div class="item-subtotal">₱{{ item.subtotal }}</div>
                <button
                  @click="removeItem(index)"
                  class="remove-btn"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="section" v-if="orderItems.length > 0">
          <div class="order-summary">
            <span class="summary-label">TOTAL</span>
            <span class="summary-amount">₱{{ orderTotal }}</span>
          </div>
        </div>

        <!-- Payment Method -->
        <div class="section" v-if="orderItems.length > 0">
          <h3 class="section-title">PAYMENT METHOD</h3>
          <div class="payment-grid">
            <button
              v-for="method in paymentMethods"
              :key="method"
              @click="selectedPaymentMethod = method"
              :class="['payment-btn', { 'payment-btn-active': selectedPaymentMethod === method }]"
            >
              {{ method }}
            </button>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons" v-if="orderItems.length > 0">
          <button @click="clearOrder" class="btn btn-secondary">
            Clear Order
          </button>
          <button
            @click="submitOrder"
            :disabled="!selectedPaymentMethod || isSubmitting"
            class="btn btn-primary"
          >
            {{ isSubmitting ? 'Processing...' : 'Submit Order' }}
          </button>
        </div>

        <!-- Empty State -->
        <div v-if="orderItems.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
          <p class="empty-text">Select items to start a new order</p>
        </div>
      </div>
    </div>

    <!-- Insufficient Inventory Confirmation Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showInsufficientInventoryModal" class="modal-overlay" @click.self="cancelOrder">
          <div class="modal-container" @click.stop>
            <div class="modal-header">
              <div class="header-content">
                <div class="header-icon warning-mode">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                </div>
                <div>
                  <h2>Insufficient Inventory</h2>
                  <p class="modal-subtitle">Some items are running low</p>
                </div>
              </div>
            </div>
            
            <div class="modal-body">
              <p class="confirmation-message">
                There are insufficient items: <strong>{{ insufficientItemsText }}</strong>
              </p>
              <p class="confirmation-question">Do you want to continue regardless?</p>
            </div>

            <div class="modal-footer">
              <button @click="cancelOrder" class="btn btn-secondary">
                Cancel
              </button>
              <button @click="continueOrder" class="btn btn-primary" :disabled="isSubmitting">
                {{ isSubmitting ? 'Processing...' : 'Continue' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { MenuItem, OrderItem, PaymentMethod } from '../models'
import { createOrderItem, calculateOrderTotal } from '../modules/orders/orderUtils'
import { OrderService } from '../services/orderService'
import { menuItemService } from '../services/menuItemService'
import { deductInventoryForOrder } from '../modules/orders/inventoryDeduction'

// Props
const emit = defineEmits<{
  orderSubmitted: []
  close: []
}>()

// State
const menuItems = ref<MenuItem[]>([])
const orderItems = ref<OrderItem[]>([])
const selectedPaymentMethod = ref<PaymentMethod | null>(null)
const isSubmitting = ref(false)
const isLoadingMenuItems = ref(false)
const showInsufficientInventoryModal = ref(false)
const insufficientItemsList = ref<Array<{
  ingredientId: string
  ingredientName: string
  required: number
  available: number
}>>([])
const pendingOrderData = ref<{
  total_amount: number
  payment_method: PaymentMethod
  status: 'pending'
} | null>(null)
const pendingOrderItems = ref<OrderItem[]>([])

const paymentMethods: PaymentMethod[] = ['cash', 'gcash', 'maya', 'gotyme', 'bpi', 'other']

// Computed
const orderTotal = computed(() => calculateOrderTotal(orderItems.value))
const searchQuery = ref('')
const selectedCategory = ref('')
const availableCategories = computed(() => {
  const set = new Set(menuItems.value.map(i => i.category).filter(Boolean))
  return Array.from(set).sort()
})
const filteredMenuItems = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  const category = selectedCategory.value
  return menuItems.value.filter(i => {
    const matchesQuery = q ? i.name.toLowerCase().includes(q) : true
    const matchesCategory = category ? i.category === category : true
    return matchesQuery && matchesCategory
  })
})
const insufficientItemsText = computed(() => {
  return insufficientItemsList.value.map(item => item.ingredientName).join(', ')
})

// Methods
const getMenuItemName = (itemId: string): string => {
  const item = menuItems.value.find(i => i.id === itemId)
  return item?.name || 'Unknown Item'
}

const getMenuItemPrice = (itemId: string): number => {
  const item = menuItems.value.find(i => i.id === itemId)
  return item?.price || 0
}

// Close form handler for mobile
const closeForm = () => {
  emit('close')
}

const addItemToOrder = (menuItem: MenuItem) => {
  const existingItemIndex = orderItems.value.findIndex(item => item.menu_id === menuItem.id)
  
  if (existingItemIndex >= 0) {
    // Increase quantity of existing item
    increaseQuantity(existingItemIndex)
  } else {
    // Add new item to order
    const newOrderItem = createOrderItem(
      'temp-order-id', // Will be replaced when order is created
      menuItem,
      1,
      'system'
    )
    orderItems.value.push(newOrderItem)
  }
}

const increaseQuantity = (index: number) => {
  const item = orderItems.value[index]
  if (!item) return
  
  const menuItem = menuItems.value.find(m => m.id === item.menu_id)
  
  if (menuItem) {
    item.quantity += 1
    item.subtotal = menuItem.price * item.quantity
  }
}

const decreaseQuantity = (index: number) => {
  const item = orderItems.value[index]
  if (!item) return
  
  const menuItem = menuItems.value.find(m => m.id === item.menu_id)
  
  if (menuItem && item.quantity > 1) {
    item.quantity -= 1
    item.subtotal = menuItem.price * item.quantity
  } else {
    removeItem(index)
  }
}

const removeItem = (index: number) => {
  orderItems.value.splice(index, 1)
}

const clearOrder = () => {
  orderItems.value = []
  selectedPaymentMethod.value = null
}

const submitOrder = async () => {
  if (!selectedPaymentMethod.value || orderItems.value.length === 0) {
    return
  }

  isSubmitting.value = true

  try {
    // Prepare order data
    const orderData = {
      total_amount: orderTotal.value,
      payment_method: selectedPaymentMethod.value,
      status: 'pending' as const
    }

    // Check inventory availability and create order
    const result = await OrderService.createOrderWithInventoryCheck(orderData, orderItems.value)

    if (!result.order) {
      // Inventory not available - show confirmation modal
      insufficientItemsList.value = result.inventoryCheck.insufficientItems
      pendingOrderData.value = orderData
      pendingOrderItems.value = [...orderItems.value]
      showInsufficientInventoryModal.value = true
      isSubmitting.value = false
      return
    }

    // Create order items using batch operation for better performance
    const orderItemsData = orderItems.value.map(item => ({
      menu_id: item.menu_id || '',
      quantity: item.quantity,
      subtotal: item.subtotal
    }))

    await OrderService.createOrderItemsBatch(result.order.id, orderItemsData)

    if (result.order.status === 'pending') {
      // Deduct inventory when order moves to preparing
      await deductInventoryForOrder(orderItems.value)
    }

    // Clear the form
    clearOrder()
    
    // Emit event to parent
    emit('orderSubmitted')

  } catch (error) {
    console.error('Error submitting order:', error)
    alert('Failed to submit order. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}

const continueOrder = async () => {
  if (!pendingOrderData.value || pendingOrderItems.value.length === 0) {
    cancelOrder()
    return
  }

  isSubmitting.value = true

  try {
    // Create order directly without inventory check
    const order = await OrderService.createOrder(pendingOrderData.value)

    // Create order items using batch operation
    const orderItemsData = pendingOrderItems.value.map(item => ({
      menu_id: item.menu_id || '',
      quantity: item.quantity,
      subtotal: item.subtotal
    }))

    await OrderService.createOrderItemsBatch(order.id, orderItemsData)

    if (order.status === 'pending') {
      // Deduct inventory when order moves to preparing
      await deductInventoryForOrder(pendingOrderItems.value)
    }

    // Close modal and clear the form
    showInsufficientInventoryModal.value = false
    clearOrder()
    
    // Emit event to parent
    emit('orderSubmitted')

  } catch (error) {
    console.error('Error continuing order:', error)
    alert('Failed to submit order. Please try again.')
  } finally {
    isSubmitting.value = false
    pendingOrderData.value = null
    pendingOrderItems.value = []
    insufficientItemsList.value = []
  }
}

const cancelOrder = () => {
  showInsufficientInventoryModal.value = false
  pendingOrderData.value = null
  pendingOrderItems.value = []
  insufficientItemsList.value = []
  isSubmitting.value = false
}

// Load menu items on mount
onMounted(async () => {
  isLoadingMenuItems.value = true
  try {
    menuItems.value = await menuItemService.getMenuItems()
  } catch (error) {
    console.error('Error loading menu items:', error)
    alert('Failed to load menu items. Please refresh the page.')
  } finally {
    isLoadingMenuItems.value = false
  }
})
</script>

<style scoped>
.order-form {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  max-width: 900px;
  margin: 0 auto;
  min-height: 100%;
  max-height: calc(100vh - 8rem);
  overflow-y: auto;
  overflow-x: hidden;
}

/* Two-column layout */
.order-layout {
  display: grid;
  grid-template-columns: 450px 450px;
  gap: 1rem;
}

.left-panel,
.right-panel {
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* Custom scrollbar for order form */
.order-form::-webkit-scrollbar {
  width: 8px;
}

.order-form::-webkit-scrollbar-track {
  background: #f8f9fa;
  border-radius: 4px;
}

.order-form::-webkit-scrollbar-thumb {
  background: #dee2e6;
  border-radius: 4px;
}

.order-form::-webkit-scrollbar-thumb:hover {
  background: #adb5bd;
}

.section {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: #86868b;
  letter-spacing: 0.5px;
  margin: 0 0 1rem 0;
  text-transform: uppercase;
}

/* Mobile Header - Hidden on Desktop */
.mobile-header {
  display: none;
}

/* Search */
.filters-row {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.search-container {
  margin-bottom: 0.75rem;
  flex: 0.75rem;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  pointer-events: none;
}

.search-input {
  width: 75%;
  padding: 0.625rem 0.75rem 0.625rem 2.5rem;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  font-size: 0.875rem;
  outline: none;
  background: #ffffff;
}

.search-input:focus {
  border-color: #d2d2d7;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 180px;
  flex-shrink: 0;
}

.filter-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  letter-spacing: 0.5px;
}

.filter-select {
  padding: 0.625rem 0.75rem;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  font-size: 0.875rem;
  background: #ffffff;
  width: 100%;
  box-sizing: border-box;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  background: #f8f9fa;
  min-height: 200px;
}

.spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid #f5f5f7;
  border-top-color: #1d1d1f;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 0.875rem;
  color: #86868b;
  margin: 0;
  font-weight: 500;
}

/* Menu Items Grid */
.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.75rem;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

/* Custom scrollbar for menu grid */
.menu-grid::-webkit-scrollbar {
  width: 6px;
}

.menu-grid::-webkit-scrollbar-track {
  background: #f5f5f7;
  border-radius: 3px;
}

.menu-grid::-webkit-scrollbar-thumb {
  background: #d2d2d7;
  border-radius: 3px;
}

.menu-grid::-webkit-scrollbar-thumb:hover {
  background: #86868b;
}

.menu-item {
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  padding: 1rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease;
}

.menu-item:hover {
  background: #f5f5f7;
  border-color: #d2d2d7;
}

.menu-item .item-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 0.375rem;
}

.menu-item .item-price {
  font-size: 0.8125rem;
  font-weight: 500;
  color: #1d1d1f;
  margin-bottom: 0.25rem;
}

.menu-item .item-category {
  font-size: 0.6875rem;
  color: #86868b;
  text-transform: capitalize;
  letter-spacing: 0.3px;
}

/* Order Items List */
.order-items-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 150px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

/* Custom scrollbar for order items */
.order-items-list::-webkit-scrollbar {
  width: 6px;
}

.order-items-list::-webkit-scrollbar-track {
  background: #f5f5f7;
  border-radius: 3px;
}

.order-items-list::-webkit-scrollbar-thumb {
  background: #d2d2d7;
  border-radius: 3px;
}

.order-items-list::-webkit-scrollbar-thumb:hover {
  background: #86868b;
}

.order-item {
  background: #f5f5f7;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  padding: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.item-info {
  flex: 1;
}

.order-item .item-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 0.125rem;
}

.item-unit-price {
  font-size: 0.75rem;
  color: #86868b;
}

.item-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.quantity-btn {
  width: 2rem;
  height: 2rem;
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  color: #1d1d1f;
  transition: all 0.15s ease;
}

.quantity-btn:hover {
  background: #e5e5e5;
  border-color: #d2d2d7;
}

.quantity-display {
  width: 2rem;
  text-align: center;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1d1d1f;
  font-variant-numeric: tabular-nums;
}

.item-subtotal {
  min-width: 4rem;
  text-align: right;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1d1d1f;
}

.remove-btn {
  width: 2rem;
  height: 2rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  color: #86868b;
  transition: color 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover {
  color: #ff3b30;
}

/* Order Summary */
.order-summary {
  background: #f5f5f7;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  padding: 1rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #86868b;
  letter-spacing: 0.5px;
}

.summary-amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1d1d1f;
  font-variant-numeric: tabular-nums;
}

/* Payment Methods */
.payment-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.payment-btn {
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  padding: 0.75rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #1d1d1f;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: center;
}

.payment-btn:hover {
  background: #f5f5f7;
  border-color: #d2d2d7;
}

.payment-btn-active {
  background: #1d1d1f;
  border-color: #1d1d1f;
  color: #ffffff;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.btn {
  flex: 1;
  padding: 0.875rem 1.5rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  letter-spacing: 0.3px;
}

.btn-secondary {
  background: #ffffff;
  border: 1px solid #e5e5e5;
  color: #1d1d1f;
}

.btn-secondary:hover {
  background: #f5f5f7;
  border-color: #d2d2d7;
}

.btn-primary {
  background: #1d1d1f;
  border: 1px solid #1d1d1f;
  color: #ffffff;
}

.btn-primary:hover {
  background: #2c2c2e;
  border-color: #2c2c2e;
}

.btn-primary:disabled {
  background: #86868b;
  border-color: #86868b;
  cursor: not-allowed;
  opacity: 0.6;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.empty-icon .icon {
  width: 4rem;
  height: 4rem;
  color: #d2d2d7;
  stroke-width: 1;
}

.empty-text {
  font-size: 0.875rem;
  color: #86868b;
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .filters-row {
    max-width: 46vh;
  }

  .order-form {
    padding: 0;
    border-radius: 0;
    max-height: none;
    overflow-y: visible;
    background: #ffffff;
    box-sizing: border-box;
  }

  /* Mobile Header - Show on Mobile */
  .mobile-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: #fafafa;
    border-bottom: 1px solid #e5e5e5;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .mobile-title {
    font-size: 1rem;
    font-weight: 600;
    color: #1d1d1f;
    margin: 0;
    letter-spacing: 0.3px;
  }

  .mobile-close-btn {
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

  .mobile-close-btn:hover {
    color: #1d1d1f;
  }

  .mobile-close-btn .close-icon {
    width: 1.25rem;
    height: 1.25rem;
    stroke-width: 2;
  }

  .order-layout {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 0.75rem;
  }
  
  .section {
    margin-bottom: 1rem;
  }
  
  /* Hide category filter on mobile */
  .filter-group {
    display: none;
  }

  .search-icon {
    display: none;
  }

  .action-buttons {
    max-width: 40vh;
  }

  .payment-grid {
    max-width: 40vh;
  }
  
  /* Make search input full width on mobile */
  .search-container {
    flex: 1;
    margin-bottom: 0.5rem;
    max-width: 30vh;
  }
  
  .search-input {
    width: 100%;
  }
  
  /* Convert menu grid to list layout */
  .menu-grid {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-height: 250px;
  }
  
  /* Style menu items as horizontal list items */
  .menu-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
  }
  
  .menu-item .item-name {
    font-size: 0.875rem;
    margin-bottom: 0;
    flex: 1;
  }
  
  .menu-item .item-price {
    font-size: 0.875rem;
    margin-bottom: 0;
    margin-left: 1rem;
    font-weight: 600;
  }
  
  /* Hide category on mobile for compact view */
  .menu-item .item-category {
    display: none;
  }
  
  .order-items-list {
    max-height: 120px;
  }
  
  .payment-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .action-buttons {
    flex-direction: column;
    margin-top: 1rem;
  }

  .order-summary {
    max-width: 37vh;
  }

  .order-item {
    max-width: 38vh;
  }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 500px;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.header-content {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  width: 100%;
}

.header-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.header-icon.warning-mode {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.3;
}

.modal-subtitle {
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 400;
}

.modal-body {
  padding: 2rem;
}

.confirmation-message {
  font-size: 0.95rem;
  color: #374151;
  line-height: 1.6;
  margin: 0 0 1rem 0;
}

.confirmation-message strong {
  color: #111827;
  font-weight: 600;
}

.confirmation-question {
  font-size: 0.95rem;
  color: #374151;
  line-height: 1.6;
  margin: 0;
  font-weight: 500;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem 2rem 2rem 2rem;
  border-top: 1px solid #e5e7eb;
}

.modal-footer .btn {
  flex: 0 0 auto;
  min-width: 100px;
}

/* Modal Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .modal-container {
    margin: 0;
    border-radius: 16px;
  }

  .modal-header {
    padding: 1.5rem;
  }

  .modal-header h2 {
    font-size: 1.25rem;
  }

  .header-icon {
    width: 40px;
    height: 40px;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .modal-footer {
    flex-direction: column-reverse;
    padding: 1.5rem;
  }

  .modal-footer .btn {
    width: 100%;
  }
}
</style>

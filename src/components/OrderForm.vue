<template>
  <div class="order-form">
    <!-- Menu Items Selection -->
    <div class="section">
      <h3 class="section-title">MENU ITEMS</h3>
      
      <!-- Loading State -->
      <div v-if="isLoadingMenuItems" class="loading-container">
        <div class="spinner"></div>
        <p class="loading-text">Loading menu items...</p>
      </div>
      
      <!-- Menu Items Grid -->
      <div v-else class="menu-grid">
        <button
          v-for="item in menuItems"
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
            <div class="item-name">{{ getMenuItemName(item.item_id) }}</div>
            <div class="item-unit-price">₱{{ getMenuItemPrice(item.item_id) }} each</div>
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { MenuItem, OrderItem, PaymentMethod } from '../models'
import { createOrderItem, calculateOrderTotal } from '../modules/orders/orderUtils'
import { OrderService } from '../services/orderService'
import { menuItemService } from '../services/menuItemService'

// Props
const emit = defineEmits<{
  orderSubmitted: []
}>()

// State
const menuItems = ref<MenuItem[]>([])
const orderItems = ref<OrderItem[]>([])
const selectedPaymentMethod = ref<PaymentMethod | null>(null)
const isSubmitting = ref(false)
const isLoadingMenuItems = ref(false)

const paymentMethods: PaymentMethod[] = ['Cash', 'GCash', 'Card', 'Other']

// Computed
const orderTotal = computed(() => calculateOrderTotal(orderItems.value))

// Methods
const getMenuItemName = (itemId: string): string => {
  const item = menuItems.value.find(i => i.id === itemId)
  return item?.name || 'Unknown Item'
}

const getMenuItemPrice = (itemId: string): number => {
  const item = menuItems.value.find(i => i.id === itemId)
  return item?.price || 0
}

const addItemToOrder = (menuItem: MenuItem) => {
  const existingItemIndex = orderItems.value.findIndex(item => item.item_id === menuItem.id)
  
  if (existingItemIndex >= 0) {
    // Increase quantity of existing item
    increaseQuantity(existingItemIndex)
  } else {
    // Add new item to order
    const newOrderItem = createOrderItem(
      'temp-order-id', // Will be replaced when order is created
      menuItem,
      1
    )
    orderItems.value.push(newOrderItem)
  }
}

const increaseQuantity = (index: number) => {
  const item = orderItems.value[index]
  if (!item) return
  
  const menuItem = menuItems.value.find(m => m.id === item.item_id)
  
  if (menuItem) {
    item.quantity += 1
    item.subtotal = menuItem.price * item.quantity
  }
}

const decreaseQuantity = (index: number) => {
  const item = orderItems.value[index]
  if (!item) return
  
  const menuItem = menuItems.value.find(m => m.id === item.item_id)
  
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
    // Create the order
    const orderData = {
      datetime: new Date().toISOString(),
      total_amount: orderTotal.value,
      payment_method: selectedPaymentMethod.value,
      status: 'Pending' as const
    }

    const newOrder = await OrderService.createOrder(orderData)

    // Create order items
    const orderItemsData = orderItems.value.map(item => ({
      order_id: newOrder.id,
      item_id: item.item_id,
      quantity: item.quantity,
      subtotal: item.subtotal
    }))

    await OrderService.createOrderItems(orderItemsData)

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
  min-height: 100%;
  max-height: calc(100vh - 8rem);
  overflow-y: auto;
  overflow-x: hidden;
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
  max-height: 200px;
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
  grid-template-columns: repeat(4, 1fr);
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
  .menu-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
  
  .payment-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>

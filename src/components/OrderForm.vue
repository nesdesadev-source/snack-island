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
            <div class="order-item-first-row">
              <div class="item-info">
                <div class="item-name">{{ getMenuItemName(item.menu_id || '') }}{{ formatVariations(item) }}</div>
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
              </div>
              
            </div>
            <div class="order-item-second-row">
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

        <!-- Payment Input -->
        <div class="section" v-if="orderItems.length > 0">
          <div class="payment-row">
            <div class="payment-input-container">
              <label class="payment-label">Customer Payment</label>
              <input
                type="number"
                v-model.number="customerPayment"
                class="payment-input"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            <div class="change-display" v-if="customerPayment > 0">
              <span class="change-label">CHANGE</span>
              <span class="change-amount" :class="{ 'negative': change < 0 }">
                ₱{{ change.toFixed(2) }}
              </span>
            </div>
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

    <!-- Variation Selection Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showVariationModal" class="variation-modal-overlay" @click.self="cancelVariationSelection">
          <div class="variation-modal-container" @click.stop>
            <div class="variation-modal-header">
              <button class="variation-modal-close" @click="cancelVariationSelection" aria-label="Close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              <div class="variation-modal-title-section">
                <div class="variation-modal-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                    <path d="M2 17l10 5 10-5"></path>
                    <path d="M2 12l10 5 10-5"></path>
                  </svg>
                </div>
                <div>
                  <h2 class="variation-modal-title">{{ pendingMenuItem?.name }}</h2>
                  <p class="variation-modal-subtitle">Customize your order</p>
                </div>
              </div>
            </div>
            
            <div class="variation-modal-body">
              <!-- Fries Option -->
              <div v-if="pendingMenuItem?.has_fries" class="variation-option-card">
                <div class="variation-option-header">
                  <div class="variation-option-icon fries">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="8" y1="6" x2="8" y2="18"></line>
                      <line x1="12" y1="6" x2="12" y2="18"></line>
                      <line x1="16" y1="6" x2="16" y2="18"></line>
                      <path d="M6 6h12M6 18h12"></path>
                    </svg>
                  </div>
                  <label class="variation-option-label">Fries Option</label>
                </div>
                <div class="variation-option-buttons">
                  <button
                    v-for="option in [{ value: 'cheese', label: 'Cheese' }, { value: 'sour_cream', label: 'Sour Cream' }, { value: 'bbq', label: 'BBQ' }]"
                    :key="option.value"
                    type="button"
                    @click="selectedFriesOption = option.value as any"
                    :class="['variation-option-btn', { 'active': selectedFriesOption === option.value }]"
                  >
                    {{ option.label }}
                  </button>
                </div>
              </div>

              <!-- Spicy Option -->
              <div v-if="pendingMenuItem?.has_spicy" class="variation-option-card">
                <div class="variation-option-header">
                  <div class="variation-option-icon spicy">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
                    </svg>
                  </div>
                  <label class="variation-option-label">Spicy Level</label>
                </div>
                <div class="variation-option-buttons">
                  <button
                    type="button"
                    @click="selectedSpicy = false"
                    :class="['variation-option-btn', { 'active': !selectedSpicy }]"
                  >
                    Regular
                  </button>
                  <button
                    type="button"
                    @click="selectedSpicy = true"
                    :class="['variation-option-btn', { 'active': selectedSpicy }]"
                  >
                    Spicy
                  </button>
                </div>
              </div>

              <!-- Drink Option -->
              <div v-if="pendingMenuItem?.has_drink" class="variation-option-card">
                <div class="variation-option-header">
                  <div class="variation-option-icon drink">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M5 4h14v16H5z"></path>
                      <line x1="5" y1="8" x2="19" y2="8"></line>
                      <line x1="9" y1="4" x2="9" y2="8"></line>
                      <line x1="15" y1="4" x2="15" y2="8"></line>
                    </svg>
                  </div>
                  <label class="variation-option-label">Drink Option</label>
                </div>
                <div class="variation-option-buttons">
                  <button
                    v-for="option in [{ value: 'cucumber', label: 'Cucumber' }, { value: 'iced_tea', label: 'Iced Tea' }]"
                    :key="option.value"
                    type="button"
                    @click="selectedDrinkOption = option.value as any"
                    :class="['variation-option-btn', { 'active': selectedDrinkOption === option.value }]"
                  >
                    {{ option.label }}
                  </button>
                </div>
              </div>
            </div>

            <div class="variation-modal-footer">
              <button @click="cancelVariationSelection" class="variation-btn variation-btn-secondary">
                Cancel
              </button>
              <button 
                @click="confirmVariationSelection" 
                class="variation-btn variation-btn-primary"
                :disabled="(pendingMenuItem?.has_fries && !selectedFriesOption) || (pendingMenuItem?.has_drink && !selectedDrinkOption)"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Add to Order
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
import type { MenuItem, OrderItem, PaymentMethod, FriesOption, DrinkOption } from '../models'
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
const customerPayment = ref<number>(0)
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

// Variation modal state
const showVariationModal = ref(false)
const pendingMenuItem = ref<MenuItem | null>(null)
const selectedFriesOption = ref<FriesOption | null>(null)
const selectedSpicy = ref<boolean>(false)
const selectedDrinkOption = ref<DrinkOption | null>(null)

const paymentMethods: PaymentMethod[] = ['cash', 'gcash']

// Computed
const orderTotal = computed(() => calculateOrderTotal(orderItems.value))
const change = computed(() => {
  if (customerPayment.value <= 0) return 0
  return customerPayment.value - orderTotal.value
})
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
    return matchesQuery && matchesCategory && i.is_active
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
  // Check if menu item has variations
  if (menuItem.has_fries || menuItem.has_spicy || menuItem.has_drink) {
    // Show variation modal
    pendingMenuItem.value = menuItem
    selectedFriesOption.value = null
    selectedSpicy.value = false
    selectedDrinkOption.value = null
    showVariationModal.value = true
  } else {
    // For items without variations, check if exact same item exists
    const existingItemIndex = orderItems.value.findIndex(item => 
      item.menu_id === menuItem.id &&
      !item.fries_option &&
      !item.is_spicy &&
      !item.drink_option
    )
    
    if (existingItemIndex >= 0) {
      // Increase quantity of existing item
      increaseQuantity(existingItemIndex)
    } else {
      // Add new item to order directly (no variations)
      const newOrderItem = createOrderItem(
        'temp-order-id', // Will be replaced when order is created
        menuItem,
        1,
        'system'
      )
      orderItems.value.push(newOrderItem)
    }
  }
}

const confirmVariationSelection = () => {
  if (!pendingMenuItem.value) return
  
  // Check if exact same item with same variations already exists
  const existingItemIndex = orderItems.value.findIndex(item => 
    item.menu_id === pendingMenuItem.value?.id &&
    item.fries_option === (selectedFriesOption.value || undefined) &&
    item.is_spicy === (selectedSpicy.value || undefined) &&
    item.drink_option === (selectedDrinkOption.value || undefined)
  )
  
  if (existingItemIndex >= 0) {
    // Increase quantity of existing item with same variations
    increaseQuantity(existingItemIndex)
  } else {
    // Add new item with variations
    const newOrderItem = createOrderItem(
      'temp-order-id',
      pendingMenuItem.value,
      1,
      'system',
      selectedFriesOption.value || undefined,
      selectedSpicy.value || undefined,
      selectedDrinkOption.value || undefined
    )
    orderItems.value.push(newOrderItem)
  }
  
  // Close modal and reset
  showVariationModal.value = false
  pendingMenuItem.value = null
  selectedFriesOption.value = null
  selectedSpicy.value = false
  selectedDrinkOption.value = null
}

const cancelVariationSelection = () => {
  showVariationModal.value = false
  pendingMenuItem.value = null
  selectedFriesOption.value = null
  selectedSpicy.value = false
  selectedDrinkOption.value = null
}

const formatVariations = (item: OrderItem): string => {
  const parts: string[] = []
  
  if (item.fries_option) {
    const friesLabel = item.fries_option === 'sour_cream' ? 'Sour Cream' : 
                      item.fries_option === 'bbq' ? 'BBQ' : 
                      'Cheese'
    parts.push(`Fries: ${friesLabel}`)
  }
  
  if (item.is_spicy) {
    parts.push('Spicy: Yes')
  }
  
  if (item.drink_option) {
    const drinkLabel = item.drink_option === 'cucumber' ? 'Cucumber' : 'Iced Tea'
    parts.push(`Drink: ${drinkLabel}`)
  }
  
  return parts.length > 0 ? ` (${parts.join(', ')})` : ''
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
  customerPayment.value = 0
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
      subtotal: item.subtotal,
      fries_option: item.fries_option,
      is_spicy: item.is_spicy,
      drink_option: item.drink_option
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
      subtotal: item.subtotal,
      fries_option: item.fries_option,
      is_spicy: item.is_spicy,
      drink_option: item.drink_option
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
  align-items: end;
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
  text-align: center;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1d1d1f;
  ;
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

.order-item-first-row {
  display: flex; 
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  gap: 0.5rem;
  width: 70%
}

.order-item-second-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  width: 30%;
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

/* Payment Input */
.payment-row {
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
}

.payment-input-container {
  flex: 1;
}

.payment-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #86868b;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
}

.payment-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  color: #1d1d1f;
  background: #ffffff;
  outline: none;
  box-sizing: border-box;
  font-variant-numeric: tabular-nums;
}

.payment-input:focus {
  border-color: #1d1d1f;
}

.payment-input::placeholder {
  color: #86868b;
  font-weight: 400;
}

/* Change Display */
.change-display {
  background: #f5f5f7;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  min-width: 150px;
}

.change-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #86868b;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
}

.change-amount {
  font-size: 1.25rem;
  font-weight: 700;
  color: #34c759;
  font-variant-numeric: tabular-nums;
}

.change-amount.negative {
  color: #ff3b30;
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
  .order-form {
    padding: 0;
    border-radius: 0;
    max-height: none;
    overflow-y: visible;
    overflow-x: hidden;
    background: #ffffff;
    box-sizing: border-box;
    width: 100%;
  }

  .left-panel,
  .right-panel {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }

  .item-subtotal {
    background: white;
    border: 1px solid #e5e5e5;
    border-radius: 6px;
    padding: 0.5rem;
  }

  .section {
    width: 100%;
    max-width: 100%;
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
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
  
  /* Hide category filter on mobile */
  .filter-group {
    display: none;
  }

  .search-icon {
    display: none;
  }
  
  /* Make search input full width on mobile */
  .search-container {
    flex: 1;
    margin-bottom: 0.5rem;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
  
  .search-input {
    width: 100%;
    box-sizing: border-box;
  }

  .filters-row {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
  
  /* Convert menu grid to list layout */
  .menu-grid {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-height: 250px;
    width: 100%;
    box-sizing: border-box;
  }
  
  /* Style menu items as horizontal list items */
  .menu-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    width: 100%;
    box-sizing: border-box;
  }
  
  .menu-item .item-name {
    font-size: 0.875rem;
    margin-bottom: 0;
    flex: 1;
  }
  
  .order-item {
    display: block !important;
  }

  .order-item-first-row {
    width: 100% !important;
  }

  .order-item-second-row {
    width: 100% !important;
  }

  .item-subtotal {
    width: 90% !important;
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
    width: 100%;
    box-sizing: border-box;
  }
  
  .payment-grid {
    grid-template-columns: repeat(2, 1fr);
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
  
  .action-buttons {
    flex-direction: column;
    margin-top: 1rem;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }

  .order-summary {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }

  .payment-row {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    flex-direction: row;
    gap: 0.5rem;
  }

  .payment-input-container {
    flex: 1;
    min-width: 0;
  }

  .payment-input {
    width: 100%;
    box-sizing: border-box;
  }

  .change-display {
    min-width: 120px;
    flex-shrink: 0;
    padding: 0.75rem 1rem;
  }

  .change-amount {
    font-size: 1rem;
  }

  .order-item {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    flex-wrap: wrap;
    align-items: center;
    position: relative;
    padding: 0.75rem 2.5rem 0.75rem 0.75rem;
    gap: 0.5rem;
  }

  .item-info {
    flex: 1 1 auto;
    min-width: 0;
    margin-bottom: 0;
  }

  .order-item .item-name {
    font-size: 0.8125rem;
    margin-bottom: 0.125rem;
  }

  .item-unit-price {
    font-size: 0.6875rem;
  }

  .item-controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    flex: 0 0 auto;
  }

  /* Quantity buttons stay in a row */
  .item-controls .quantity-btn {
    flex: 0 0 auto;
    width: 1.75rem;
    height: 1.75rem;
  }

  .item-controls .quantity-display {
    flex: 0 0 auto;
    min-width: 2rem;
    font-size: 0.8125rem;
  }

  /* Force subtotal to new line and span full width */
  .item-controls .item-subtotal {
    flex: 1 1 100%;
    width: 100%;
    text-align: center;
    font-size: 1.125rem;
    font-weight: 700;
    padding: 0.5rem;
    background: #ffffff;
    border-radius: 4px;
    margin-top: 0.25rem;
  }

  /* Remove button positioned absolutely in top-right */
  .item-controls .remove-btn {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
  }

  .btn {
    width: 100%;
    box-sizing: border-box;
  }

  .payment-btn {
    width: 100%;
    box-sizing: border-box;
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

.header-icon.add-mode {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

/* Variation Modal Styles */
.variation-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 1rem;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.variation-modal-container {
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.variation-modal-header {
  padding: 1.5rem 1.5rem 1.25rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  position: relative;
}

.variation-modal-close {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.variation-modal-close:hover {
  background: #e5e7eb;
  color: #374151;
  transform: rotate(90deg);
}

.variation-modal-title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.variation-modal-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.variation-modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.25rem 0;
  line-height: 1.2;
}

.variation-modal-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.variation-modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.variation-option-card {
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.2s;
}

.variation-option-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.variation-option-header {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  margin-bottom: 0.75rem;
}

.variation-option-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.variation-option-icon.fries {
  background: #fef3c7;
  color: #d97706;
}

.variation-option-icon.spicy {
  background: #fee2e2;
  color: #dc2626;
}

.variation-option-icon.drink {
  background: #dbeafe;
  color: #2563eb;
}

.variation-option-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.variation-option-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.variation-option-btn {
  flex: 1;
  min-width: 80px;
  padding: 0.625rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  background: white;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.variation-option-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.variation-option-btn:hover::before {
  left: 100%;
}

.variation-option-btn:hover {
  border-color: #d1d5db;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.variation-option-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: white;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
}

.variation-option-btn.active:hover {
  background: linear-gradient(135deg, #5568d3 0%, #6a3d8f 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.variation-modal-footer {
  padding: 1.25rem 1.5rem 1.5rem 1.5rem;
  border-top: 1px solid #f3f4f6;
  display: flex;
  gap: 0.75rem;
}

.variation-btn {
  flex: 1;
  padding: 0.875rem 1.5rem;
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
}

.variation-btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.variation-btn-secondary:hover {
  background: #e5e7eb;
  transform: translateY(-1px);
}

.variation-btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
}

.variation-btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #5568d3 0%, #6a3d8f 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.variation-btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 768px) {
  .variation-modal-container {
    max-width: 100%;
    border-radius: 20px 20px 0 0;
    max-height: 85vh;
  }

  .variation-modal-header {
    padding: 1.5rem 1.5rem 1.25rem 1.5rem;
  }

  .variation-modal-body {
    padding: 1.5rem;
  }

  .variation-modal-footer {
    padding: 1.25rem 1.5rem 1.5rem 1.5rem;
    flex-direction: column-reverse;
  }

  .variation-btn {
    width: 100%;
  }

  .variation-option-buttons {
    flex-direction: column;
  }

  .variation-option-btn {
    width: 100%;
  }
}
</style>

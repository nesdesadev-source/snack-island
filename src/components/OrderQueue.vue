<template>
  <div class="kanban-board">
    <!-- TO DO Row -->
    <div class="kanban-row todo-row">
      <div class="row-header" @click="toggleRow('todo')">
        <div class="row-header-left">
          <h3 class="row-title">TO DO</h3>
          <span class="row-count">{{ getOrdersByStatus('pending').length }}</span>
        </div>
        <button class="collapse-btn" :class="{ collapsed: collapsedRows.todo }">
          <svg class="collapse-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
      </div>
      <div v-show="!collapsedRows.todo" class="row-content">
        <div
          v-for="order in getOrdersByStatus('pending')"
          :key="order.id"
          class="order-card todo-card"
        >
          <div class="card-header">
            <span class="order-id">#{{ order.id.slice(-6) }}</span>
            <span class="order-time-wrap">
              <span class="order-time">{{ formatDateTime(order.created_at || '') }}</span>
              <span v-if="formatTimeElapsed(order.created_at)" :class="['order-time-elapsed', getElapsedTimeClass(order.created_at)]">{{ formatTimeElapsed(order.created_at) }}</span>
            </span>
          </div>
          
          <div class="card-items">
            <div class="items-label">ITEMS</div>
            <div class="items-list">
              <div
                v-for="item in getOrderItems(order.id)"
                :key="item.id"
                class="item-row"
              >
                <div class="item-name-container">
                  <span class="item-name">{{ getMenuItemName(item.menu_id || '') }} ×{{ item.quantity }}</span>
                  <div v-if="item.fries_option || item.is_spicy || item.drink_option" class="item-variations">
                    <span v-if="item.fries_option" :class="['variation-badge', 'fries', `fries-${item.fries_option}`]" :title="`Fries: ${formatFriesOption(item.fries_option)}`">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="8" y1="6" x2="8" y2="18"></line>
                        <line x1="12" y1="6" x2="12" y2="18"></line>
                        <line x1="16" y1="6" x2="16" y2="18"></line>
                        <path d="M6 6h12M6 18h12"></path>
                      </svg>
                    </span>
                    <span v-if="item.is_spicy" class="variation-badge spicy" title="Spicy">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
                      </svg>
                    </span>
                    <span v-if="item.drink_option" :class="['variation-badge', 'drink', `drink-${item.drink_option}`]" :title="`Drink: ${formatDrinkOption(item.drink_option)}`">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M5 4h14v16H5z"></path>
                        <line x1="5" y1="8" x2="19" y2="8"></line>
                        <line x1="9" y1="4" x2="9" y2="8"></line>
                        <line x1="15" y1="4" x2="15" y2="8"></line>
                      </svg>
                    </span>
                  </div>
                </div>
                <span class="item-price">₱{{ item.subtotal }}</span>
              </div>
            </div>
          </div>
          
          <div class="card-payment">
            <span class="payment-label">PAYMENT</span>
            <span class="payment-method">{{ order.payment_method }}</span>
          </div>
          
          <div class="card-total">₱{{ order.total_amount }}</div>
          
          <div class="card-actions">
            <button
              @click="updateOrderStatus(order.id, 'ready' as OrderStatus)"
              class="action-btn action-primary"
            >
              Mark Ready
            </button>
            <button
              @click="updateOrderStatus(order.id, 'cancelled' as OrderStatus)"
              class="action-btn action-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- READY Row -->
    <div class="kanban-row ready-row">
      <div class="row-header" @click="toggleRow('ready')">
        <div class="row-header-left">
          <h3 class="row-title">READY</h3>
          <span class="row-count">{{ getOrdersByStatus('ready').length }}</span>
        </div>
        <button class="collapse-btn" :class="{ collapsed: collapsedRows.ready }">
          <svg class="collapse-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
      </div>
      <div v-show="!collapsedRows.ready" class="row-content">
        <div
          v-for="order in getOrdersByStatus('ready')"
          :key="order.id"
          class="order-card ready-card"
        >
          <div class="card-header">
            <span class="order-id">#{{ order.id.slice(-6) }}</span>
            <span class="order-time-wrap">
              <span class="order-time">{{ formatDateTime(order.created_at || '') }}</span>
              <span v-if="formatTimeElapsed(order.created_at)" :class="['order-time-elapsed', getElapsedTimeClass(order.created_at)]">{{ formatTimeElapsed(order.created_at) }}</span>
            </span>
          </div>
          
          <div class="card-items">
            <div class="items-label">ITEMS</div>
            <div class="items-list">
              <div
                v-for="item in getOrderItems(order.id)"
                :key="item.id"
                class="item-row"
              >
                <div class="item-name-container">
                  <span class="item-name">{{ getMenuItemName(item.menu_id || '') }} ×{{ item.quantity }}</span>
                  <div v-if="item.fries_option || item.is_spicy || item.drink_option" class="item-variations">
                    <span v-if="item.fries_option" :class="['variation-badge', 'fries', `fries-${item.fries_option}`]" :title="`Fries: ${formatFriesOption(item.fries_option)}`">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="8" y1="6" x2="8" y2="18"></line>
                        <line x1="12" y1="6" x2="12" y2="18"></line>
                        <line x1="16" y1="6" x2="16" y2="18"></line>
                        <path d="M6 6h12M6 18h12"></path>
                      </svg>
                    </span>
                    <span v-if="item.is_spicy" class="variation-badge spicy" title="Spicy">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
                      </svg>
                    </span>
                    <span v-if="item.drink_option" :class="['variation-badge', 'drink', `drink-${item.drink_option}`]" :title="`Drink: ${formatDrinkOption(item.drink_option)}`">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M5 4h14v16H5z"></path>
                        <line x1="5" y1="8" x2="19" y2="8"></line>
                        <line x1="9" y1="4" x2="9" y2="8"></line>
                        <line x1="15" y1="4" x2="15" y2="8"></line>
                      </svg>
                    </span>
                  </div>
                </div>
                <span class="item-price">₱{{ item.subtotal }}</span>
              </div>
            </div>
          </div>
          
          <div class="card-payment">
            <span class="payment-label">PAYMENT</span>
            <span class="payment-method">{{ order.payment_method }}</span>
          </div>
          
          <div class="card-total">₱{{ order.total_amount }}</div>
          
          <div class="card-actions">
            <button
              @click="updateOrderStatus(order.id, 'completed' as OrderStatus)"
              class="action-btn action-primary"
            >
              Complete Order
            </button>
            <button
              @click="updateOrderStatus(order.id, 'cancelled' as OrderStatus)"
              class="action-btn action-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- DONE Row -->
    <div class="kanban-row done-row">
      <div class="row-header" @click="toggleRow('done')">
        <div class="row-header-left">
          <h3 class="row-title">DONE</h3>
          <span class="row-count">{{ getOrdersByStatus('completed').length }}</span>
        </div>
        <button class="collapse-btn" :class="{ collapsed: collapsedRows.done }">
          <svg class="collapse-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
      </div>
      <div v-show="!collapsedRows.done" class="row-content">
        <div
          v-for="order in getOrdersByStatus('completed')"
          :key="order.id"
          class="order-card done-card"
        >
          <div class="card-header">
            <span class="order-id">#{{ order.id.slice(-6) }}</span>
            <span class="order-time-wrap">
              <span class="order-time">{{ formatDateTime(order.created_at || '') }}</span>
            </span>
          </div>
          
          <div class="card-items">
            <div class="items-label">ITEMS</div>
            <div class="items-list">
              <div
                v-for="item in getOrderItems(order.id)"
                :key="item.id"
                class="item-row"
              >
                <div class="item-name-container">
                  <span class="item-name">{{ getMenuItemName(item.menu_id || '') }} ×{{ item.quantity }}</span>
                  <div v-if="item.fries_option || item.is_spicy || item.drink_option" class="item-variations">
                    <span v-if="item.fries_option" :class="['variation-badge', 'fries', `fries-${item.fries_option}`]" :title="`Fries: ${formatFriesOption(item.fries_option)}`">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="8" y1="6" x2="8" y2="18"></line>
                        <line x1="12" y1="6" x2="12" y2="18"></line>
                        <line x1="16" y1="6" x2="16" y2="18"></line>
                        <path d="M6 6h12M6 18h12"></path>
                      </svg>
                    </span>
                    <span v-if="item.is_spicy" class="variation-badge spicy" title="Spicy">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
                      </svg>
                    </span>
                    <span v-if="item.drink_option" :class="['variation-badge', 'drink', `drink-${item.drink_option}`]" :title="`Drink: ${formatDrinkOption(item.drink_option)}`">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M5 4h14v16H5z"></path>
                        <line x1="5" y1="8" x2="19" y2="8"></line>
                        <line x1="9" y1="4" x2="9" y2="8"></line>
                        <line x1="15" y1="4" x2="15" y2="8"></line>
                      </svg>
                    </span>
                  </div>
                </div>
                <span class="item-price">₱{{ item.subtotal }}</span>
              </div>
            </div>
          </div>
          
          <div class="card-payment">
            <span class="payment-label">PAYMENT</span>
            <span class="payment-method">{{ order.payment_method }}</span>
          </div>
          
          <div class="card-total">₱{{ order.total_amount }}</div>
          
          <div class="card-actions">
            <span class="completed-badge">COMPLETED</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import type { Order, OrderItem, OrderStatus } from '../models'
import { OrderService } from '../services/orderService'
import { menuItemService } from '../services/menuItemService'
import { sortOrdersForQueue } from '../utils/orderQueueSort'

// Props
const emit = defineEmits<{
  orderUpdated: []
}>()

// State
const orders = ref<Order[]>([])
const orderItems = ref<OrderItem[]>([])
const menuItems = ref<any[]>([])
const isLoading = ref(false)
const collapsedRows = ref({
  todo: false,
  ready: false,
  done: false
})

// Methods
const toggleRow = (row: 'todo' | 'ready' | 'done') => {
  collapsedRows.value[row] = !collapsedRows.value[row]
}

const formatDateTime = (dateTime: string): string => {
  const date = new Date(dateTime)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

const formatTimeElapsed = (dateTime: string | null): string => {
  if (!dateTime) return ''
  const then = new Date(dateTime).getTime()
  const now = Date.now()
  const diffMs = now - then
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return '< 1m ago'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

const getElapsedMinutes = (dateTime: string | null): number | null => {
  if (!dateTime) return null
  const then = new Date(dateTime).getTime()
  const now = Date.now()
  return Math.floor((now - then) / 60000)
}

const getElapsedTimeClass = (dateTime: string | null): string => {
  const m = getElapsedMinutes(dateTime) ?? 0
  if (m > 20) return 'order-time-elapsed-over-20'
  if (m >= 10) return 'order-time-elapsed-10-20'
  return ''
}

const getOrderItems = (orderId: string): OrderItem[] => {
  return orderItems.value.filter(item => item.order_id === orderId)
}

const getMenuItemName = (itemId: string): string => {
  const item = menuItems.value.find(i => i.id === itemId)
  return item?.name || 'Unknown Item'
}

const formatFriesOption = (option: string): string => {
  const options: Record<string, string> = {
    'plain': 'Plain',
    'cheese': 'Cheese',
    'sour_cream': 'Sour Cream',
    'bbq': 'BBQ'
  }
  return options[option] || option
}

const formatDrinkOption = (option: string): string => {
  const options: Record<string, string> = {
    'cucumber': 'Cucumber',
    'iced_tea': 'Iced Tea'
  }
  return options[option] || option
}

const isToday = (dateString: string | null): boolean => {
  if (!dateString) return false
  
  const orderDate = new Date(dateString)
  const today = new Date()
  
  return (
    orderDate.getDate() === today.getDate() &&
    orderDate.getMonth() === today.getMonth() &&
    orderDate.getFullYear() === today.getFullYear()
  )
}

const getOrdersByStatus = (status: OrderStatus): Order[] => {
  let filtered = orders.value.filter(order => order.status === status as OrderStatus)

  if (status === 'completed') {
    filtered = filtered.filter(order => isToday(order.created_at))
  }

  return sortOrdersForQueue(filtered, status)
}

const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
  try {
    await OrderService.updateOrderStatus(orderId, newStatus as OrderStatus)
    
    // Update local state
    const orderIndex = orders.value.findIndex(order => order.id === orderId)
    if (orderIndex >= 0 && orders.value[orderIndex]) {
      orders.value[orderIndex].status = newStatus as OrderStatus
    }
    
    // Update collapsed rows after status change
    updateCollapsedRows()
    if (newStatus === 'ready') {
      collapsedRows.value.ready = false;
    }
    
    emit('orderUpdated')
  } catch (error) {
    console.error('Error updating order status:', error)
    alert('Failed to update order status. Please try again.')
  }
}

const loadOrders = async () => {
  isLoading.value = true
  try {
    const today = new Date()
    const startOfToday = new Date(today)
    startOfToday.setHours(0, 0, 0, 0)
    const endOfToday = new Date(today)
    endOfToday.setHours(23, 59, 59, 999)
    orders.value = await OrderService.getOrders({ startDate: startOfToday, endDate: endOfToday })
    updateCollapsedRows()
  } catch (error) {
    console.error('Error loading orders:', error)
    alert('Failed to load orders. Please refresh the page.')
  } finally {
    isLoading.value = false
  }
}

const loadOrderItems = async () => {
  try {
    // Split orders into priority (non-completed) and secondary (completed) batches
    const priorityOrders = orders.value.filter(order => order.status !== 'completed')
    const secondaryOrders = orders.value.filter(order => order.status === 'completed')
    
    // Initialize with empty array so UI can start showing items incrementally
    orderItems.value = []
    
    // Load priority batch and update UI incrementally as each order loads
    for (const order of priorityOrders) {
      const items = await OrderService.getOrderItems(order.id)
      // Append items immediately so UI updates progressively
      orderItems.value = [...orderItems.value, ...items]
    }
    
    // Load secondary batch in the background
    if (secondaryOrders.length > 0) {
      for (const order of secondaryOrders) {
        const items = await OrderService.getOrderItems(order.id)
        // Append secondary items to existing items
        orderItems.value = [...orderItems.value, ...items]
      }
    }
  } catch (error) {
    console.error('Error loading order items:', error)
    alert('Failed to load order items. Please refresh the page.')
  }
}

const loadMenuItems = async () => {
  try {
    menuItems.value = await menuItemService.getMenuItems()
  } catch (error) {
    console.error('Error loading menu items:', error)
    alert('Failed to load menu items. Please refresh the page.')
  }
}

// Auto-collapse empty rows (but don't auto-expand if already collapsed)
const updateCollapsedRows = () => {
  const todoCount = getOrdersByStatus('pending').length
  const readyCount = getOrdersByStatus('ready').length
  const doneCount = getOrdersByStatus('completed').length

  collapsedRows.value.todo = todoCount === 0;
  
  // Only collapse if empty, don't expand if already collapsed
  
  if (readyCount === 0) {
    collapsedRows.value.ready = true
  }
  if (doneCount === 0) {
    collapsedRows.value.done = true
  }
}

// Watch for changes in orders and auto-collapse empty rows
watch(orders, () => {
  updateCollapsedRows()
}, { deep: true })

// Lifecycle
onMounted(async () => {
  updateCollapsedRows()
  await loadMenuItems()
  await loadOrders()
  await loadOrderItems()
})

const refreshAll = async () => {
  await loadOrders()
  await loadOrderItems()
}

// Expose methods for parent component
defineExpose({
  refreshOrders: loadOrders,
  refreshOrderItems: loadOrderItems,
  refreshAll
})
</script>

<style scoped>
.kanban-board {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: #ffffff;
  margin: 0;
  overflow-y: visible;
  overflow-x: hidden;
  /* No height: 100% so content grows and page scrolls on real iPad */
}

/* Custom scrollbar for main kanban board */
.kanban-board::-webkit-scrollbar {
  width: 8px;
}

.kanban-board::-webkit-scrollbar-track {
  background: #f8f9fa;
  border-radius: 4px;
}

.kanban-board::-webkit-scrollbar-thumb {
  background: #dee2e6;
  border-radius: 4px;
}

.kanban-board::-webkit-scrollbar-thumb:hover {
  background: #adb5bd;
}

.kanban-row {
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
  min-width: 0;
  /* min-width: 0 allows row-content to shrink and scroll horizontally on iOS */
}

.row-header {
  padding: 1rem;
  background: #ffffff;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.row-header:hover {
  background: #f8f9fa;
}

.row-header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.row-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #495057;
  margin: 0;
  letter-spacing: 0.5px;
}

.row-count {
  background: #6c757d;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  min-width: 1.5rem;
  text-align: center;
}

.collapse-btn {
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
  color: #6c757d;
}

.collapse-btn:hover {
  color: #495057;
}

.collapse-icon {
  width: 1.25rem;
  height: 1.25rem;
  transition: transform 0.2s ease;
}

.collapse-btn.collapsed .collapse-icon {
  transform: rotate(-90deg);
}

.row-content {
  padding: 0.75rem;
  display: flex;
  gap: 0.75rem;
  overflow-x: scroll;
  overflow-y: hidden;
  min-height: 0;
  min-width: 0;
  width: 100%;
  max-height: 380px;
  padding-bottom: 0.5rem;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-x;
  /* Bounded height + overflow-x: scroll so iOS treats this as a proper horizontal scroll container */
}

/* Custom scrollbar for row horizontal scroll only */
.row-content::-webkit-scrollbar {
  height: 8px;
}

.row-content::-webkit-scrollbar-track {
  background: #f8f9fa;
  border-radius: 4px;
  margin: 0 0.5rem;
}

.row-content::-webkit-scrollbar-thumb {
  background: #6c757d;
  border-radius: 4px;
  border: 1px solid #f8f9fa;
}

.row-content::-webkit-scrollbar-thumb:hover {
  background: #495057;
}

/* Order Cards - smaller footprint for 4+ orders */
.order-card {
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 0.75rem;
  min-width: 220px;
  max-width: 260px;
  height: fit-content;
  transition: all 0.15s ease;
  cursor: pointer;
  flex-shrink: 0;
}

.order-card:hover {
  background: #f8f9fa;
  border-color: #adb5bd;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  padding-bottom: 0.375rem;
  border-bottom: 1px solid #e9ecef;
}

.order-id {
  font-size: 0.6875rem;
  font-weight: 600;
  color: #495057;
  font-variant-numeric: tabular-nums;
}

.order-time-wrap {
  display: flex;
  align-items: baseline;
  gap: 0.375rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.order-time {
  font-size: 0.625rem;
  color: #6c757d;
  font-variant-numeric: tabular-nums;
}

.order-time-elapsed {
  font-size: 0.5625rem;
  color: #adb5bd;
  font-variant-numeric: tabular-nums;
}

.order-time-elapsed-10-20 {
  color: #fd7e14;
  font-weight: 600;
}

.order-time-elapsed-over-20 {
  color: #dc3545;
  font-weight: 600;
}

.card-items {
  margin-bottom: 0.5rem;
}

.items-label {
  font-size: 0.5625rem;
  font-weight: 600;
  color: #6c757d;
  letter-spacing: 0.5px;
  margin-bottom: 0.375rem;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  max-height: 120px;
  overflow-y: auto;
  padding-right: 0.25rem;
}

.items-list::-webkit-scrollbar {
  width: 4px;
}

.items-list::-webkit-scrollbar-track {
  background: #f8f9fa;
  border-radius: 2px;
}

.items-list::-webkit-scrollbar-thumb {
  background: #dee2e6;
  border-radius: 2px;
}

.items-list::-webkit-scrollbar-thumb:hover {
  background: #adb5bd;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
}

.item-name-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
}

.item-name {
  color: #495057;
  font-weight: 400;
  flex-shrink: 0;
}

.item-variations {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
}

.variation-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  padding: 0.125rem;
  transition: all 0.2s;
}

.variation-badge.fries {
  background: #fef3c7;
  color: #d97706;
}

/* Fries option specific colors */
.variation-badge.fries-plain {
  background: #f3f4f6;
  color: #6b7280;
}

.variation-badge.fries-cheese {
  background: #fef3c7;
  color: #d97706;
}

.variation-badge.fries-sour_cream {
  background: #d1fae5;
  color: #059669;
}

.variation-badge.fries-bbq {
  background: #fee2e2;
  color: #dc2626;
}

.variation-badge.spicy {
  background: #fee2e2;
  color: #dc2626;
}

.variation-badge.drink {
  background: #dbeafe;
  color: #2563eb;
}

/* Drink option specific colors */
.variation-badge.drink-cucumber {
  background: #d1fae5;
  color: #059669;
}

.variation-badge.drink-iced_tea {
  background: #fed7aa;
  color: #ea580c;
}

.variation-badge svg {
  width: 100%;
  height: 100%;
}

.item-price {
  color: #212529;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.card-payment {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.6875rem;
}

.payment-label {
  font-weight: 600;
  color: #6c757d;
  letter-spacing: 0.5px;
}

.payment-method {
  color: #495057;
  font-weight: 500;
}

.card-total {
  font-size: 1rem;
  font-weight: 700;
  color: #212529;
  font-variant-numeric: tabular-nums;
  margin-bottom: 0.5rem;
  text-align: center;
  padding: 0.375rem 0.5rem;
  background: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.card-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.action-btn {
  min-height: 44px;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  letter-spacing: 0.3px;
  border: none;
}

.action-primary {
  background: #28a745;
  color: #ffffff;
  border: 1px solid #28a745;
}

.action-primary:hover {
  background: #218838;
  border-color: #218838;
}

.action-secondary {
  background: #dc3545;
  color: #ffffff;
  border: 1px solid #dc3545;
}

.action-secondary:hover {
  background: #c82333;
  border-color: #c82333;
}

.completed-badge {
  background: #28a745;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  text-align: center;
  letter-spacing: 0.3px;
}

/* Row-specific styling */
.todo-row .row-title {
  color: #fd7e14;
}

.ready-row .row-title {
  color: #20c997;
}

.done-row .row-title {
  color: #6c757d;
}

/* Responsive Design - tablet (e.g. iPad) and below */
@media (max-width: 1024px) {
  .row-content {
    gap: 0.75rem;
  }

  .order-card {
    min-width: 200px;
    max-width: 240px;
  }
}

@media (max-width: 1200px) {
  .row-content {
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .order-card {
    min-width: 220px;
    max-width: 260px;
  }
}

@media (max-width: 768px) {
  .kanban-board {
    padding: 0.375rem;
    gap: 0.375rem;
  }

  .kanban-row {
    margin-bottom: 0.375rem;
  }
  
  .row-header {
    padding: 0.625rem 0.75rem;
  }

  .row-title {
    font-size: 0.875rem;
  }

  .row-content {
    flex-direction: column;
    overflow-x: visible;
    padding: 0.375rem;
    gap: 0.375rem;
    min-height: auto;
    max-height: none;
  }
  
  .order-card {
    min-width: 100%;
    max-width: 100%;
    padding: 0.75rem;
  }

  .action-btn {
    min-height: 44px;
  }

  .card-header {
    margin-bottom: 0.5rem;
    padding-bottom: 0.375rem;
  }

  .card-items {
    margin-bottom: 0.5rem;
  }

  .card-payment {
    margin-bottom: 0.5rem;
  }

  .card-total {
    margin-bottom: 0.5rem;
  }
  
  .card-actions {
    flex-direction: row;
    gap: 0.375rem;
  }
  
  .action-btn {
    flex: 1;
    text-align: center;
    padding: 0.5rem 0.625rem;
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .kanban-board {
    padding: 0.25rem;
    gap: 0.25rem;
  }

  .kanban-row {
    margin-bottom: 0.25rem;
  }

  .row-header {
    padding: 0.5rem 0.625rem;
  }

  .row-title {
    font-size: 0.8125rem;
  }

  .row-content {
    padding: 0.25rem;
    gap: 0.25rem;
    min-height: auto;
    max-height: none;
  }

  .order-card {
    padding: 0.625rem;
  }

  .card-header {
    margin-bottom: 0.375rem;
    padding-bottom: 0.25rem;
  }

  .order-id {
    font-size: 0.75rem;
  }

  .order-time {
    font-size: 0.6875rem;
  }

  .card-items {
    margin-bottom: 0.375rem;
  }

  .items-label {
    font-size: 0.6875rem;
    margin-bottom: 0.25rem;
  }

  .item-name {
    font-size: 0.75rem;
  }

  .item-price {
    font-size: 0.75rem;
  }

  .card-payment {
    margin-bottom: 0.375rem;
    font-size: 0.6875rem;
  }

  .card-total {
    margin-bottom: 0.375rem;
    padding: 0.375rem;
    font-size: 0.9375rem;
  }

  .action-btn {
    min-height: 44px;
    padding: 0.4375rem 0.5rem;
    font-size: 0.6875rem;
  }
}
</style>
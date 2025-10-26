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
            <span class="order-time">{{ formatDateTime(order.created_at || '') }}</span>
          </div>
          
          <div class="card-items">
            <div class="items-label">ITEMS</div>
            <div class="items-list">
              <div
                v-for="item in getOrderItems(order.id)"
                :key="item.id"
                class="item-row"
              >
                <span class="item-name">{{ getMenuItemName(item.menu_id || '') }} ×{{ item.quantity }}</span>
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
            <span class="order-time">{{ formatDateTime(order.created_at || '') }}</span>
          </div>
          
          <div class="card-items">
            <div class="items-label">ITEMS</div>
            <div class="items-list">
              <div
                v-for="item in getOrderItems(order.id)"
                :key="item.id"
                class="item-row"
              >
                <span class="item-name">{{ getMenuItemName(item.menu_id || '') }} ×{{ item.quantity }}</span>
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
              <span class="order-time">{{ formatDateTime(order.created_at || '') }}</span>
          </div>
          
          <div class="card-items">
            <div class="items-label">ITEMS</div>
            <div class="items-list">
              <div
                v-for="item in getOrderItems(order.id)"
                :key="item.id"
                class="item-row"
              >
                <span class="item-name">{{ getMenuItemName(item.menu_id || '') }} ×{{ item.quantity }}</span>
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

const getOrderItems = (orderId: string): OrderItem[] => {
  return orderItems.value.filter(item => item.order_id === orderId)
}

const getMenuItemName = (itemId: string): string => {
  const item = menuItems.value.find(i => i.id === itemId)
  return item?.name || 'Unknown Item'
}

const getOrdersByStatus = (status: OrderStatus): Order[] => {
  return orders.value.filter(order => order.status === status as OrderStatus)
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
    orders.value = await OrderService.getOrders()
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
    const allOrderItems: OrderItem[] = []
    for (const order of orders.value) {
      const items = await OrderService.getOrderItems(order.id)
      allOrderItems.push(...items)
    }
    orderItems.value = allOrderItems
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

// Expose methods for parent component
defineExpose({
  refreshOrders: loadOrders
})
</script>

<style scoped>
.kanban-board {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  height: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: #ffffff;
  padding: 1rem;
  overflow-y: visible;
  overflow-x: hidden;
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
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
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
  padding: 1rem;
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  overflow-y: auto;
  min-height: 200px;
  max-height: 400px;
  padding-bottom: 0.5rem;
}

/* Custom scrollbar for rows (both horizontal and vertical) */
.row-content::-webkit-scrollbar {
  height: 8px;
  width: 8px;
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

.row-content::-webkit-scrollbar-corner {
  background: #f8f9fa;
}

/* Order Cards */
.order-card {
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 1rem;
  min-width: 280px;
  max-width: 320px;
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
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e9ecef;
}

.order-id {
  font-size: 0.75rem;
  font-weight: 600;
  color: #495057;
  font-variant-numeric: tabular-nums;
}

.order-time {
  font-size: 0.6875rem;
  color: #6c757d;
  font-variant-numeric: tabular-nums;
}

.card-items {
  margin-bottom: 0.75rem;
}

.items-label {
  font-size: 0.625rem;
  font-weight: 600;
  color: #6c757d;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  max-height: 150px;
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
  font-size: 0.8125rem;
}

.item-name {
  color: #495057;
  font-weight: 400;
}

.item-price {
  color: #212529;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.card-payment {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-size: 0.75rem;
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
  font-size: 1.125rem;
  font-weight: 700;
  color: #212529;
  font-variant-numeric: tabular-nums;
  margin-bottom: 0.75rem;
  text-align: center;
  padding: 0.5rem;
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

/* Responsive Design */
@media (max-width: 1200px) {
  .row-content {
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  
  .order-card {
    min-width: 250px;
    max-width: 280px;
  }
}

@media (max-width: 768px) {
  .kanban-board {
    padding: 0.5rem;
    gap: 0.75rem;
  }
  
  .row-content {
    flex-direction: column;
    overflow-x: visible;
  }
  
  .order-card {
    min-width: 100%;
    max-width: 100%;
  }
  
  .card-actions {
    flex-direction: row;
  }
  
  .action-btn {
    flex: 1;
    text-align: center;
  }
}
</style>
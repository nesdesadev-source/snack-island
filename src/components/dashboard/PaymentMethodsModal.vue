<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="show" class="modal-overlay" @click.self="handleClose">
        <div class="modal-container top-items-modal" @click.stop>
          <div class="modal-header">
            <div class="header-content">
              <div class="header-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 9V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2m2 4h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm7-5a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"></path>
                </svg>
              </div>
              <div>
                <h2>Orders by Payment Method</h2>
                <p class="modal-subtitle">Complete list of orders with payment methods</p>
              </div>
            </div>
            <button class="close-btn" @click="handleClose" aria-label="Close modal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <div class="modal-body">
            <div class="filter-section">
              <label class="filter-label">Filter by Payment Method</label>
              <select v-model="localFilter" class="filter-select">
                <option value="">All Payment Methods</option>
                <option v-for="method in availablePaymentMethods" :key="method" :value="method">
                  {{ formatPaymentMethod(method) }}
                </option>
              </select>
            </div>
            <div v-if="filteredOrders.length === 0" class="no-data">
              <p>No orders data available</p>
            </div>
            <div v-else class="sales-table-container">
              <table class="sales-table">
                <thead>
                  <tr>
                    <th class="sortable-header" @click="toggleSort">
                      Date
                      <span class="sort-icon">
                        <svg v-if="sortOrder === 'desc'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M6 9l6 6 6-6"></path>
                        </svg>
                        <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M18 15l-6-6-6 6"></path>
                        </svg>
                      </span>
                    </th>
                    <th>Order Items</th>
                    <th>Payment Method</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="order in sortedOrders" :key="order.id" :class="{ 'editing-row': editingOrderId === order.id }">
                    <td class="date-cell">{{ order.date }}</td>
                    <td class="name-cell">{{ order.itemsSummary }}</td>
                    <td class="payment-method-cell">
                      <div v-if="editingOrderId === order.id" class="payment-method-edit">
                        <select 
                          v-model="editingPaymentMethod" 
                          class="payment-method-select"
                          :disabled="savingOrderId === order.id"
                        >
                          <option v-for="method in allPaymentMethods" :key="method" :value="method">
                            {{ formatPaymentMethod(method) }}
                          </option>
                        </select>
                        <div class="edit-actions">
                          <button 
                            @click="handleSave(order.id)" 
                            class="save-btn"
                            :disabled="savingOrderId === order.id"
                            :title="savingOrderId === order.id ? 'Saving...' : 'Save'"
                          >
                            <svg v-if="savingOrderId !== order.id" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            <div v-else class="spinner-small"></div>
                          </button>
                          <button 
                            @click="handleCancelEdit" 
                            class="cancel-btn"
                            :disabled="savingOrderId === order.id"
                            title="Cancel"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div v-else class="payment-method-display">
                        <span>{{ formatPaymentMethod(order.paymentMethod) }}</span>
                        <button 
                          @click="handleStartEdit(order.id, order.paymentMethod)" 
                          class="edit-icon-btn"
                          title="Edit payment method"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td class="quantity-cell">₱{{ formatNumber(order.amount) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { PaymentMethod } from '../../models'

interface Order {
  id: string
  date: string
  itemsSummary: string
  paymentMethod: string
  amount: number
}

interface Props {
  show: boolean
  orders: Order[]
  availablePaymentMethods: string[]
  allPaymentMethods: PaymentMethod[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  save: [orderId: string, paymentMethod: PaymentMethod]
}>()

const localFilter = ref('')
const sortOrder = ref<'asc' | 'desc'>('desc')
const editingOrderId = ref<string | null>(null)
const editingPaymentMethod = ref<PaymentMethod | null>(null)
const savingOrderId = ref<string | null>(null)

watch(() => props.show, (newVal) => {
  if (!newVal) {
    handleCancelEdit()
    localFilter.value = ''
  }
})

function formatPaymentMethod(method: string): string {
  return method.charAt(0).toUpperCase() + method.slice(1)
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}

function toggleSort() {
  sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
}

function handleClose() {
  emit('close')
}

function handleStartEdit(orderId: string, currentPaymentMethod: string) {
  editingOrderId.value = orderId
  editingPaymentMethod.value = currentPaymentMethod as PaymentMethod
}

function handleCancelEdit() {
  editingOrderId.value = null
  editingPaymentMethod.value = null
  savingOrderId.value = null
}

function handleSave(orderId: string) {
  if (!editingPaymentMethod.value) return
  savingOrderId.value = orderId
  emit('save', orderId, editingPaymentMethod.value)
  // Note: The parent component should handle the save and then call handleCancelEdit
  // We'll keep the saving state until parent confirms
}

const filteredOrders = computed(() => {
  if (!localFilter.value) return props.orders
  return props.orders.filter(order => order.paymentMethod === localFilter.value)
})

const sortedOrders = computed(() => {
  const orders = [...filteredOrders.value]
  return orders.sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return sortOrder.value === 'desc' ? dateB - dateA : dateA - dateB
  })
})

// Expose methods for parent to call after save
defineExpose({
  cancelEdit: handleCancelEdit,
  setSaving: (orderId: string | null) => { savingOrderId.value = orderId }
})
</script>

<style scoped>
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
  overflow-y: auto;
}

.modal-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 600px;
  animation: slideUp 0.3s ease-out;
}

.top-items-modal {
  max-width: 700px;
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

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
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

.close-btn {
  background: #f3f4f6;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.close-btn:hover {
  background: #e5e7eb;
  color: #111827;
}

.modal-body {
  padding: 2rem;
  max-height: 60vh;
  overflow-y: auto;
}

.filter-section {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.9375rem;
  background: white;
  color: #111827;
  cursor: pointer;
  outline: none;
  transition: all 0.2s;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  padding-right: 2.5rem;
}

.filter-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.no-data {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.sales-table-container {
  overflow-x: auto;
}

.sales-table {
  width: 100%;
  border-collapse: collapse;
}

.sales-table thead {
  background: #f9fafb;
}

.sales-table th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
}

.sales-table tbody tr {
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s;
}

.sales-table tbody tr:hover {
  background-color: #f9fafb;
}

.sales-table td {
  padding: 1rem;
  font-size: 0.9375rem;
  color: #111827;
}

.date-cell {
  font-weight: 500;
  color: #6c757d;
  white-space: nowrap;
}

.name-cell {
  font-weight: 500;
}

.quantity-cell {
  font-weight: 600;
  color: #059669;
  text-align: right;
}

.payment-method-cell {
  font-weight: 500;
  color: #667eea;
  text-transform: capitalize;
  position: relative;
}

.payment-method-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.edit-icon-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #6c757d;
  padding: 0.25rem;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  opacity: 0;
}

.payment-method-display:hover .edit-icon-btn {
  opacity: 1;
}

.edit-icon-btn:hover {
  background: #f3f4f6;
  color: #667eea;
}

.payment-method-edit {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.payment-method-select {
  padding: 0.5rem 0.75rem;
  border: 2px solid #667eea;
  border-radius: 6px;
  font-size: 0.9375rem;
  background: white;
  color: #111827;
  cursor: pointer;
  outline: none;
  transition: all 0.2s;
  font-weight: 500;
  min-width: 120px;
}

.payment-method-select:focus {
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.payment-method-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.edit-actions {
  display: flex;
  gap: 0.25rem;
}

.save-btn,
.cancel-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.375rem;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: #6c757d;
}

.save-btn:hover:not(:disabled) {
  background: #d4edda;
  color: #28a745;
}

.cancel-btn:hover:not(:disabled) {
  background: #f8d7da;
  color: #dc3545;
}

.save-btn:disabled,
.cancel-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner-small {
  width: 12px;
  height: 12px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.editing-row {
  background-color: #f0f9ff;
  border-left: 3px solid #667eea;
}

.editing-row:hover {
  background-color: #e0f2fe;
}

.sortable-header {
  cursor: pointer;
  user-select: none;
  position: relative;
  padding-right: 1.5rem;
  transition: background-color 0.2s;
}

.sortable-header:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.sort-icon {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  color: #667eea;
}

@media (max-width: 768px) {
  .modal-container {
    max-width: 95%;
    margin: 1rem;
  }

  .modal-header {
    padding: 1.5rem;
  }

  .modal-body {
    padding: 1.5rem;
  }
}
</style>

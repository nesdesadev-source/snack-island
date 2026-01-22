<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-container top-items-modal" @click.stop>
          <div class="modal-header">
            <div class="header-content">
              <div class="header-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <div>
                <h2>All Revenue Items</h2>
                <p class="modal-subtitle">Complete list of items by revenue and profit</p>
              </div>
            </div>
            <button class="close-btn" @click="$emit('close')" aria-label="Close modal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <div class="modal-body">
            <div v-if="items.length === 0" class="no-data">
              <p>No revenue data available</p>
            </div>
            <div v-else class="sales-table-container">
              <table class="sales-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Item Name</th>
                    <th class="sortable-header" @click="toggleSort('revenue')">
                      Revenue
                      <span class="sort-icon" v-if="sortColumn === 'revenue'">
                        <svg v-if="sortOrder === 'desc'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M6 9l6 6 6-6"></path>
                        </svg>
                        <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M18 15l-6-6-6 6"></path>
                        </svg>
                      </span>
                    </th>
                    <th class="sortable-header" @click="toggleSort('profit')">
                      Profit
                      <span class="sort-icon" v-if="sortColumn === 'profit'">
                        <svg v-if="sortOrder === 'desc'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M6 9l6 6 6-6"></path>
                        </svg>
                        <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M18 15l-6-6-6 6"></path>
                        </svg>
                      </span>
                    </th>
                    <th class="sortable-header" @click="toggleSort('quantity')">
                      Quantity Sold
                      <span class="sort-icon" v-if="sortColumn === 'quantity'">
                        <svg v-if="sortOrder === 'desc'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M6 9l6 6 6-6"></path>
                        </svg>
                        <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M18 15l-6-6-6 6"></path>
                        </svg>
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in sortedItems" :key="item.menuItemId">
                    <td class="rank-cell">{{ index + 1 }}</td>
                    <td class="name-cell">{{ item.name }}</td>
                    <td class="quantity-cell">₱{{ formatNumber(item.revenue) }}</td>
                    <td class="quantity-cell" :class="item.profit >= 0 ? 'positive' : 'negative'">
                      ₱{{ formatNumber(item.profit) }}
                    </td>
                    <td class="quantity-cell">{{ item.quantity }}</td>
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
import { ref, computed } from 'vue'

interface Item {
  menuItemId: string
  name: string
  revenue: number
  profit: number
  quantity: number
}

interface Props {
  show: boolean
  items: Item[]
}

const props = defineProps<Props>()
defineEmits<{
  close: []
}>()

const sortColumn = ref<'revenue' | 'profit' | 'quantity'>('revenue')
const sortOrder = ref<'asc' | 'desc'>('desc')

function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}

function toggleSort(column: 'revenue' | 'profit' | 'quantity') {
  if (sortColumn.value === column) {
    sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
  } else {
    sortColumn.value = column
    sortOrder.value = 'desc'
  }
}

const sortedItems = computed(() => {
  const items = [...props.items]
  return items.sort((a, b) => {
    let comparison = 0
    if (sortColumn.value === 'revenue') {
      comparison = a.revenue - b.revenue
    } else if (sortColumn.value === 'profit') {
      comparison = a.profit - b.profit
    } else if (sortColumn.value === 'quantity') {
      comparison = a.quantity - b.quantity
    }
    return sortOrder.value === 'desc' ? -comparison : comparison
  })
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

.rank-cell {
  font-weight: 600;
  color: #667eea;
  width: 60px;
}

.name-cell {
  font-weight: 500;
}

.quantity-cell {
  font-weight: 600;
  color: #059669;
  text-align: right;
}

.quantity-cell.positive {
  color: #28a745;
}

.quantity-cell.negative {
  color: #dc3545;
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

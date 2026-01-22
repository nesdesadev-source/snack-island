<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-container top-items-modal" @click.stop>
          <div class="modal-header">
            <div class="header-content">
              <div class="header-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 3h18v18H3zM3 9h18M9 3v18"></path>
                </svg>
              </div>
              <div>
                <h2>All Selling Items</h2>
                <p class="modal-subtitle">Complete list of items and quantities sold</p>
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
              <p>No sales data available</p>
            </div>
            <div v-else class="sales-table-container">
              <table class="sales-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Item Name</th>
                    <th>Quantity Sold</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in items" :key="item.menuItemId">
                    <td class="rank-cell">{{ index + 1 }}</td>
                    <td class="name-cell">{{ item.name }}</td>
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
interface Item {
  menuItemId: string
  name: string
  quantity: number
}

interface Props {
  show: boolean
  items: Item[]
}

defineProps<Props>()
defineEmits<{
  close: []
}>()
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

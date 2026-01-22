<template>
  <div class="chart-card">
    <div class="chart-header">
      <h3>Inventory Status</h3>
      <button @click="$emit('viewAll')" class="inventory-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M7 17L17 7M17 7H7M17 7V17"></path>
        </svg>
        View All
      </button>
    </div>
    <div class="inventory-status">
      <div class="inventory-summary">
        <div class="inventory-count">
          <span class="count-number">{{ lowStockItems.length }}</span>
          <span class="count-label">Low Stock Items</span>
        </div>
        <div v-if="lowStockItems.length === 0" class="no-low-stock">
          <span class="check-icon">✅</span>
          All items are well stocked
        </div>
        <div v-else class="low-stock-warning">
          <span class="warning-icon">⚠️</span>
          {{ lowStockItems.length }} item{{ lowStockItems.length > 1 ? 's' : '' }} need{{ lowStockItems.length === 1 ? 's' : '' }} restocking
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Inventory } from '../../models'

interface Props {
  lowStockItems: Inventory[]
}

defineProps<Props>()
defineEmits<{
  viewAll: []
}>()
</script>

<style scoped>
.chart-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.chart-header h3 {
  margin: 0;
  color: #343a40;
  font-size: 1.1rem;
}

.inventory-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.inventory-btn:hover {
  background: #5a6fd8;
}

.inventory-status {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.inventory-summary {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.inventory-count {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.count-number {
  font-size: 3rem;
  font-weight: 700;
  color: #dc3545;
  line-height: 1;
}

.count-label {
  font-size: 1rem;
  color: #6c757d;
  font-weight: 500;
}

.no-low-stock {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  color: #28a745;
  font-weight: 500;
  background: #d4edda;
  border-radius: 8px;
  border: 1px solid #c3e6cb;
}

.low-stock-warning {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  color: #721c24;
  font-weight: 500;
  background: #f8d7da;
  border-radius: 8px;
  border: 1px solid #f5c6cb;
}

.check-icon, .warning-icon {
  font-size: 1.5rem;
}
</style>

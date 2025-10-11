<template>
  <div class="inventory">
    <div class="inventory-header">
      <h1>Inventory Management</h1>
      <button class="add-item-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Add New Item
      </button>
    </div>
    
    <div class="inventory-filters">
      <div class="search-box">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input type="text" placeholder="Search inventory..." v-model="searchQuery" />
      </div>
      <select v-model="selectedCategory" class="category-filter">
        <option value="">All Categories</option>
        <option value="snacks">Snacks</option>
        <option value="beverages">Beverages</option>
        <option value="candy">Candy</option>
        <option value="chips">Chips</option>
      </select>
    </div>
    
    <div class="inventory-table">
      <table>
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Category</th>
            <th>Stock</th>
            <th>Price</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredItems" :key="item.id">
            <td>
              <div class="item-info">
                <div class="item-name">{{ item.name }}</div>
                <div class="item-sku">SKU: {{ item.sku }}</div>
              </div>
            </td>
            <td>
              <span class="category-badge" :class="item.category">
                {{ item.category }}
              </span>
            </td>
            <td>
              <div class="stock-info">
                <span class="stock-quantity">{{ item.stock }}</span>
                <div class="stock-bar">
                  <div class="stock-fill" :style="{ width: getStockPercentage(item.stock, item.maxStock) + '%' }"></div>
                </div>
              </div>
            </td>
            <td class="price">${{ item.price.toFixed(2) }}</td>
            <td>
              <span class="status-badge" :class="getStatusClass(item.stock)">
                {{ getStatusText(item.stock) }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button class="action-btn edit">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button class="action-btn delete">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3,6 5,6 21,6"></polyline>
                    <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const searchQuery = ref('')
const selectedCategory = ref('')

const inventoryItems = ref([
  { id: 1, name: 'Chocolate Bar', sku: 'CHOC001', category: 'candy', stock: 45, maxStock: 100, price: 2.99 },
  { id: 2, name: 'Potato Chips', sku: 'CHIP001', category: 'chips', stock: 12, maxStock: 50, price: 1.99 },
  { id: 3, name: 'Energy Drink', sku: 'BEV001', category: 'beverages', stock: 78, maxStock: 100, price: 3.49 },
  { id: 4, name: 'Granola Bar', sku: 'SNACK001', category: 'snacks', stock: 3, maxStock: 50, price: 1.49 },
  { id: 5, name: 'Soda Can', sku: 'BEV002', category: 'beverages', stock: 89, maxStock: 100, price: 1.25 },
  { id: 6, name: 'Gummy Bears', sku: 'CANDY001', category: 'candy', stock: 0, maxStock: 75, price: 2.25 },
])

const filteredItems = computed(() => {
  let filtered = inventoryItems.value
  
  if (searchQuery.value) {
    filtered = filtered.filter(item => 
      item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  
  if (selectedCategory.value) {
    filtered = filtered.filter(item => item.category === selectedCategory.value)
  }
  
  return filtered
})

const getStockPercentage = (stock: number, maxStock: number) => {
  return Math.round((stock / maxStock) * 100)
}

const getStatusClass = (stock: number) => {
  if (stock === 0) return 'out-of-stock'
  if (stock < 10) return 'low-stock'
  return 'in-stock'
}

const getStatusText = (stock: number) => {
  if (stock === 0) return 'Out of Stock'
  if (stock < 10) return 'Low Stock'
  return 'In Stock'
}
</script>

<style scoped>
.inventory {
  padding: 0;
}

@media (max-width: 480px) {
  .inventory {
    padding: 0;
  }
  
  .inventory-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .inventory-header h1 {
    font-size: 1.5rem;
  }
  
  .inventory-filters {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .search-box {
    max-width: none;
  }
  
  .inventory-table {
    overflow-x: auto;
  }
  
  table {
    min-width: 600px;
  }
  
  th, td {
    padding: 0.75rem 0.5rem;
    font-size: 0.9rem;
  }
  
  .item-name {
    font-size: 0.9rem;
  }
  
  .item-sku {
    font-size: 0.75rem;
  }
}

.inventory-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.inventory-header h1 {
  font-size: 2rem;
  color: #343a40;
  margin: 0;
}

.add-item-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s;
}

.add-item-btn:hover {
  transform: translateY(-1px);
}

.inventory-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-box svg {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
}

.search-box input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
}

.search-box input:focus {
  border-color: #667eea;
}

.category-filter {
  padding: 0.75rem 1rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background: white;
  font-size: 0.9rem;
  outline: none;
  cursor: pointer;
}

.inventory-table {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #f8f9fa;
}

th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #495057;
  border-bottom: 1px solid #dee2e6;
}

td {
  padding: 1rem;
  border-bottom: 1px solid #f1f3f4;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.item-name {
  font-weight: 500;
  color: #343a40;
}

.item-sku {
  font-size: 0.8rem;
  color: #6c757d;
}

.category-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: capitalize;
}

.category-badge.snacks { background: #e3f2fd; color: #1976d2; }
.category-badge.beverages { background: #f3e5f5; color: #7b1fa2; }
.category-badge.candy { background: #fff3e0; color: #f57c00; }
.category-badge.chips { background: #e8f5e8; color: #388e3c; }

.stock-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stock-quantity {
  font-weight: 600;
  color: #343a40;
}

.stock-bar {
  width: 60px;
  height: 4px;
  background: #e9ecef;
  border-radius: 2px;
  overflow: hidden;
}

.stock-fill {
  height: 100%;
  background: linear-gradient(90deg, #28a745, #20c997);
  transition: width 0.3s;
}

.price {
  font-weight: 600;
  color: #28a745;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.in-stock { background: #d4edda; color: #155724; }
.status-badge.low-stock { background: #fff3cd; color: #856404; }
.status-badge.out-of-stock { background: #f8d7da; color: #721c24; }

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-btn.edit {
  background: #e3f2fd;
  color: #1976d2;
}

.action-btn.edit:hover {
  background: #1976d2;
  color: white;
}

.action-btn.delete {
  background: #f8d7da;
  color: #721c24;
}

.action-btn.delete:hover {
  background: #721c24;
  color: white;
}
</style>

<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>Dashboard</h1>
      <p>Welcome to Snack Island Management System</p>
      <div class="period-selector">
        <button 
          v-for="period in periods" 
          :key="period.value"
          @click="selectedPeriod = period.value"
          :class="['period-btn', { active: selectedPeriod === period.value }]"
        >
          {{ period.label }}
        </button>
      </div>
    </div>
    
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading dashboard data...</p>
        </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <p>{{ error }}</p>
      <button @click="loadDashboardData" class="retry-btn">Retry</button>
      </div>
      
    <!-- Dashboard Content -->
    <div v-else>
      <!-- Key Metrics Cards -->
      <div class="stats-grid">
      <div class="stat-card">
          <div class="stat-icon sales">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
          </div>
        <div class="stat-content">
            <h3>Total Sales</h3>
            <p class="stat-number">₱{{ formatNumber(dashboardData.totalSales) }}</p>
            <div class="stat-trend" :class="dashboardData.salesTrend >= 0 ? 'positive' : 'negative'">
              <span>{{ dashboardData.salesTrend >= 0 ? '↗' : '↘' }}</span>
              {{ Math.abs(dashboardData.salesTrend).toFixed(1) }}%
        </div>
        </div>
      </div>
      
      <div class="stat-card">
          <div class="stat-icon orders">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
        </div>
        <div class="stat-content">
            <h3>Total Orders</h3>
            <p class="stat-number">{{ dashboardData.totalOrders }}</p>
            <div class="stat-trend" :class="dashboardData.ordersTrend >= 0 ? 'positive' : 'negative'">
              <span>{{ dashboardData.ordersTrend >= 0 ? '↗' : '↘' }}</span>
              {{ Math.abs(dashboardData.ordersTrend).toFixed(1) }}%
        </div>
      </div>
    </div>
    
        <div class="stat-card">
          <div class="stat-icon expenses">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 9V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2m2 4h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm7-5a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"></path>
            </svg>
          </div>
          <div class="stat-content">
            <h3>Total Expenses</h3>
            <p class="stat-number">₱{{ formatNumber(dashboardData.totalExpenses) }}</p>
            <div class="stat-trend" :class="dashboardData.expensesTrend >= 0 ? 'negative' : 'positive'">
              <span>{{ dashboardData.expensesTrend >= 0 ? '↗' : '↘' }}</span>
              {{ Math.abs(dashboardData.expensesTrend).toFixed(1) }}%
            </div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon profit">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div class="stat-content">
            <h3>Net Profit</h3>
            <p class="stat-number" :class="dashboardData.netProfit >= 0 ? 'positive' : 'negative'">
              ₱{{ formatNumber(dashboardData.netProfit) }}
            </p>
            <div class="stat-trend" :class="dashboardData.profitTrend >= 0 ? 'positive' : 'negative'">
              <span>{{ dashboardData.profitTrend >= 0 ? '↗' : '↘' }}</span>
              {{ Math.abs(dashboardData.profitTrend).toFixed(1) }}%
            </div>
          </div>
        </div>
      </div>
      
      <!-- Charts Section -->
      <div class="charts-grid">
        <!-- Sales Trend Chart -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Sales Trend</h3>
            <div class="chart-legend">
              <span class="legend-item">
                <span class="legend-color sales"></span>
                Sales
              </span>
            </div>
          </div>
          <div class="chart-container">
            <canvas ref="salesChart" width="400" height="200"></canvas>
          </div>
        </div>
        
        <!-- Expense Breakdown Chart -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Expense Breakdown</h3>
          </div>
          <div class="chart-container">
            <canvas ref="expenseChart" width="400" height="200"></canvas>
          </div>
        </div>
        
        <!-- Top Selling Items Chart -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Top Selling Items</h3>
          </div>
          <div class="chart-container">
            <canvas ref="topItemsChart" width="400" height="200"></canvas>
          </div>
        </div>
        
        <!-- Inventory Status -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Inventory Status</h3>
            <button @click="goToInventory" class="inventory-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M7 17L17 7M17 7H7M17 7V17"></path>
              </svg>
              View All
            </button>
          </div>
          <div class="inventory-status">
            <div class="inventory-summary">
              <div class="inventory-count">
                <span class="count-number">{{ dashboardData.lowStockItems.length }}</span>
                <span class="count-label">Low Stock Items</span>
              </div>
              <div v-if="dashboardData.lowStockItems.length === 0" class="no-low-stock">
                <span class="check-icon">✅</span>
                All items are well stocked
              </div>
              <div v-else class="low-stock-warning">
                <span class="warning-icon">⚠️</span>
                {{ dashboardData.lowStockItems.length }} item{{ dashboardData.lowStockItems.length > 1 ? 's' : '' }} need{{ dashboardData.lowStockItems.length === 1 ? 's' : '' }} restocking
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Recent Activity -->
      <div class="dashboard-content">
        <div class="content-section">
          <h2>Recent Activity</h2>
          <div class="activity-list">
            <div class="activity-item" v-for="activity in dashboardData.recentActivity" :key="activity.id">
              <div class="activity-icon">{{ activity.icon }}</div>
            <div class="activity-content">
                <p><strong>{{ activity.title }}</strong> {{ activity.description }}</p>
                <span class="activity-time">{{ activity.time }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Chart, registerables } from 'chart.js'
import { OrderService } from '../services/orderService'
import { expenseService } from '../services/expenseService'
import { inventoryService } from '../services/inventoryService'
import { menuItemService } from '../services/menuItemService'
import { 
  calculateTotalExpenses, 
  calculateExpensesByCategory,
  filterExpensesByDateRange 
} from '../modules/expenses/expenseUtils'
import { isLowStock } from '../modules/inventory/inventoryUtils'
import type { Order, OrderItem, Expense, Inventory, MenuItem } from '../models'

// Register Chart.js components
Chart.register(...registerables)

// Router
const router = useRouter()

// Refs
const salesChart = ref<HTMLCanvasElement | null>(null)
const expenseChart = ref<HTMLCanvasElement | null>(null)
const topItemsChart = ref<HTMLCanvasElement | null>(null)

// State
const loading = ref(true)
const error = ref<string | null>(null)
const selectedPeriod = ref('week')

// Data
const orders = ref<Order[]>([])
const orderItems = ref<OrderItem[]>([])
const expenses = ref<Expense[]>([])
const inventory = ref<Inventory[]>([])
const menuItems = ref<MenuItem[]>([])

// Period options
const periods = [
  { label: 'Today', value: 'today' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Year', value: 'year' }
]

// Computed dashboard data
const dashboardData = computed(() => {
  const currentPeriodData = getCurrentPeriodData()
  const previousPeriodData = getPreviousPeriodData()
  
  return {
    totalSales: currentPeriodData.totalSales,
    totalOrders: currentPeriodData.totalOrders,
    totalExpenses: currentPeriodData.totalExpenses,
    netProfit: currentPeriodData.totalSales - currentPeriodData.totalExpenses,
    salesTrend: calculateTrend(currentPeriodData.totalSales, previousPeriodData.totalSales),
    ordersTrend: calculateTrend(currentPeriodData.totalOrders, previousPeriodData.totalOrders),
    expensesTrend: calculateTrend(currentPeriodData.totalExpenses, previousPeriodData.totalExpenses),
    profitTrend: calculateTrend(
      currentPeriodData.totalSales - currentPeriodData.totalExpenses,
      previousPeriodData.totalSales - previousPeriodData.totalExpenses
    ),
    lowStockItems: getLowStockItems(),
    recentActivity: getRecentActivity(),
    salesData: getSalesChartData(),
    expenseData: getExpenseChartData(),
    topItemsData: getTopItemsData()
  }
})

// Helper functions
function getCurrentPeriodData() {
  const now = new Date()
  const currentPeriodOrders = getOrdersForPeriod(now, selectedPeriod.value)
  const currentPeriodExpenses = getExpensesForPeriod(now, selectedPeriod.value)
  
  return {
    totalSales: currentPeriodOrders.reduce((sum, order) => sum + order.total_amount, 0),
    totalOrders: currentPeriodOrders.length,
    totalExpenses: calculateTotalExpenses(currentPeriodExpenses)
  }
}

function getPreviousPeriodData() {
  const now = new Date()
  const previousPeriod = getPreviousPeriod(now, selectedPeriod.value)
  const previousPeriodOrders = getOrdersForPeriod(previousPeriod, selectedPeriod.value)
  const previousPeriodExpenses = getExpensesForPeriod(previousPeriod, selectedPeriod.value)
  
  return {
    totalSales: previousPeriodOrders.reduce((sum, order) => sum + order.total_amount, 0),
    totalOrders: previousPeriodOrders.length,
    totalExpenses: calculateTotalExpenses(previousPeriodExpenses)
  }
}

function getOrdersForPeriod(date: Date, period: string) {
  const startDate = getPeriodStartDate(date, period)
  const endDate = getPeriodEndDate(date, period)
  
  return orders.value.filter(order => {
    if (!order.created_at) return false
    if (order.status !== 'completed') return false
    const orderDate = new Date(order.created_at)
    return orderDate >= startDate && orderDate <= endDate
  })
}

function getExpensesForPeriod(date: Date, period: string) {
  const startDate = getPeriodStartDate(date, period)
  const endDate = getPeriodEndDate(date, period)
  
  // Format dates in local timezone to avoid UTC conversion issues
  const formatLocalDate = (d: Date): string => {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  return filterExpensesByDateRange(
    expenses.value,
    formatLocalDate(startDate),
    formatLocalDate(endDate)
  )
}

function getPeriodStartDate(date: Date, period: string): Date {
  const start = new Date(date)
  
  switch (period) {
    case 'today':
      start.setHours(0, 0, 0, 0)
      break
    case 'week':
      start.setDate(start.getDate() - 7)
      start.setHours(0, 0, 0, 0)
      break
    case 'month':
      start.setMonth(start.getMonth() - 1)
      start.setHours(0, 0, 0, 0)
      break
    case 'year':
      start.setFullYear(start.getFullYear() - 1)
      start.setHours(0, 0, 0, 0)
      break
  }
  
  return start
}

function getPeriodEndDate(date: Date, _period: string): Date {
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)
  return end
}

function getPreviousPeriod(date: Date, _period: string): Date {
  const previous = new Date(date)
  
  switch (_period) {
    case 'today':
      previous.setDate(previous.getDate() - 1)
      break
    case 'week':
      previous.setDate(previous.getDate() - 14)
      break
    case 'month':
      previous.setMonth(previous.getMonth() - 2)
      break
    case 'year':
      previous.setFullYear(previous.getFullYear() - 2)
      break
  }
  
  return previous
}

function calculateTrend(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

function getLowStockItems() {
  return inventory.value.filter(item => isLowStock(item.quantity, item.reorder_level))
}

function getRecentActivity() {
  const activities: Array<{
    id: string
    icon: string
    title: string
    description: string
    time: string
  }> = []
  
  // Recent orders
  const recentOrders = orders.value
    .filter(order => order.created_at)
    .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())
    .slice(0, 3)
  
  recentOrders.forEach(order => {
    activities.push({
      id: `order-${order.id}`,
      icon: '🛒',
      title: 'New Order',
      description: `₱${order.total_amount.toFixed(2)} - ${order.status}`,
      time: formatTimeAgo(new Date(order.created_at!))
    })
  })
  
  // Recent expenses
  const recentExpenses = expenses.value
    .sort((a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime())
    .slice(0, 2)
  
  recentExpenses.forEach(expense => {
    activities.push({
      id: `expense-${expense.id}`,
      icon: '💰',
      title: 'Expense Added',
      description: `${expense.category} - ₱${expense.amount.toFixed(2)}`,
      time: formatTimeAgo(new Date(expense.expense_date))
    })
  })
  
  return activities.sort((a, b) => {
    // Sort by most recent first
    return b.time.localeCompare(a.time)
  }).slice(0, 5)
}

function getSalesChartData() {
  const days = 7
  const data = []
  const labels = []
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    
    const dayOrders = orders.value.filter(order => {
      if (!order.created_at) return false
      if (order.status !== 'completed') return false
      const orderDate = new Date(order.created_at)
      return orderDate.toDateString() === date.toDateString()
    })
    
    const daySales = dayOrders.reduce((sum, order) => sum + order.total_amount, 0)
    
    data.push(daySales)
    labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }))
  }
  
  return { data, labels }
}

function getExpenseChartData() {
  const expenseByCategory = calculateExpensesByCategory(expenses.value)
  
  return {
    labels: Object.keys(expenseByCategory),
    data: Object.values(expenseByCategory)
  }
}

function getTopItemsData() {
  // Calculate top selling items from order items data
  const itemCounts: Record<string, number> = {}
  
  // Get completed order IDs
  const completedOrderIds = new Set(
    orders.value
      .filter(order => order.status === 'completed')
      .map(order => order.id)
  )
  
  // Count quantities for each menu item from completed orders only
  orderItems.value.forEach(orderItem => {
    const menuItemId = orderItem.menu_id
    if (menuItemId && orderItem.order_id && completedOrderIds.has(orderItem.order_id)) {
      itemCounts[menuItemId] = (itemCounts[menuItemId] || 0) + orderItem.quantity
    }
  })
  
  // Sort by quantity and get top 5
  const sortedItems = Object.entries(itemCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
  
  // Get menu item names and create labels/data arrays
  const labels: string[] = []
  const data: number[] = []
  
  sortedItems.forEach(([menuItemId, quantity]) => {
    const menuItem = menuItems.value.find(item => item.id === menuItemId)
    if (menuItem) {
      labels.push(menuItem.name)
      data.push(quantity)
    }
  })
  
  // If no data, return empty arrays
  if (labels.length === 0) {
    return {
      labels: ['No sales data'],
      data: [0]
    }
  }
  
  return { labels, data }
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}

// Navigation functions
function goToInventory() {
  router.push('/inventory')
}

// Chart creation functions
function createSalesChart() {
  if (!salesChart.value) return
  
  const ctx = salesChart.value.getContext('2d')
  if (!ctx) return
  
  const chartData = dashboardData.value.salesData
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartData.labels,
      datasets: [{
        label: 'Sales',
        data: chartData.data,
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '₱' + value.toLocaleString()
            }
          }
        }
      }
    }
  })
}

function createExpenseChart() {
  if (!expenseChart.value) return
  
  const ctx = expenseChart.value.getContext('2d')
  if (!ctx) return
  
  const chartData = dashboardData.value.expenseData
  
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: chartData.labels,
      datasets: [{
        data: chartData.data,
        backgroundColor: [
          '#667eea',
          '#764ba2',
          '#f093fb',
          '#f5576c',
          '#4facfe',
          '#00f2fe'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  })
}

function createTopItemsChart() {
  if (!topItemsChart.value) return
  
  const ctx = topItemsChart.value.getContext('2d')
  if (!ctx) return
  
  const chartData = dashboardData.value.topItemsData
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: chartData.labels,
      datasets: [{
        label: 'Sales Count',
        data: chartData.data,
        backgroundColor: '#667eea',
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  })
}

// Data loading
async function loadDashboardData() {
  try {
    loading.value = true
    error.value = null
    
    // Load all data in parallel
    const [ordersData, expensesData, inventoryData, menuItemsData] = await Promise.all([
      OrderService.getOrders(),
      expenseService.getAll(),
      inventoryService.getAll(),
      menuItemService.getMenuItems()
    ])
    
    orders.value = ordersData
    expenses.value = expensesData
    inventory.value = inventoryData
    menuItems.value = menuItemsData
    
    // Load order items for all orders
    const orderItemsPromises = orders.value.map(order => OrderService.getOrderItems(order.id))
    const orderItemsResults = await Promise.all(orderItemsPromises)
    orderItems.value = orderItemsResults.flat()
    
  } catch (err) {
    console.error('Error loading dashboard data:', err)
    error.value = 'Failed to load dashboard data. Please try again.'
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(async () => {
  await loadDashboardData()
  
  // Create charts after data is loaded and DOM is updated
  await nextTick()
  createSalesChart()
  createExpenseChart()
  createTopItemsChart()
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.dashboard-header {
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.dashboard-header h1 {
  font-size: 2rem;
  color: #343a40;
  margin: 0;
}

.dashboard-header p {
  color: #6c757d;
  font-size: 1.1rem;
  margin: 0.5rem 0 0 0;
}

.period-selector {
  display: flex;
  gap: 0.5rem;
  background: #f8f9fa;
  padding: 0.25rem;
  border-radius: 8px;
}

.period-btn {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
  font-weight: 500;
}

.period-btn:hover {
  background: white;
}

.period-btn.active {
  background: white;
  color: #667eea;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.retry-btn:hover {
  background: #5a6fd8;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon.sales {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.orders {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.expenses {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.profit {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-content {
  flex: 1;
}

.stat-content h3 {
  margin: 0 0 0.5rem 0;
  color: #6c757d;
  font-size: 0.9rem;
  font-weight: 500;
}

.stat-number {
  margin: 0 0 0.5rem 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #343a40;
}

.stat-number.positive {
  color: #28a745;
}

.stat-number.negative {
  color: #dc3545;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.85rem;
  font-weight: 500;
}

.stat-trend.positive {
  color: #28a745;
}

.stat-trend.negative {
  color: #dc3545;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

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

.chart-legend {
  display: flex;
  gap: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #6c757d;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-color.sales {
  background: #667eea;
}

.chart-container {
  position: relative;
  height: 200px;
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

.dashboard-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.content-section h2 {
  margin: 0 0 1.5rem 0;
  color: #343a40;
  font-size: 1.3rem;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.activity-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.activity-content p {
  margin: 0 0 0.25rem 0;
  color: #343a40;
}

.activity-time {
  font-size: 0.85rem;
  color: #6c757d;
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .dashboard {
    padding: 0;
  }
  
  .dashboard-header h1 {
    font-size: 1.5rem;
  }
  
  .dashboard-header p {
    font-size: 1rem;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .stat-number {
    font-size: 1.5rem;
  }
  
  .dashboard-content {
    padding: 1rem;
  }
  
  .content-section h2 {
    font-size: 1.1rem;
  }
  
  .chart-card {
    padding: 1rem;
  }
}
</style>

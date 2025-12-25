<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>Dashboard</h1>
      <p>Welcome to Snack Island Management System</p>
      <div class="period-controls">
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
        <div v-if="selectedPeriod !== 'today'" class="period-type-selector">
          <button
            @click="periodType = 'toDate'"
            :class="['period-type-btn', { active: periodType === 'toDate' }]"
          >
            To Date
          </button>
          <button
            @click="periodType = 'calendar'"
            :class="['period-type-btn', { active: periodType === 'calendar' }]"
          >
            Calendar
          </button>
        </div>
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
            <p class="stat-number-sub">(~₱{{ formatNumber(Math.floor(averageSalesPerDay)) }} per day)</p>
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
            <p class="stat-number-sub">(~{{ Math.floor(averageOrdersPerDay) }} per day)</p>
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
              <span 
                class="legend-item" 
                :class="{ 'legend-item-disabled': !chartVisibility.sales }"
                @click="toggleChartLine('sales')"
              >
                <span class="legend-color sales"></span>
                Sales
              </span>
              <span 
                class="legend-item"
                :class="{ 'legend-item-disabled': !chartVisibility.expenses }"
                @click="toggleChartLine('expenses')"
              >
                <span class="legend-color expenses"></span>
                Expenses
              </span>
              <span 
                class="legend-item"
                :class="{ 'legend-item-disabled': !chartVisibility.profit }"
                @click="toggleChartLine('profit')"
              >
                <span class="legend-color profit"></span>
                Profit
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
            <button @click="showTopItemsModal = true" class="inventory-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M7 17L17 7M17 7H7M17 7V17"></path>
              </svg>
              View All
            </button>
          </div>
          <div class="chart-container">
            <canvas ref="topItemsChart" width="400" height="200"></canvas>
          </div>
        </div>
        
        <!-- Top Revenue Items Chart -->
        <div class="chart-card">
          <div class="chart-header">
            <div>
              <h3>Top Revenue Items</h3>
              <p class="chart-subtitle" v-if="dashboardData.topRevenueData.labels.length > 0 && dashboardData.topRevenueData.labels[0] !== 'No revenue data'">
                Total Profit: ₱{{ formatNumber(dashboardData.topRevenueData.profits.reduce((sum, p) => sum + p, 0)) }}
              </p>
            </div>
            <button @click="showTopRevenueModal = true" class="inventory-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M7 17L17 7M17 7H7M17 7V17"></path>
              </svg>
              View All
            </button>
          </div>
          <div class="chart-container">
            <canvas ref="topRevenueChart" width="400" height="200"></canvas>
          </div>
        </div>
        
        <!-- Payment Methods Chart -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Payment Methods</h3>
            <button @click="showPaymentMethodsModal = true" class="inventory-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M7 17L17 7M17 7H7M17 7V17"></path>
              </svg>
              View Orders
            </button>
          </div>
          <div class="chart-container">
            <canvas ref="paymentMethodsChart" width="400" height="200"></canvas>
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

  <!-- Top Selling Items Modal -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="showTopItemsModal" class="modal-overlay" @click.self="showTopItemsModal = false">
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
            <button class="close-btn" @click="showTopItemsModal = false" aria-label="Close modal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <div class="modal-body">
            <div v-if="allItemsSales.length === 0" class="no-data">
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
                  <tr v-for="(item, index) in allItemsSales" :key="item.menuItemId">
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

  <!-- Top Revenue Items Modal -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="showTopRevenueModal" class="modal-overlay" @click.self="showTopRevenueModal = false">
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
            <button class="close-btn" @click="showTopRevenueModal = false" aria-label="Close modal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <div class="modal-body">
            <div v-if="allItemsRevenue.length === 0" class="no-data">
              <p>No revenue data available</p>
            </div>
            <div v-else class="sales-table-container">
              <table class="sales-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Item Name</th>
                    <th class="sortable-header" @click="toggleRevenueItemsSort('revenue')">
                      Revenue
                      <span class="sort-icon" v-if="revenueItemsSortColumn === 'revenue'">
                        <svg v-if="revenueItemsSortOrder === 'desc'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M6 9l6 6 6-6"></path>
                        </svg>
                        <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M18 15l-6-6-6 6"></path>
                        </svg>
                      </span>
                    </th>
                    <th class="sortable-header" @click="toggleRevenueItemsSort('profit')">
                      Profit
                      <span class="sort-icon" v-if="revenueItemsSortColumn === 'profit'">
                        <svg v-if="revenueItemsSortOrder === 'desc'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M6 9l6 6 6-6"></path>
                        </svg>
                        <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M18 15l-6-6-6 6"></path>
                        </svg>
                      </span>
                    </th>
                    <th class="sortable-header" @click="toggleRevenueItemsSort('quantity')">
                      Quantity Sold
                      <span class="sort-icon" v-if="revenueItemsSortColumn === 'quantity'">
                        <svg v-if="revenueItemsSortOrder === 'desc'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
                  <tr v-for="(item, index) in allItemsRevenue" :key="item.menuItemId">
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

  <!-- Payment Methods Orders Modal -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="showPaymentMethodsModal" class="modal-overlay" @click.self="showPaymentMethodsModal = false">
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
            <button class="close-btn" @click="showPaymentMethodsModal = false" aria-label="Close modal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <div class="modal-body">
            <div v-if="paymentMethodsOrders.length === 0" class="no-data">
              <p>No orders data available</p>
            </div>
            <div v-else class="sales-table-container">
              <table class="sales-table">
                <thead>
                  <tr>
                    <th class="sortable-header" @click="togglePaymentMethodsSort">
                      Date
                      <span class="sort-icon">
                        <svg v-if="paymentMethodsSortOrder === 'desc'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
                  <tr v-for="order in paymentMethodsOrders" :key="order.id">
                    <td class="date-cell">{{ order.date }}</td>
                    <td class="name-cell">{{ order.itemsSummary }}</td>
                    <td class="payment-method-cell">{{ formatPaymentMethod(order.paymentMethod) }}</td>
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
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Chart, registerables } from 'chart.js'
import { OrderService } from '../services/orderService'
import { expenseService } from '../services/expenseService'
import { inventoryService } from '../services/inventoryService'
import { menuItemService } from '../services/menuItemService'
import { recipeMapService } from '../services/recipeMapService'
import { 
  calculateTotalExpenses, 
  calculateExpensesByCategory,
  filterExpensesByDateRange 
} from '../modules/expenses/expenseUtils'
import { isLowStock } from '../modules/inventory/inventoryUtils'
import { computeCostPerOrderForMenuItem } from '../modules/menu/menuPageUtils'
import type { Order, OrderItem, Expense, Inventory, MenuItem, RecipeMap } from '../models'

// Register Chart.js components
Chart.register(...registerables)

// Router
const router = useRouter()

// Refs
const salesChart = ref<HTMLCanvasElement | null>(null)
const expenseChart = ref<HTMLCanvasElement | null>(null)
const topItemsChart = ref<HTMLCanvasElement | null>(null)
const topRevenueChart = ref<HTMLCanvasElement | null>(null)
const paymentMethodsChart = ref<HTMLCanvasElement | null>(null)

// Chart instances for cleanup
let salesChartInstance: Chart | null = null
let expenseChartInstance: Chart | null = null
let topItemsChartInstance: Chart | null = null
let topRevenueChartInstance: Chart | null = null
let paymentMethodsChartInstance: Chart | null = null

// State
const loading = ref(true)
const error = ref<string | null>(null)
const selectedPeriod = ref('week')
const periodType = ref<'toDate' | 'calendar'>('toDate')
const showTopItemsModal = ref(false)
const showTopRevenueModal = ref(false)
const showPaymentMethodsModal = ref(false)
const paymentMethodsSortOrder = ref<'asc' | 'desc'>('desc')
const revenueItemsSortColumn = ref<'revenue' | 'profit' | 'quantity'>('revenue')
const revenueItemsSortOrder = ref<'asc' | 'desc'>('desc')

// Chart visibility state
const chartVisibility = ref({
  sales: true,
  expenses: true,
  profit: true
})

// Data
const orders = ref<Order[]>([])
const orderItems = ref<OrderItem[]>([])
const expenses = ref<Expense[]>([])
const inventory = ref<Inventory[]>([])
const menuItems = ref<MenuItem[]>([])
const recipeMaps = ref<RecipeMap[]>([])

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
    expensesData: getExpensesChartData(),
    profitData: getProfitChartData(),
    expenseData: getExpenseChartData(),
    topItemsData: getTopItemsData(),
    topRevenueData: getTopRevenueItemsData(),
    paymentMethodsData: getPaymentMethodsData()
  }
})

// Computed average orders per day
const averageOrdersPerDay = computed(() => {
  const now = new Date()
  const startDate = getPeriodStartDate(now, selectedPeriod.value, periodType.value)
  const endDate = getPeriodEndDate(now, selectedPeriod.value, periodType.value)
  
  const timeDiff = endDate.getTime() - startDate.getTime()
  const daysDiff = Math.max(1, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)))
  
  return dashboardData.value.totalOrders / daysDiff
})

// Computed average sales per day
const averageSalesPerDay = computed(() => {
  const now = new Date()
  const startDate = getPeriodStartDate(now, selectedPeriod.value, periodType.value)
  const endDate = getPeriodEndDate(now, selectedPeriod.value, periodType.value)
  
  const timeDiff = endDate.getTime() - startDate.getTime()
  const daysDiff = Math.max(1, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)))
  
  return dashboardData.value.totalSales / daysDiff
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
  const previousPeriod = getPreviousPeriod(now, selectedPeriod.value, periodType.value)
  const previousPeriodOrders = getOrdersForPeriod(previousPeriod, selectedPeriod.value)
  const previousPeriodExpenses = getExpensesForPeriod(previousPeriod, selectedPeriod.value)
  
  return {
    totalSales: previousPeriodOrders.reduce((sum, order) => sum + order.total_amount, 0),
    totalOrders: previousPeriodOrders.length,
    totalExpenses: calculateTotalExpenses(previousPeriodExpenses)
  }
}

function getOrdersForPeriod(date: Date, period: string) {
  const startDate = getPeriodStartDate(date, period, periodType.value)
  const endDate = getPeriodEndDate(date, period, periodType.value)
  
  return orders.value.filter(order => {
    if (!order.created_at) return false
    if (order.status !== 'completed') return false
    const orderDate = new Date(order.created_at)
    
    // Normalize dates to local date components for accurate day-level comparison
    // This avoids timezone issues where UTC dates might fall on a different day
    const orderYear = orderDate.getFullYear()
    const orderMonth = orderDate.getMonth()
    const orderDay = orderDate.getDate()
    
    const startYear = startDate.getFullYear()
    const startMonth = startDate.getMonth()
    const startDay = startDate.getDate()
    
    const endYear = endDate.getFullYear()
    const endMonth = endDate.getMonth()
    const endDay = endDate.getDate()
    
    // Create date objects at midnight local time for day-level comparison
    const orderDateLocal = new Date(orderYear, orderMonth, orderDay)
    const startDateLocal = new Date(startYear, startMonth, startDay)
    const endDateLocal = new Date(endYear, endMonth, endDay)
    
    // Compare dates at day level
    return orderDateLocal >= startDateLocal && orderDateLocal <= endDateLocal
  })
}

function getExpensesForPeriod(date: Date, period: string) {
  const startDate = getPeriodStartDate(date, period, periodType.value)
  const endDate = getPeriodEndDate(date, period, periodType.value)
  
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

// Helper functions for calendar periods
function getStartOfWeek(date: Date): Date {
  const start = new Date(date)
  const day = start.getDay()
  const diff = start.getDate() - day + (day === 0 ? -6 : 1) // Adjust to Monday
  start.setDate(diff)
  start.setHours(0, 0, 0, 0)
  return start
}

function getEndOfWeek(date: Date): Date {
  const end = getStartOfWeek(date)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return end
}

function getStartOfMonth(date: Date): Date {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  start.setHours(0, 0, 0, 0)
  return start
}

function getEndOfMonth(date: Date): Date {
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  end.setHours(23, 59, 59, 999)
  return end
}

function getStartOfYear(date: Date): Date {
  const start = new Date(date.getFullYear(), 0, 1)
  start.setHours(0, 0, 0, 0)
  return start
}

function getEndOfYear(date: Date): Date {
  const end = new Date(date.getFullYear(), 11, 31)
  end.setHours(23, 59, 59, 999)
  return end
}

function getPeriodStartDate(date: Date, period: string, type: 'toDate' | 'calendar' = 'toDate'): Date {
  const start = new Date(date)
  
  switch (period) {
    case 'today':
      start.setHours(0, 0, 0, 0)
      break
    case 'week':
      if (type === 'calendar') {
        return getStartOfWeek(date)
      } else {
        start.setDate(start.getDate() - 7)
        start.setHours(0, 0, 0, 0)
      }
      break
    case 'month':
      if (type === 'calendar') {
        return getStartOfMonth(date)
      } else {
        // Last 30 days (rolling period)
        start.setDate(start.getDate() - 30)
        start.setHours(0, 0, 0, 0)
      }
      break
    case 'year':
      if (type === 'calendar') {
        return getStartOfYear(date)
      } else {
        // Last 365 days (rolling period)
        start.setDate(start.getDate() - 365)
        start.setHours(0, 0, 0, 0)
      }
      break
  }
  
  return start
}

function getPeriodEndDate(date: Date, period: string, type: 'toDate' | 'calendar' = 'toDate'): Date {
  if (type === 'calendar') {
    switch (period) {
      case 'week':
        return getEndOfWeek(date)
      case 'month':
        return getEndOfMonth(date)
      case 'year':
        return getEndOfYear(date)
      default:
        const end = new Date(date)
        end.setHours(23, 59, 59, 999)
        return end
    }
  }
  
  // For 'toDate' or 'today', return end of today
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)
  return end
}

function getPreviousPeriod(date: Date, period: string, type: 'toDate' | 'calendar' = 'toDate'): Date {
  const previous = new Date(date)
  
  if (type === 'calendar') {
    switch (period) {
      case 'week':
        previous.setDate(previous.getDate() - 7)
        return previous
      case 'month':
        previous.setMonth(previous.getMonth() - 1)
        return previous
      case 'year':
        previous.setFullYear(previous.getFullYear() - 1)
        return previous
      default:
        previous.setDate(previous.getDate() - 1)
        return previous
    }
  }
  
  // For 'toDate' periods (rolling periods)
  switch (period) {
    case 'today':
      previous.setDate(previous.getDate() - 1)
      break
    case 'week':
      // Previous 7-day period (14 days ago to 7 days ago)
      previous.setDate(previous.getDate() - 14)
      break
    case 'month':
      // Previous 30-day period (60 days ago to 30 days ago)
      previous.setDate(previous.getDate() - 60)
      break
    case 'year':
      // Previous 365-day period (730 days ago to 365 days ago)
      previous.setDate(previous.getDate() - 730)
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
  const now = new Date()
  const period = selectedPeriod.value
  const type = periodType.value
  const startDate = getPeriodStartDate(now, period, type)
  const endDate = getPeriodEndDate(now, period, type)
  const periodOrders = getOrdersForPeriod(now, period)
  
  const data: number[] = []
  const labels: string[] = []
  
  if (period === 'today') {
    // Show hourly data for today
    for (let hour = 0; hour < 24; hour++) {
      const hourStart = new Date(startDate)
      hourStart.setHours(hour, 0, 0, 0)
      const hourEnd = new Date(startDate)
      hourEnd.setHours(hour, 59, 59, 999)
      
      const hourOrders = periodOrders.filter(order => {
        if (!order.created_at) return false
        const orderDate = new Date(order.created_at)
        return orderDate >= hourStart && orderDate <= hourEnd
      })
      
      const hourSales = hourOrders.reduce((sum, order) => sum + order.total_amount, 0)
      data.push(hourSales)
      labels.push(`${hour}:00`)
    }
  } else if (period === 'week') {
    if (type === 'calendar') {
      // Show daily data for Monday-Sunday of current week
      const weekStart = getStartOfWeek(now)
      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart)
        date.setDate(date.getDate() + i)
        date.setHours(0, 0, 0, 0)
        const dayEnd = new Date(date)
        dayEnd.setHours(23, 59, 59, 999)
        
        const dayOrders = periodOrders.filter(order => {
          if (!order.created_at) return false
          const orderDate = new Date(order.created_at)
          return orderDate >= date && orderDate <= dayEnd
        })
        
        const daySales = dayOrders.reduce((sum, order) => sum + order.total_amount, 0)
        data.push(daySales)
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }))
      }
    } else {
      // Show daily data for last 7 days (toDate)
      for (let i = 6; i >= 0; i--) {
        const date = new Date(endDate)
        date.setDate(date.getDate() - i)
        date.setHours(0, 0, 0, 0)
        const dayEnd = new Date(date)
        dayEnd.setHours(23, 59, 59, 999)
        
        const dayOrders = periodOrders.filter(order => {
          if (!order.created_at) return false
          const orderDate = new Date(order.created_at)
          return orderDate >= date && orderDate <= dayEnd
        })
        
        const daySales = dayOrders.reduce((sum, order) => sum + order.total_amount, 0)
        data.push(daySales)
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }))
      }
    }
  } else if (period === 'month') {
    if (type === 'calendar') {
      // Show weekly data for the full month (4 weeks)
      const monthStart = getStartOfMonth(now)
      const monthEnd = getEndOfMonth(now)
      
      // Define 4 weeks
      const weeks = [
        { start: 1, end: 7, label: 'Week 1' },
        { start: 8, end: 14, label: 'Week 2' },
        { start: 15, end: 21, label: 'Week 3' },
        { start: 22, end: monthEnd.getDate(), label: 'Week 4' }
      ]
      
      weeks.forEach(week => {
        const weekStart = new Date(monthStart)
        weekStart.setDate(week.start)
        weekStart.setHours(0, 0, 0, 0)
        
        const weekEnd = new Date(monthStart)
        weekEnd.setDate(week.end)
        weekEnd.setHours(23, 59, 59, 999)
        
        const weekOrders = periodOrders.filter(order => {
          if (!order.created_at) return false
          const orderDate = new Date(order.created_at)
          return orderDate >= weekStart && orderDate <= weekEnd
        })
        
        const weekSales = weekOrders.reduce((sum, order) => sum + order.total_amount, 0)
        data.push(weekSales)
        labels.push(week.label)
      })
    } else {
      // Show daily data for last 30 days (rolling period)
      for (let i = 29; i >= 0; i--) {
        const date = new Date(endDate)
        date.setDate(date.getDate() - i)
        date.setHours(0, 0, 0, 0)
        const dayEnd = new Date(date)
        dayEnd.setHours(23, 59, 59, 999)
        
        const dayOrders = periodOrders.filter(order => {
          if (!order.created_at) return false
          const orderDate = new Date(order.created_at)
          return orderDate >= date && orderDate <= dayEnd
        })
        
        const daySales = dayOrders.reduce((sum, order) => sum + order.total_amount, 0)
        data.push(daySales)
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
      }
    }
  } else if (period === 'year') {
    if (type === 'calendar') {
      // Show monthly data for all 12 months of current year
      const yearStart = getStartOfYear(now)
      for (let month = 0; month < 12; month++) {
        const monthStart = new Date(yearStart)
        monthStart.setMonth(month, 1)
        monthStart.setHours(0, 0, 0, 0)
        const monthEnd = new Date(yearStart)
        monthEnd.setMonth(month + 1, 0)
        monthEnd.setHours(23, 59, 59, 999)
        
        const monthOrders = periodOrders.filter(order => {
          if (!order.created_at) return false
          const orderDate = new Date(order.created_at)
          return orderDate >= monthStart && orderDate <= monthEnd
        })
        
        const monthSales = monthOrders.reduce((sum, order) => sum + order.total_amount, 0)
        data.push(monthSales)
        labels.push(monthStart.toLocaleDateString('en-US', { month: 'short' }))
      }
    } else {
      // Show monthly data for last 12 months (rolling period)
      for (let i = 11; i >= 0; i--) {
        // Calculate month start (i months ago)
        const monthStart = new Date(endDate)
        monthStart.setMonth(monthStart.getMonth() - i, 1)
        monthStart.setHours(0, 0, 0, 0)
        
        // Calculate month end
        const monthEnd = new Date(monthStart)
        if (i === 0) {
          // Current month ends today
          monthEnd.setTime(endDate.getTime())
        } else {
          // Previous months end on last day of that month
          monthEnd.setMonth(monthEnd.getMonth() + 1, 0)
        }
        monthEnd.setHours(23, 59, 59, 999)
        
        const monthOrders = periodOrders.filter(order => {
          if (!order.created_at) return false
          const orderDate = new Date(order.created_at)
          return orderDate >= monthStart && orderDate <= monthEnd
        })
        
        const monthSales = monthOrders.reduce((sum, order) => sum + order.total_amount, 0)
        data.push(monthSales)
        labels.push(monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }))
      }
    }
  }
  
  return { data, labels }
}

function getExpensesChartData() {
  const now = new Date()
  const period = selectedPeriod.value
  const type = periodType.value
  const startDate = getPeriodStartDate(now, period, type)
  const endDate = getPeriodEndDate(now, period, type)
  const periodExpenses = getExpensesForPeriod(now, period)
  
  const data: number[] = []
  const labels: string[] = []
  
  const formatLocalDate = (d: Date): string => {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  if (period === 'today') {
    // Show hourly data for today
    for (let hour = 0; hour < 24; hour++) {
      const hourStart = new Date(startDate)
      hourStart.setHours(hour, 0, 0, 0)
      const hourEnd = new Date(startDate)
      hourEnd.setHours(hour, 59, 59, 999)
      
      const hourExpenses = periodExpenses.filter(expense => {
        const expenseDate = new Date(expense.expense_date)
        return expenseDate >= hourStart && expenseDate <= hourEnd
      })
      
      const hourExpenseTotal = calculateTotalExpenses(hourExpenses)
      data.push(hourExpenseTotal)
      labels.push(`${hour}:00`)
    }
  } else if (period === 'week') {
    if (type === 'calendar') {
      // Show daily data for Monday-Sunday of current week
      const weekStart = getStartOfWeek(now)
      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart)
        date.setDate(date.getDate() + i)
        date.setHours(0, 0, 0, 0)
        const dayEnd = new Date(date)
        dayEnd.setHours(23, 59, 59, 999)
        
        const dayExpenses = filterExpensesByDateRange(
          periodExpenses,
          formatLocalDate(date),
          formatLocalDate(dayEnd)
        )
        
        const dayExpenseTotal = calculateTotalExpenses(dayExpenses)
        data.push(dayExpenseTotal)
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }))
      }
    } else {
      // Show daily data for last 7 days (toDate)
      for (let i = 6; i >= 0; i--) {
        const date = new Date(endDate)
        date.setDate(date.getDate() - i)
        date.setHours(0, 0, 0, 0)
        const dayEnd = new Date(date)
        dayEnd.setHours(23, 59, 59, 999)
        
        const dayExpenses = filterExpensesByDateRange(
          periodExpenses,
          formatLocalDate(date),
          formatLocalDate(dayEnd)
        )
        
        const dayExpenseTotal = calculateTotalExpenses(dayExpenses)
        data.push(dayExpenseTotal)
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }))
      }
    }
  } else if (period === 'month') {
    if (type === 'calendar') {
      // Show weekly data for the full month (4 weeks)
      const monthStart = getStartOfMonth(now)
      const monthEnd = getEndOfMonth(now)
      
      // Define 4 weeks
      const weeks = [
        { start: 1, end: 7, label: 'Week 1' },
        { start: 8, end: 14, label: 'Week 2' },
        { start: 15, end: 21, label: 'Week 3' },
        { start: 22, end: monthEnd.getDate(), label: 'Week 4' }
      ]
      
      weeks.forEach(week => {
        const weekStart = new Date(monthStart)
        weekStart.setDate(week.start)
        weekStart.setHours(0, 0, 0, 0)
        
        const weekEnd = new Date(monthStart)
        weekEnd.setDate(week.end)
        weekEnd.setHours(23, 59, 59, 999)
        
        const weekExpenses = filterExpensesByDateRange(
          periodExpenses,
          formatLocalDate(weekStart),
          formatLocalDate(weekEnd)
        )
        
        const weekExpenseTotal = calculateTotalExpenses(weekExpenses)
        data.push(weekExpenseTotal)
        labels.push(week.label)
      })
    } else {
      // Show daily data for last 30 days (rolling period)
      for (let i = 29; i >= 0; i--) {
        const date = new Date(endDate)
        date.setDate(date.getDate() - i)
        date.setHours(0, 0, 0, 0)
        const dayEnd = new Date(date)
        dayEnd.setHours(23, 59, 59, 999)
        
        const dayExpenses = filterExpensesByDateRange(
          periodExpenses,
          formatLocalDate(date),
          formatLocalDate(dayEnd)
        )
        
        const dayExpenseTotal = calculateTotalExpenses(dayExpenses)
        data.push(dayExpenseTotal)
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
      }
    }
  } else if (period === 'year') {
    if (type === 'calendar') {
      // Show monthly data for all 12 months of current year
      const yearStart = getStartOfYear(now)
      for (let month = 0; month < 12; month++) {
        const monthStart = new Date(yearStart)
        monthStart.setMonth(month, 1)
        monthStart.setHours(0, 0, 0, 0)
        const monthEnd = new Date(yearStart)
        monthEnd.setMonth(month + 1, 0)
        monthEnd.setHours(23, 59, 59, 999)
        
        const monthExpenses = filterExpensesByDateRange(
          periodExpenses,
          formatLocalDate(monthStart),
          formatLocalDate(monthEnd)
        )
        
        const monthExpenseTotal = calculateTotalExpenses(monthExpenses)
        data.push(monthExpenseTotal)
        labels.push(monthStart.toLocaleDateString('en-US', { month: 'short' }))
      }
    } else {
      // Show monthly data for last 12 months (rolling period)
      for (let i = 11; i >= 0; i--) {
        // Calculate month start (i months ago)
        const monthStart = new Date(endDate)
        monthStart.setMonth(monthStart.getMonth() - i, 1)
        monthStart.setHours(0, 0, 0, 0)
        
        // Calculate month end
        const monthEnd = new Date(monthStart)
        if (i === 0) {
          // Current month ends today
          monthEnd.setTime(endDate.getTime())
        } else {
          // Previous months end on last day of that month
          monthEnd.setMonth(monthEnd.getMonth() + 1, 0)
        }
        monthEnd.setHours(23, 59, 59, 999)
        
        const monthExpenses = filterExpensesByDateRange(
          periodExpenses,
          formatLocalDate(monthStart),
          formatLocalDate(monthEnd)
        )
        
        const monthExpenseTotal = calculateTotalExpenses(monthExpenses)
        data.push(monthExpenseTotal)
        labels.push(monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }))
      }
    }
  }
  
  return { data, labels }
}

function getProfitChartData() {
  const salesData = getSalesChartData()
  const expensesData = getExpensesChartData()
  
  // Ensure both arrays have the same length
  const maxLength = Math.max(salesData.data.length, expensesData.data.length)
  const profitData: number[] = []
  
  for (let i = 0; i < maxLength; i++) {
    const sales = salesData.data[i] || 0
    const expenses = expensesData.data[i] || 0
    profitData.push(sales - expenses)
  }
  
  return {
    data: profitData,
    labels: salesData.labels
  }
}

function getExpenseChartData() {
  const now = new Date()
  const periodExpenses = getExpensesForPeriod(now, selectedPeriod.value)
  const expenseByCategory = calculateExpensesByCategory(periodExpenses)
  
  return {
    labels: Object.keys(expenseByCategory),
    data: Object.values(expenseByCategory)
  }
}

function getTopItemsData() {
  const now = new Date()
  const periodOrders = getOrdersForPeriod(now, selectedPeriod.value)
  
  // Get completed order IDs for the selected period
  const completedOrderIds = new Set(
    periodOrders
      .filter(order => order.status === 'completed')
      .map(order => order.id)
  )
  
  // Calculate top selling items from order items data
  const itemCounts: Record<string, number> = {}
  
  // Count quantities for each menu item from completed orders in the selected period only
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

function getTopRevenueItemsData() {
  const now = new Date()
  const periodOrders = getOrdersForPeriod(now, selectedPeriod.value)
  
  // Get completed order IDs for the selected period
  const completedOrderIds = new Set(
    periodOrders
      .filter(order => order.status === 'completed')
      .map(order => order.id)
  )
  
  // Calculate revenue and profit per menu item
  const itemRevenue: Record<string, number> = {}
  const itemProfit: Record<string, number> = {}
  const itemQuantity: Record<string, number> = {}
  
  // Calculate revenue and profit for each menu item from completed orders
  orderItems.value.forEach(orderItem => {
    const menuItemId = orderItem.menu_id
    if (menuItemId && orderItem.order_id && completedOrderIds.has(orderItem.order_id)) {
      // Revenue is the subtotal (price * quantity)
      const revenue = orderItem.subtotal || 0
      itemRevenue[menuItemId] = (itemRevenue[menuItemId] || 0) + revenue
      itemQuantity[menuItemId] = (itemQuantity[menuItemId] || 0) + orderItem.quantity
      
      // Calculate cost per order for this menu item
      const costPerOrder = computeCostPerOrderForMenuItem(recipeMaps.value, menuItemId)
      const totalCost = costPerOrder * orderItem.quantity
      const profit = revenue - totalCost
      
      itemProfit[menuItemId] = (itemProfit[menuItemId] || 0) + profit
    }
  })
  
  // Sort by revenue and get top 5
  const sortedItems = Object.entries(itemRevenue)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
  
  // Get menu item names and create labels/data/profit arrays
  const labels: string[] = []
  const data: number[] = []
  const profits: number[] = []
  
  sortedItems.forEach(([menuItemId, revenue]) => {
    const menuItem = menuItems.value.find(item => item.id === menuItemId)
    if (menuItem) {
      labels.push(menuItem.name)
      data.push(revenue)
      profits.push(itemProfit[menuItemId] || 0)
    }
  })
  
  // If no data, return empty arrays
  if (labels.length === 0) {
    return {
      labels: ['No revenue data'],
      data: [0],
      profits: [0]
    }
  }
  
  return { labels, data, profits }
}

function getPaymentMethodsData() {
  const now = new Date()
  const periodOrders = getOrdersForPeriod(now, selectedPeriod.value)
  
  // Filter only completed orders
  const completedOrders = periodOrders.filter(order => order.status === 'completed')
  
  // Calculate total amount per payment method
  const paymentMethodAmounts: Record<string, number> = {}
  
  completedOrders.forEach(order => {
    if (order.payment_method) {
      const method = order.payment_method
      paymentMethodAmounts[method] = (paymentMethodAmounts[method] || 0) + order.total_amount
    }
  })
  
  // Format labels (capitalize first letter)
  const formatLabel = (method: string): string => {
    return method.charAt(0).toUpperCase() + method.slice(1)
  }
  
  const labels = Object.keys(paymentMethodAmounts).map(formatLabel)
  const data = Object.values(paymentMethodAmounts)
  
  // If no data, return empty arrays
  if (labels.length === 0) {
    return {
      labels: ['No payment data'],
      data: [0]
    }
  }
  
  return { labels, data }
}

// Get all items with sales data (not just top 5)
const allItemsSales = computed(() => {
  const now = new Date()
  const periodOrders = getOrdersForPeriod(now, selectedPeriod.value)
  
  // Get completed order IDs for the selected period
  const completedOrderIds = new Set(
    periodOrders
      .filter(order => order.status === 'completed')
      .map(order => order.id)
  )
  
  const itemCounts: Record<string, number> = {}
  
  // Count quantities for each menu item from completed orders in the selected period only
  orderItems.value.forEach(orderItem => {
    const menuItemId = orderItem.menu_id
    if (menuItemId && orderItem.order_id && completedOrderIds.has(orderItem.order_id)) {
      itemCounts[menuItemId] = (itemCounts[menuItemId] || 0) + orderItem.quantity
    }
  })
  
  // Convert to array and sort by quantity
  const itemsWithSales = Object.entries(itemCounts)
    .map(([menuItemId, quantity]) => {
      const menuItem = menuItems.value.find(item => item.id === menuItemId)
      return {
        menuItemId,
        name: menuItem?.name || 'Unknown Item',
        quantity
      }
    })
    .filter(item => item.name !== 'Unknown Item')
    .sort((a, b) => b.quantity - a.quantity)
  
  return itemsWithSales
})

// Get all items with revenue data (not just top 5)
const allItemsRevenue = computed(() => {
  const now = new Date()
  const periodOrders = getOrdersForPeriod(now, selectedPeriod.value)
  
  // Get completed order IDs for the selected period
  const completedOrderIds = new Set(
    periodOrders
      .filter(order => order.status === 'completed')
      .map(order => order.id)
  )
  
  // Calculate revenue and profit per menu item
  const itemRevenue: Record<string, number> = {}
  const itemProfit: Record<string, number> = {}
  const itemQuantity: Record<string, number> = {}
  
  // Calculate revenue and profit for each menu item from completed orders
  orderItems.value.forEach(orderItem => {
    const menuItemId = orderItem.menu_id
    if (menuItemId && orderItem.order_id && completedOrderIds.has(orderItem.order_id)) {
      // Revenue is the subtotal (price * quantity)
      const revenue = orderItem.subtotal || 0
      itemRevenue[menuItemId] = (itemRevenue[menuItemId] || 0) + revenue
      itemQuantity[menuItemId] = (itemQuantity[menuItemId] || 0) + orderItem.quantity
      
      // Calculate cost per order for this menu item
      const costPerOrder = computeCostPerOrderForMenuItem(recipeMaps.value, menuItemId)
      const totalCost = costPerOrder * orderItem.quantity
      const profit = revenue - totalCost
      
      itemProfit[menuItemId] = (itemProfit[menuItemId] || 0) + profit
    }
  })
  
  // Convert to array and sort by selected column
  const itemsWithRevenue = Object.entries(itemRevenue)
    .map(([menuItemId, revenue]) => {
      const menuItem = menuItems.value.find(item => item.id === menuItemId)
      return {
        menuItemId,
        name: menuItem?.name || 'Unknown Item',
        revenue,
        profit: itemProfit[menuItemId] || 0,
        quantity: itemQuantity[menuItemId] || 0
      }
    })
    .filter(item => item.name !== 'Unknown Item')
    .sort((a, b) => {
      let comparison = 0
      if (revenueItemsSortColumn.value === 'revenue') {
        comparison = a.revenue - b.revenue
      } else if (revenueItemsSortColumn.value === 'profit') {
        comparison = a.profit - b.profit
      } else if (revenueItemsSortColumn.value === 'quantity') {
        comparison = a.quantity - b.quantity
      }
      return revenueItemsSortOrder.value === 'desc' ? -comparison : comparison
    })
  
  return itemsWithRevenue
})

// Get orders with item summaries for payment methods modal
const paymentMethodsOrders = computed(() => {
  const now = new Date()
  const periodOrders = getOrdersForPeriod(now, selectedPeriod.value)
  
  // Filter only completed orders
  const completedOrders = periodOrders.filter(order => order.status === 'completed')
  
  // Map orders to include item summaries
  const orders = completedOrders
    .filter(order => order.payment_method)
    .map(order => {
      const items = orderItems.value.filter(item => item.order_id === order.id)
      const itemsSummary = formatOrderItemsSummary(items)
      const date = formatOrderDate(order.created_at)
      const dateValue = order.created_at ? new Date(order.created_at).getTime() : 0
      
      return {
        id: order.id,
        date,
        dateValue,
        itemsSummary,
        paymentMethod: order.payment_method!,
        amount: order.total_amount
      }
    })
  
  // Sort by date
  return orders.sort((a, b) => {
    if (paymentMethodsSortOrder.value === 'desc') {
      return b.dateValue - a.dateValue
    } else {
      return a.dateValue - b.dateValue
    }
  })
})

// Helper function to format order items summary
function formatOrderItemsSummary(items: OrderItem[]): string {
  if (items.length === 0) return 'No items'
  
  const summaryParts: string[] = []
  
  items.forEach(item => {
    if (item.menu_id) {
      const menuItem = menuItems.value.find(mi => mi.id === item.menu_id)
      const itemName = menuItem?.name || 'Unknown Item'
      summaryParts.push(`${itemName} ×${item.quantity}`)
    }
  })
  
  return summaryParts.join(', ')
}

// Helper function to format payment method name
function formatPaymentMethod(method: string): string {
  return method.charAt(0).toUpperCase() + method.slice(1)
}

// Helper function to format order date as mm/dd/yyyy
function formatOrderDate(dateString: string | null): string {
  if (!dateString) return 'N/A'
  
  const date = new Date(dateString)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const year = date.getFullYear()
  
  return `${month}/${day}/${year}`
}

// Toggle sort order for payment methods orders
function togglePaymentMethodsSort() {
  paymentMethodsSortOrder.value = paymentMethodsSortOrder.value === 'desc' ? 'asc' : 'desc'
}

// Toggle sort for revenue items
function toggleRevenueItemsSort(column: 'revenue' | 'profit' | 'quantity') {
  if (revenueItemsSortColumn.value === column) {
    revenueItemsSortOrder.value = revenueItemsSortOrder.value === 'desc' ? 'asc' : 'desc'
  } else {
    revenueItemsSortColumn.value = column
    revenueItemsSortOrder.value = 'desc'
  }
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

// Chart line toggle function
function toggleChartLine(line: 'sales' | 'expenses' | 'profit') {
  chartVisibility.value[line] = !chartVisibility.value[line]
  
  // Update chart without recreating it
  if (salesChartInstance) {
    const datasetIndex = line === 'sales' ? 0 : line === 'expenses' ? 1 : 2
    const meta = salesChartInstance.getDatasetMeta(datasetIndex)
    meta.hidden = !chartVisibility.value[line]
    salesChartInstance.update()
  }
}

// Chart creation functions
function createSalesChart() {
  if (!salesChart.value) return
  
  // Destroy existing chart instance if it exists
  if (salesChartInstance) {
    salesChartInstance.destroy()
    salesChartInstance = null
  }
  
  const ctx = salesChart.value.getContext('2d')
  if (!ctx) return
  
  const salesData = dashboardData.value.salesData
  const expensesData = dashboardData.value.expensesData
  const profitData = dashboardData.value.profitData
  
  salesChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: salesData.labels,
      datasets: [
        {
          label: 'Sales',
          data: salesData.data,
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          hidden: !chartVisibility.value.sales
        },
        {
          label: 'Expenses',
          data: expensesData.data,
          borderColor: '#dc3545',
          backgroundColor: 'rgba(220, 53, 69, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          hidden: !chartVisibility.value.expenses
        },
        {
          label: 'Profit',
          data: profitData.data,
          borderColor: '#28a745',
          backgroundColor: 'rgba(40, 167, 69, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          hidden: !chartVisibility.value.profit
        }
      ]
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
  
  // Destroy existing chart instance if it exists
  if (expenseChartInstance) {
    expenseChartInstance.destroy()
    expenseChartInstance = null
  }
  
  const ctx = expenseChart.value.getContext('2d')
  if (!ctx) return
  
  const chartData = dashboardData.value.expenseData
  
  expenseChartInstance = new Chart(ctx, {
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
  
  // Destroy existing chart instance if it exists
  if (topItemsChartInstance) {
    topItemsChartInstance.destroy()
    topItemsChartInstance = null
  }
  
  const ctx = topItemsChart.value.getContext('2d')
  if (!ctx) return
  
  const chartData = dashboardData.value.topItemsData
  
  topItemsChartInstance = new Chart(ctx, {
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

function createTopRevenueChart() {
  if (!topRevenueChart.value) return
  
  // Destroy existing chart instance if it exists
  if (topRevenueChartInstance) {
    topRevenueChartInstance.destroy()
    topRevenueChartInstance = null
  }
  
  const ctx = topRevenueChart.value.getContext('2d')
  if (!ctx) return
  
  const chartData = dashboardData.value.topRevenueData
  
  topRevenueChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: chartData.labels,
      datasets: [{
        label: 'Revenue',
        data: chartData.data,
        backgroundColor: '#43e97b',
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || ''
              const revenue = context.raw || 0
              const index = context.dataIndex
              const profit = chartData.profits[index] || 0
              return [
                `${label}: ₱${Number(revenue).toLocaleString()}`,
                `Profit: ₱${profit.toLocaleString()}`
              ]
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            maxRotation: 45,
            minRotation: 45,
            callback: function(_value, index) {
              const label = chartData.labels[index]
              if (!label) return ''
              // Truncate to 20 characters and add ellipsis
              return label.length > 20 ? label.substring(0, 20) + '...' : label
            }
          }
        },
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

function createPaymentMethodsChart() {
  if (!paymentMethodsChart.value) return
  
  // Destroy existing chart instance if it exists
  if (paymentMethodsChartInstance) {
    paymentMethodsChartInstance.destroy()
    paymentMethodsChartInstance = null
  }
  
  const ctx = paymentMethodsChart.value.getContext('2d')
  if (!ctx) return
  
  const chartData = dashboardData.value.paymentMethodsData
  
  paymentMethodsChartInstance = new Chart(ctx, {
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
          '#00f2fe',
          '#43e97b'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || ''
              const value = context.parsed || 0
              return `${label}: ₱${value.toLocaleString()}`
            }
          }
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
    const [ordersData, expensesData, inventoryData, menuItemsData, recipeMapsData] = await Promise.all([
      OrderService.getOrders(),
      expenseService.getAll(),
      inventoryService.getAll(),
      menuItemService.getMenuItems(),
      recipeMapService.getRecipeMaps()
    ])
    
    orders.value = ordersData
    expenses.value = expensesData
    inventory.value = inventoryData
    menuItems.value = menuItemsData
    recipeMaps.value = recipeMapsData
    
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

// Function to recreate all charts
async function recreateCharts() {
  await nextTick()
  createSalesChart()
  createExpenseChart()
  createTopItemsChart()
  createTopRevenueChart()
  createPaymentMethodsChart()
}

// Watch for period changes and recreate charts
watch(selectedPeriod, async () => {
  await recreateCharts()
})

// Watch for period type changes and recreate charts
watch(periodType, async () => {
  await recreateCharts()
})

// Lifecycle
onMounted(async () => {
  await loadDashboardData()
  
  // Create charts after data is loaded and DOM is updated
  await recreateCharts()
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

.period-controls {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: flex-end;
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

.period-type-selector {
  display: flex;
  gap: 0.5rem;
  background: #f8f9fa;
  padding: 0.25rem;
  border-radius: 8px;
}

.period-type-btn {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.85rem;
  font-weight: 500;
  color: #6c757d;
}

.period-type-btn:hover {
  background: white;
}

.period-type-btn.active {
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

.stat-number-container {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin: 0 0 0.5rem 0;
}

.stat-number {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #343a40;
}

.stat-number-sub {
  margin: 0;
  font-size: 1rem;
  color: #6c757d;
  font-weight: 400;
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

.chart-subtitle {
  margin: 0.25rem 0 0 0;
  color: #6c757d;
  font-size: 0.85rem;
  font-weight: 500;
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
  cursor: pointer;
  user-select: none;
  transition: opacity 0.2s;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.legend-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.legend-item-disabled {
  opacity: 0.4;
  text-decoration: line-through;
}

.legend-item-disabled .legend-color {
  opacity: 0.4;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-color.sales {
  background: #667eea;
}

.legend-color.expenses {
  background: #dc3545;
}

.legend-color.profit {
  background: #28a745;
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
  
  .period-controls {
    width: 100%;
    align-items: stretch;
  }
  
  .period-selector,
  .period-type-selector {
    width: 100%;
    justify-content: center;
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

.payment-method-cell {
  font-weight: 500;
  color: #667eea;
  text-transform: capitalize;
}

.date-cell {
  font-weight: 500;
  color: #6c757d;
  white-space: nowrap;
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

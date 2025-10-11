<template>
  <div class="sales">
    <div class="sales-header">
      <h1>Sales Analytics</h1>
      <div class="date-range">
        <select v-model="selectedPeriod" class="period-select">
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>
    </div>
    
    <div class="sales-stats">
      <div class="stat-card">
        <div class="stat-header">
          <h3>Total Revenue</h3>
          <div class="stat-trend positive">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
              <polyline points="17 6 23 6 23 12"></polyline>
            </svg>
            +12.5%
          </div>
        </div>
        <div class="stat-value">$12,456.78</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-header">
          <h3>Orders</h3>
          <div class="stat-trend positive">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
              <polyline points="17 6 23 6 23 12"></polyline>
            </svg>
            +8.2%
          </div>
        </div>
        <div class="stat-value">234</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-header">
          <h3>Average Order</h3>
          <div class="stat-trend negative">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="1 18 10.5 8.5 15.5 13.5 23 6"></polyline>
              <polyline points="7 18 1 18 1 12"></polyline>
            </svg>
            -2.1%
          </div>
        </div>
        <div class="stat-value">$53.23</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-header">
          <h3>Top Product</h3>
          <div class="stat-trend neutral">
            <span>—</span>
          </div>
        </div>
        <div class="stat-value">Chocolate Bar</div>
      </div>
    </div>
    
    <div class="sales-content">
      <div class="chart-section">
        <h2>Sales Overview</h2>
        <div class="chart-placeholder">
          <div class="chart-bars">
            <div class="bar" style="height: 60%"></div>
            <div class="bar" style="height: 80%"></div>
            <div class="bar" style="height: 45%"></div>
            <div class="bar" style="height: 90%"></div>
            <div class="bar" style="height: 70%"></div>
            <div class="bar" style="height: 85%"></div>
            <div class="bar" style="height: 55%"></div>
          </div>
          <div class="chart-labels">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </div>
      </div>
      
      <div class="recent-orders">
        <h2>Recent Orders</h2>
        <div class="orders-list">
          <div class="order-item" v-for="order in recentOrders" :key="order.id">
            <div class="order-info">
              <div class="order-id">#{{ order.id }}</div>
              <div class="order-customer">{{ order.customer }}</div>
            </div>
            <div class="order-details">
              <div class="order-items">{{ order.items }} items</div>
              <div class="order-time">{{ order.time }}</div>
            </div>
            <div class="order-amount">${{ order.amount.toFixed(2) }}</div>
            <div class="order-status" :class="order.status">
              {{ order.status }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const selectedPeriod = ref('week')

const recentOrders = ref([
  { id: '1001', customer: 'John Doe', items: 3, amount: 45.99, time: '2 min ago', status: 'completed' },
  { id: '1002', customer: 'Jane Smith', items: 1, amount: 12.50, time: '5 min ago', status: 'completed' },
  { id: '1003', customer: 'Mike Johnson', items: 5, amount: 78.25, time: '8 min ago', status: 'processing' },
  { id: '1004', customer: 'Sarah Wilson', items: 2, amount: 23.75, time: '12 min ago', status: 'completed' },
  { id: '1005', customer: 'David Brown', items: 4, amount: 56.80, time: '15 min ago', status: 'pending' },
])
</script>

<style scoped>
.sales {
  padding: 0;
}

@media (max-width: 480px) {
  .sales {
    padding: 0;
  }
  
  .sales-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .sales-header h1 {
    font-size: 1.5rem;
  }
  
  .sales-stats {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .sales-content {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .chart-section,
  .recent-orders {
    padding: 1rem;
  }
  
  .chart-bars {
    height: 150px;
  }
  
  .bar {
    width: 25px;
  }
  
  .order-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .order-details {
    text-align: left;
  }
}

.sales-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.sales-header h1 {
  font-size: 2rem;
  color: #343a40;
  margin: 0;
}

.period-select {
  padding: 0.75rem 1rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background: white;
  font-size: 0.9rem;
  outline: none;
  cursor: pointer;
}

.sales-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.stat-header h3 {
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
  font-weight: 500;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  font-weight: 500;
}

.stat-trend.positive {
  color: #28a745;
}

.stat-trend.negative {
  color: #dc3545;
}

.stat-trend.neutral {
  color: #6c757d;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #343a40;
}

.sales-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.chart-section,
.recent-orders {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.chart-section h2,
.recent-orders h2 {
  margin: 0 0 1.5rem 0;
  color: #343a40;
  font-size: 1.3rem;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.chart-bars {
  display: flex;
  align-items: end;
  gap: 1rem;
  height: 200px;
}

.bar {
  width: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px 4px 0 0;
  min-height: 20px;
}

.chart-labels {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: #6c757d;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.order-info {
  flex: 1;
}

.order-id {
  font-weight: 600;
  color: #343a40;
  font-size: 0.9rem;
}

.order-customer {
  font-size: 0.8rem;
  color: #6c757d;
}

.order-details {
  flex: 1;
  text-align: center;
}

.order-items {
  font-size: 0.9rem;
  color: #343a40;
}

.order-time {
  font-size: 0.8rem;
  color: #6c757d;
}

.order-amount {
  font-weight: 600;
  color: #28a745;
  font-size: 1.1rem;
}

.order-status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: capitalize;
}

.order-status.completed {
  background: #d4edda;
  color: #155724;
}

.order-status.processing {
  background: #fff3cd;
  color: #856404;
}

.order-status.pending {
  background: #cce5ff;
  color: #004085;
}

@media (max-width: 480px) {
  .sales-content {
    grid-template-columns: 1fr;
  }
  
  .sales-stats {
    grid-template-columns: 1fr;
  }
}
</style>

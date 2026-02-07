<template>
  <div class="chart-card">
    <div class="chart-header">
      <h3>Payment Methods</h3>
      <button @click="$emit('viewOrders')" class="inventory-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M7 17L17 7M17 7H7M17 7V17"></path>
        </svg>
        View Orders
      </button>
    </div>
    <div class="chart-container">
      <div v-if="!hasOrderData" class="no-data-message">
        <p>No order data to show</p>
      </div>
      <canvas v-else ref="chartCanvas" width="400" height="200"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

interface Props {
  hasOrderData: boolean
  paymentMethodsData: { labels: string[]; data: number[] }
}

const props = defineProps<Props>()
defineEmits<{
  viewOrders: []
}>()

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

function createChart() {
  if (!chartCanvas.value) return
  
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
  
  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return
  
  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: props.paymentMethodsData.labels,
      datasets: [{
        data: props.paymentMethodsData.data,
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

watch(() => props.paymentMethodsData, () => {
  createChart()
}, { deep: true })

watch(() => props.hasOrderData, (val) => {
  if (val) nextTick(() => createChart())
  else if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})

onMounted(() => {
  createChart()
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})
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

.chart-container {
  position: relative;
  height: 200px;
}

.no-data-message {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  text-align: center;
}

.no-data-message p {
  margin: 0;
  color: #6b7280;
  font-size: 1rem;
  font-weight: 500;
}
</style>

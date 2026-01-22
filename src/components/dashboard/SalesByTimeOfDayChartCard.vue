<template>
  <div class="chart-card">
    <div class="chart-header">
      <h3>Sales by Time of Day</h3>
      <div v-if="salesByTimeOfDayData.available" class="chart-view-toggle">
        <button
          @click="view = 'total'; updateChart()"
          :class="['toggle-btn', { active: view === 'total' }]"
        >
          Total
        </button>
        <button
          @click="view = 'average'; updateChart()"
          :class="['toggle-btn', { active: view === 'average' }]"
        >
          Average
        </button>
      </div>
    </div>
    <div class="chart-container">
      <div v-if="!salesByTimeOfDayData.available" class="no-data-message">
        <p>Not Available</p>
        <p class="no-data-subtitle">No sales data available for this period</p>
      </div>
      <canvas v-else ref="chartCanvas" width="400" height="200"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

interface Props {
  salesByTimeOfDayData: {
    available: boolean
    labels: string[]
    totals: number[]
    averages: number[]
  }
}

const props = defineProps<Props>()

const chartCanvas = ref<HTMLCanvasElement | null>(null)
const view = ref<'total' | 'average'>('total')
let chartInstance: Chart | null = null

function createChart() {
  if (!chartCanvas.value) return
  
  const chartData = props.salesByTimeOfDayData
  if (!chartData.available) return
  
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
  
  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return
  
  const isTotalView = view.value === 'total'
  const dataset = {
    label: isTotalView ? 'Total Sales' : 'Average Sales',
    data: isTotalView ? chartData.totals : chartData.averages,
    backgroundColor: isTotalView ? '#667eea' : '#43e97b',
    borderRadius: 4
  }
  
  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: chartData.labels,
      datasets: [dataset]
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
              const label = isTotalView ? 'Total Sales' : 'Average Sales'
              const value = context.parsed.y || 0
              return `${label}: ₱${value.toLocaleString()}`
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
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

function updateChart() {
  if (!chartInstance || !chartCanvas.value) return
  
  const chartData = props.salesByTimeOfDayData
  if (!chartData.available) return
  
  const isTotalView = view.value === 'total'
  
  const dataset = chartInstance.data.datasets[0]
  if (dataset) {
    dataset.label = isTotalView ? 'Total Sales' : 'Average Sales'
    dataset.data = isTotalView ? chartData.totals : chartData.averages
    dataset.backgroundColor = isTotalView ? '#667eea' : '#43e97b'
  }
  
  const plugins = chartInstance.options.plugins
  if (plugins && plugins.tooltip && plugins.tooltip.callbacks) {
    plugins.tooltip.callbacks.label = function(context: any) {
      const label = isTotalView ? 'Total Sales' : 'Average Sales'
      const value = context.parsed.y || 0
      return `${label}: ₱${value.toLocaleString()}`
    }
  }
  
  chartInstance.update()
}

watch(() => props.salesByTimeOfDayData, () => {
  createChart()
}, { deep: true })

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

.chart-view-toggle {
  display: flex;
  gap: 0.5rem;
  background: #f8f9fa;
  padding: 0.25rem;
  border-radius: 8px;
}

.toggle-btn {
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

.toggle-btn:hover {
  background: white;
}

.toggle-btn.active {
  background: white;
  color: #667eea;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chart-container {
  position: relative;
  height: 200px;
}

.no-data-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  height: 200px;
}

.no-data-message p {
  margin: 0;
  color: #6b7280;
  font-size: 1rem;
  font-weight: 500;
}

.no-data-subtitle {
  margin-top: 0.5rem !important;
  font-size: 0.875rem !important;
  color: #9ca3af !important;
  font-weight: 400 !important;
}
</style>

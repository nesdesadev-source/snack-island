<template>
  <div class="chart-card">
    <div class="chart-header">
      <h3>Sales Trend</h3>
      <div class="chart-legend">
        <span 
          class="legend-item" 
          :class="{ 'legend-item-disabled': !chartVisibility.sales }"
          @click="toggleLine('sales')"
        >
          <span class="legend-color sales"></span>
          Sales
        </span>
        <span 
          class="legend-item"
          :class="{ 'legend-item-disabled': !chartVisibility.expenses }"
          @click="toggleLine('expenses')"
        >
          <span class="legend-color expenses"></span>
          Expenses
        </span>
        <span 
          class="legend-item"
          :class="{ 'legend-item-disabled': !chartVisibility.profit }"
          @click="toggleLine('profit')"
        >
          <span class="legend-color profit"></span>
          Profit
        </span>
      </div>
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
  salesData: { labels: string[]; data: number[] }
  expensesData: { labels: string[]; data: number[] }
  profitData: { labels: string[]; data: number[] }
  chartVisibility: { sales: boolean; expenses: boolean; profit: boolean }
}

const props = defineProps<Props>()
const emit = defineEmits<{
  toggleLine: [line: 'sales' | 'expenses' | 'profit']
}>()

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

function toggleLine(line: 'sales' | 'expenses' | 'profit') {
  emit('toggleLine', line)
}

function createChart() {
  if (!chartCanvas.value) return
  
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
  
  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return
  
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: props.salesData.labels,
      datasets: [
        {
          label: 'Sales',
          data: props.salesData.data,
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          hidden: !props.chartVisibility.sales
        },
        {
          label: 'Expenses',
          data: props.expensesData.data,
          borderColor: '#dc3545',
          backgroundColor: 'rgba(220, 53, 69, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          hidden: !props.chartVisibility.expenses
        },
        {
          label: 'Profit',
          data: props.profitData.data,
          borderColor: '#28a745',
          backgroundColor: 'rgba(40, 167, 69, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          hidden: !props.chartVisibility.profit
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

function updateChart() {
  if (!chartInstance) return
  
  const datasetIndex = (line: 'sales' | 'expenses' | 'profit') => {
    return line === 'sales' ? 0 : line === 'expenses' ? 1 : 2
  }
  
  const salesMeta = chartInstance.getDatasetMeta(datasetIndex('sales'))
  const expensesMeta = chartInstance.getDatasetMeta(datasetIndex('expenses'))
  const profitMeta = chartInstance.getDatasetMeta(datasetIndex('profit'))
  
  if (salesMeta) salesMeta.hidden = !props.chartVisibility.sales
  if (expensesMeta) expensesMeta.hidden = !props.chartVisibility.expenses
  if (profitMeta) profitMeta.hidden = !props.chartVisibility.profit
  
  chartInstance.update()
}

watch(() => props.chartVisibility, () => {
  updateChart()
}, { deep: true })

watch(() => [props.salesData, props.expensesData, props.profitData], () => {
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

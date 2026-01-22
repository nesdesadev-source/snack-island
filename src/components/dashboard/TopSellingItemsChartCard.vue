<template>
  <div class="chart-card">
    <div class="chart-header">
      <h3>Top Selling Items</h3>
      <button @click="$emit('viewAll')" class="inventory-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M7 17L17 7M17 7H7M17 7V17"></path>
        </svg>
        View All
      </button>
    </div>
    <div class="chart-container">
      <canvas ref="chartCanvas" width="400" height="200"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

interface Props {
  topItemsData: { labels: string[]; data: number[] }
}

const props = defineProps<Props>()
defineEmits<{
  viewAll: []
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
    type: 'bar',
    data: {
      labels: props.topItemsData.labels,
      datasets: [{
        label: 'Sales Count',
        data: props.topItemsData.data,
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

watch(() => props.topItemsData, () => {
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
</style>

<template>
  <div class="chart-card">
    <div class="chart-header">
      <h3>Expense Breakdown</h3>
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
  expenseData: { labels: string[]; data: number[] }
}

const props = defineProps<Props>()

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
      labels: props.expenseData.labels,
      datasets: [{
        data: props.expenseData.data,
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

watch(() => props.expenseData, () => {
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

.chart-container {
  position: relative;
  height: 200px;
}
</style>

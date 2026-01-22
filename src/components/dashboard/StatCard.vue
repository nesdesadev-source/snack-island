<template>
  <div class="stat-card">
    <div class="stat-icon" :class="iconClass">
      <slot name="icon"></slot>
    </div>
    <div class="stat-content">
      <h3>{{ title }}</h3>
      <p class="stat-number" :class="numberClass">
        <span v-if="prefix">{{ prefix }}</span>{{ formattedValue }}
      </p>
      <p v-if="subtitle" class="stat-number-sub">{{ subtitle }}</p>
      <div class="stat-trend" :class="trendClass">
        <span>{{ trend >= 0 ? '↗' : '↘' }}</span>
        {{ Math.abs(trend).toFixed(1) }}%
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  value: number | string
  trend: number
  iconClass: 'sales' | 'orders' | 'expenses' | 'profit'
  prefix?: string
  subtitle?: string
  invertTrend?: boolean
  showValueColor?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  prefix: '',
  subtitle: undefined,
  invertTrend: false,
  showValueColor: false
})

const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    return new Intl.NumberFormat('en-US').format(props.value)
  }
  return props.value
})

const trendClass = computed(() => {
  if (props.invertTrend) {
    return props.trend >= 0 ? 'negative' : 'positive'
  }
  return props.trend >= 0 ? 'positive' : 'negative'
})

const numberClass = computed(() => {
  if (!props.showValueColor) return ''
  if (typeof props.value === 'number') {
    return props.value >= 0 ? 'positive' : 'negative'
  }
  return ''
})
</script>

<style scoped>
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
</style>

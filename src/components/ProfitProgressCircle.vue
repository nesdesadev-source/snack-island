<template>
  <div class="profit-progress-circle" :class="{ 'urgent': isUrgent, 'gold': isGold }">
    <svg class="progress-svg" viewBox="0 0 120 120">
      <!-- Background circle -->
      <circle
        class="progress-bg"
        cx="60"
        cy="60"
        r="25"
        fill="none"
        stroke="#e5e5e5"
        stroke-width="8"
      />
      <!-- Progress circle -->
      <circle
        class="progress-circle"
        :class="[progressColorClass, { 'urgent-pulse': isUrgent, 'gold-pulse': isGold }]"
        cx="60"
        cy="60"
        r="25"
        fill="none"
        :stroke="progressColor"
        stroke-width="8"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        transform="rotate(-90 60 60)"
        style="transition: stroke-dashoffset 0.5s ease, stroke 0.3s ease;"
      />
      <!-- Mood icon (face), centered in circle -->
      <g class="mood-icon-wrap">
        <svg
          v-if="moodLevel === 'super-sad'"
          class="mood-icon"
          x="38"
          y="38"
          width="44"
          height="44"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="9" cy="9" r="1.5" fill="currentColor" />
          <circle cx="15" cy="9" r="1.5" fill="currentColor" />
          <path d="M7 17 Q12 13 17 17" />
        </svg>
        <svg
          v-else-if="moodLevel === 'frown'"
          class="mood-icon"
          x="38"
          y="38"
          width="44"
          height="44"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="9" cy="9" r="1.5" fill="currentColor" />
          <circle cx="15" cy="9" r="1.5" fill="currentColor" />
          <path d="M8 16 Q12 13 16 16" />
        </svg>
        <svg
          v-else-if="moodLevel === 'neutral'"
          class="mood-icon"
          x="38"
          y="38"
          width="44"
          height="44"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        >
          <circle cx="9" cy="9" r="1.5" fill="currentColor" />
          <circle cx="15" cy="9" r="1.5" fill="currentColor" />
          <line x1="8" y1="16" x2="16" y2="16" />
        </svg>
        <svg
          v-else-if="moodLevel === 'smile'"
          class="mood-icon"
          x="38"
          y="38"
          width="44"
          height="44"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="9" cy="9" r="1.5" fill="currentColor" />
          <circle cx="15" cy="9" r="1.5" fill="currentColor" />
          <path d="M8 15 Q12 18 16 15" />
        </svg>
        <svg
          v-else
          class="mood-icon"
          x="38"
          y="38"
          width="44"
          height="44"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="9" cy="9" r="1.5" fill="currentColor" />
          <circle cx="15" cy="9" r="1.5" fill="currentColor" />
          <path d="M7 14 Q12 20 17 14" />
        </svg>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  profit: number
}>()

const GOAL = 650
const RED_THRESHOLD = 570
const ORANGE_THRESHOLD = 650
const GOLD_THRESHOLD = 999

const circumference = 2 * Math.PI * 25 // 2πr where r = 25

const isUrgent = computed(() => {
  return props.profit < 0
})

const isGold = computed(() => {
  return props.profit > GOLD_THRESHOLD
})

const progressPercentage = computed(() => {
  if (props.profit <= 0) return 100;
  const profit = Math.max(props.profit, 0) // Ensure non-negative
  return Math.min((profit / GOAL) * 100, 100)
})

const dashOffset = computed(() => {
  const progress = Math.max(progressPercentage.value / 100, 0) // Ensure non-negative
  return circumference * (1 - progress)
})

const progressColor = computed(() => {
  const profit = props.profit
  if (profit <= 0) {
    return '#c41e3a' // Urgent dark red
  } else if (profit > GOLD_THRESHOLD) {
    return '#6b21a8' // Rich violet
  } else if (profit < RED_THRESHOLD) {
    return '#dc3545' // Red
  } else if (profit < ORANGE_THRESHOLD) {
    return '#ff9500' // Orange
  } else {
    return '#34c759' // Green
  }
})

const progressColorClass = computed(() => {
  const profit = props.profit
  if (profit <= 0) {
    return 'color-urgent'
  } else if (profit > GOLD_THRESHOLD) {
    return 'color-gold'
  } else if (profit < RED_THRESHOLD) {
    return 'color-red'
  } else if (profit < ORANGE_THRESHOLD) {
    return 'color-orange'
  } else {
    return 'color-green'
  }
})

type MoodLevel = 'super-sad' | 'frown' | 'neutral' | 'smile' | 'super-happy'

const moodLevel = computed<MoodLevel>(() => {
  const profit = props.profit
  if (profit < 0) return 'super-sad'
  if (profit < RED_THRESHOLD) return 'frown'
  if (profit < ORANGE_THRESHOLD) return 'neutral'
  if (profit < GOLD_THRESHOLD) return 'smile'
  return 'super-happy'
})

</script>

<style scoped>
.profit-progress-circle {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.progress-svg {
  width: 100%;
  height: 100%;
  transform: rotate(0deg);
}

.progress-bg {
  opacity: 0.2;
}

.progress-circle {
  transition: stroke-dashoffset 0.5s ease, stroke 0.3s ease;
}

.mood-icon-wrap {
  pointer-events: none;
}

.mood-icon {
  overflow: visible;
  color: inherit;
}

.profit-progress-circle.urgent {
  animation: urgent-glow 2s ease-in-out infinite;
}

.profit-progress-circle.gold {
  animation: gold-glow 2s ease-in-out infinite;
}

.progress-circle.urgent-pulse {
  animation: urgent-pulse 1.5s ease-in-out infinite;
  filter: drop-shadow(0 0 4px currentColor);
}

.progress-circle.gold-pulse {
  animation: gold-pulse 1.5s ease-in-out infinite;
  filter: drop-shadow(0 0 6px #ffd700);
}

@keyframes urgent-glow {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.05);
  }
}

@keyframes urgent-pulse {
  0%, 100% {
    opacity: 1;
    stroke-width: 8;
  }
  50% {
    opacity: 0.8;
    stroke-width: 10;
  }
}

@keyframes gold-glow {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.95;
    transform: scale(1.08);
  }
}

@keyframes gold-pulse {
  0%, 100% {
    opacity: 1;
    stroke-width: 8;
  }
  50% {
    opacity: 0.9;
    stroke-width: 10;
  }
}

@media (max-width: 768px) {
  .profit-progress-circle {
    width: 56px;
    height: 56px;
  }
}

@media (max-width: 480px) {
  .profit-progress-circle {
    width: 48px;
    height: 48px;
  }
}
</style>

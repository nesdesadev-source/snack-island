<template>
  <div class="dashboard-content">
    <div class="content-section">
      <h2>Recent Activity</h2>
      <div class="activity-list">
        <div class="activity-item" v-for="activity in recentActivity" :key="activity.id">
          <div class="activity-icon">{{ activity.icon }}</div>
          <div class="activity-content">
            <p><strong>{{ activity.title }}</strong> {{ activity.description }}</p>
            <span class="activity-time">{{ activity.time }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Activity {
  id: string
  icon: string
  title: string
  description: string
  time: string
}

interface Props {
  recentActivity: Activity[]
}

defineProps<Props>()
</script>

<style scoped>
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
</style>

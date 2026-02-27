<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="isOpen"
        class="logs-modal-overlay"
        @click.self="handleClose"
      >
        <div class="logs-modal-container" @click.stop>
          <div class="logs-modal-header">
            <div class="logs-header-content">
              <div class="logs-header-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9"></path>
                  <path d="M9 3v4a2 2 0 0 0 2 2h4"></path>
                  <path d="M15 13H9"></path>
                  <path d="M15 17H9"></path>
                  <path d="M11 9H9"></path>
                </svg>
              </div>
              <div>
                <h2>Inventory Change Logs</h2>
                <p class="logs-subtitle">
                  See who changed what, when, and for which item.
                </p>
              </div>
            </div>
            <button class="logs-close-btn" @click="handleClose" aria-label="Close logs">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="logs-modal-body">
            <div class="logs-filters">
              <div class="logs-filter-group">
                <label class="logs-filter-label">Item</label>
                <select v-model="selectedItemId" class="logs-filter-select">
                  <option value="all">All items</option>
                  <option
                    v-for="item in inventoryItems"
                    :key="item.id"
                    :value="item.id"
                  >
                    {{ item.name }}
                  </option>
                </select>
              </div>

              <div class="logs-filter-group">
                <label class="logs-filter-label">User</label>
                <select v-model="selectedUserId" class="logs-filter-select">
                  <option value="all">All users</option>
                  <option
                    v-for="user in userOptions"
                    :key="user.id"
                    :value="user.id"
                  >
                    {{ user.username }}
                  </option>
                </select>
              </div>

              <div class="logs-filter-group logs-filter-dates">
                <label class="logs-filter-label">Date range</label>
                <div class="logs-date-inputs">
                  <input
                    v-model="fromDate"
                    type="date"
                    class="logs-date-input"
                  />
                  <span class="logs-date-separator">to</span>
                  <input
                    v-model="toDate"
                    type="date"
                    class="logs-date-input"
                  />
                </div>
              </div>

              <div class="logs-search-group">
                <div class="logs-search-container">
                  <svg class="logs-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="7"></circle>
                    <path d="m21 21-4.3-4.3"></path>
                  </svg>
                  <input
                    v-model="searchQuery"
                    type="text"
                    class="logs-search-input"
                    placeholder="Search by message or item name..."
                  />
                </div>
              </div>
            </div>

            <div class="logs-table-container">
              <div v-if="isLoading" class="logs-state logs-loading">
                <div class="logs-spinner"></div>
                <p>Loading logs...</p>
              </div>

              <div v-else-if="error" class="logs-state logs-error">
                <p>{{ error }}</p>
              </div>

              <div
                v-else-if="filteredLogs.length === 0"
                class="logs-state logs-empty"
              >
                <p>No logs found for the selected filters.</p>
              </div>

              <table v-else class="logs-table">
                <thead>
                  <tr>
                    <th>Date / Time</th>
                    <th>User</th>
                    <th>Item</th>
                    <th>Message</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="log in filteredLogs" :key="log.id">
                    <td>{{ formatDateTime(log.created_at) }}</td>
                    <td>{{ getUserName(log.user_id) }}</td>
                    <td>{{ getItemName(log.inventory_id) }}</td>
                    <td class="logs-message-cell">
                      {{ log.message }}
                    </td>
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
import { ref, watch, computed } from 'vue'
import type { Inventory } from '../models/Inventory'
import type { InventoryChangeLog } from '../services/inventoryChangeLogService'
import { inventoryChangeLogService } from '../services/inventoryChangeLogService'
import { userService } from '../services/userService'

interface Props {
  isOpen: boolean
  inventoryItems: Inventory[]
  initialInventoryId?: string | null
}

interface Emits {
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  initialInventoryId: null
})
const emit = defineEmits<Emits>()

const logs = ref<InventoryChangeLog[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

const selectedItemId = ref<string | 'all'>(
  props.initialInventoryId || 'all'
)
const selectedUserId = ref<string | 'all'>('all')
const fromDate = ref<string>('')
const toDate = ref<string>('')
const searchQuery = ref<string>('')

const userOptions = ref<Array<{ id: string; username: string }>>([])

async function loadUsers() {
  try {
    const { users, error: usersError } = await userService.getAllUsers()
    if (usersError) {
      console.error('Error loading users for logs:', usersError)
      return
    }
    if (users) {
      userOptions.value = users.map(user => ({
        id: user.id,
        username: user.username
      }))
    }
  } catch (err) {
    console.error('Unexpected error loading users for logs:', err)
  }
}

async function loadLogs() {
  try {
    isLoading.value = true
    error.value = null

    const logsData = await inventoryChangeLogService.fetchLogs({})
    logs.value = logsData

    // Pre-set filters if initialInventoryId was provided
    if (props.initialInventoryId) {
      selectedItemId.value = props.initialInventoryId
    }
  } catch (err) {
    console.error('Error loading inventory change logs:', err)
    error.value =
      err instanceof Error ? err.message : 'Failed to load inventory logs'
  } finally {
    isLoading.value = false
  }
}

watch(
  () => props.isOpen,
  async (isOpen) => {
    if (isOpen) {
      await Promise.all([loadLogs(), loadUsers()])
    }
  },
  { immediate: false }
)

const filteredLogs = computed(() => {
  let result = [...logs.value]

  if (selectedItemId.value !== 'all') {
    result = result.filter(
      log => log.inventory_id === selectedItemId.value
    )
  }

  if (selectedUserId.value !== 'all') {
    result = result.filter(log => log.user_id === selectedUserId.value)
  }

  if (fromDate.value) {
    result = result.filter(log => log.created_at >= fromDate.value)
  }

  if (toDate.value) {
    result = result.filter(log => log.created_at <= toDate.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(log => {
      const messageMatch = log.message.toLowerCase().includes(query)
      const itemMatch = getItemName(log.inventory_id)
        .toLowerCase()
        .includes(query)
      return messageMatch || itemMatch
    })
  }

  return result
})

function getItemName(inventoryId: string): string {
  const item = props.inventoryItems.find(i => i.id === inventoryId)
  return item?.name ?? 'Unknown item'
}

function getUserName(userId: string | null): string {
  if (!userId) return 'System'
  const user = userOptions.value.find(u => u.id === userId)
  return user?.username ?? 'Unknown user'
}

function formatDateTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString()
}

function handleClose() {
  emit('close')
}
</script>

<style scoped>
.logs-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 9999;
}

.logs-modal-container {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.35);
  width: 100%;
  max-width: 960px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.logs-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem 1.75rem;
  border-bottom: 1px solid #e5e7eb;
}

.logs-header-content {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.logs-header-icon {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: #ffffff;
}

.logs-modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
}

.logs-subtitle {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.logs-close-btn {
  border: none;
  background: #f3f4f6;
  border-radius: 999px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.logs-close-btn:hover {
  background: #e5e7eb;
  color: #111827;
}

.logs-modal-body {
  padding: 1.25rem 1.75rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
  overflow: hidden;
}

.logs-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: flex-end;
  min-width: 0;
}

.logs-filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.logs-filter-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b7280;
}

.logs-filter-select {
  min-width: 160px;
  padding: 0.55rem 0.75rem;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  font-size: 0.875rem;
  outline: none;
  background: #f9fafb;
}

.logs-filter-select:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.25);
  background: #ffffff;
}

.logs-filter-dates {
  flex: 1;
}

.logs-date-inputs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logs-date-input {
  flex: 1;
  min-width: 0;
  padding: 0.55rem 0.75rem;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  font-size: 0.875rem;
  outline: none;
  background: #f9fafb;
}

.logs-date-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.25);
  background: #ffffff;
}

.logs-date-separator {
  font-size: 0.8rem;
  color: #6b7280;
}

.logs-search-group {
  flex: 1 1 240px;
  min-width: 0;
  max-width: 100%;
}

.logs-search-container {
  position: relative;
  min-width: 0;
}

.logs-search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.logs-search-input {
  width: 30%;
  padding: 0.6rem 0.75rem 0.6rem 2.25rem;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  font-size: 0.875rem;
  outline: none;
  background: #f9fafb;
}

.logs-search-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.25);
  background: #ffffff;
}

.logs-table-container {
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  background: #ffffff;
}

.logs-state {
  padding: 2.5rem 1.5rem;
  text-align: center;
  font-size: 0.9rem;
  color: #6b7280;
}

.logs-spinner {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  border: 3px solid #e5e7eb;
  border-top-color: #6366f1;
  margin: 0 auto 0.75rem;
  animation: logs-spin 0.8s linear infinite;
}

@keyframes logs-spin {
  to {
    transform: rotate(360deg);
  }
}

.logs-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.logs-table thead {
  background: #f9fafb;
}

.logs-table th {
  text-align: left;
  padding: 0.75rem 1rem;
  font-weight: 600;
  color: #6b7280;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}

.logs-table td {
  padding: 0.7rem 1rem;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: top;
}

.logs-message-cell {
  max-width: 420px;
  white-space: normal;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .logs-modal-container {
    max-height: 100vh;
  }

  .logs-modal-body {
    padding: 1rem;
  }

  .logs-filters {
    flex-direction: column;
    align-items: stretch;
  }

  .logs-filter-select,
  .logs-date-input,
  .logs-search-input {
    width: 100%;
  }

  .logs-table {
    font-size: 0.8rem;
  }
}
</style>


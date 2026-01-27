<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="isOpen" class="modal-overlay" @click.self="handleClose">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <div class="header-content">
              <div class="header-icon rank-mode">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"></path>
                </svg>
              </div>
              <div>
                <h2>Edit Menu Item Ranking</h2>
                <p class="modal-subtitle">Reorder menu items by moving them up or down</p>
              </div>
            </div>
            <button class="close-btn" @click="handleClose" aria-label="Close modal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div v-if="errorMessage" class="error-banner">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {{ errorMessage }}
          </div>

          <div class="modal-body">
            <div v-if="isLoading" class="loading-state">
              <div class="spinner"></div>
              <p>Loading menu items...</p>
            </div>

            <div v-else-if="sortedMenuItems.length === 0" class="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
              <h3>No menu items found</h3>
              <p>Add menu items first before ranking them</p>
            </div>

            <div v-else class="rank-list">
              <div
                v-for="(item, index) in sortedMenuItems"
                :key="item.id"
                class="rank-item"
              >
                <div class="rank-info">
                  <div class="rank-number">{{ index + 1 }}</div>
                  <div class="item-details">
                    <div class="item-name">{{ item.name }}</div>
                    <div class="item-category">{{ item.category }}</div>
                  </div>
                </div>
                <div class="rank-controls">
                  <button
                    class="rank-btn up-btn"
                    @click="moveUp(item.id)"
                    :disabled="isUpdating || index === 0"
                    :title="index === 0 ? 'Already at top' : 'Move up'"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="18 15 12 9 6 15"></polyline>
                    </svg>
                  </button>
                  <button
                    class="rank-btn down-btn"
                    @click="moveDown(item.id)"
                    :disabled="isUpdating || index === sortedMenuItems.length - 1"
                    :title="index === sortedMenuItems.length - 1 ? 'Already at bottom' : 'Move down'"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { MenuItem } from '../models/MenuItem'
import { menuItemService } from '../services/menuItemService'
import { menuRankService, type MenuRank } from '../services/menuRankService'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
  updated: []
}>()

const menuItems = ref<MenuItem[]>([])
const ranks = ref<MenuRank[]>([])
const isLoading = ref(false)
const isUpdating = ref(false)
const errorMessage = ref('')

const sortedMenuItems = computed(() => {
  const itemsWithRank = menuItems.value.map(item => {
    const rank = ranks.value.find(r => r.menu_id === item.id)
    return {
      ...item,
      rank: rank?.rank ?? 999999
    }
  })

  return itemsWithRank.sort((a, b) => {
    if (a.rank !== b.rank) {
      return a.rank - b.rank
    }
    return a.name.localeCompare(b.name)
  })
})

watch(() => props.isOpen, async (newVal) => {
  if (newVal) {
    await loadData()
  }
})

async function loadData() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const [items, menuRanks] = await Promise.all([
      menuItemService.getMenuItems(),
      menuRankService.getMenuRanks().catch(() => [])
    ])

    menuItems.value = items.filter(item => item.is_active)
    ranks.value = menuRanks

    if (ranks.value.length === 0 && menuItems.value.length > 0) {
      await initializeRanks()
    }
  } catch (err: any) {
    errorMessage.value = err?.message ?? 'Failed to load menu items'
    console.error('Error loading menu items:', err)
  } finally {
    isLoading.value = false
  }
}

async function initializeRanks() {
  try {
    await menuRankService.initializeRanks()
    ranks.value = await menuRankService.getMenuRanks()
  } catch (err: any) {
    if (err.message?.includes('already initialized')) {
      ranks.value = await menuRankService.getMenuRanks()
    } else {
      throw err
    }
  }
}

async function moveUp(menuId: string) {
  if (isUpdating.value) return
  
  isUpdating.value = true
  errorMessage.value = ''
  
  try {
    await menuRankService.moveRankUp(menuId, ranks.value)
    ranks.value = await menuRankService.getMenuRanks()
    emit('updated')
  } catch (err: any) {
    errorMessage.value = err?.message ?? 'Failed to move item up'
    console.error('Error moving item up:', err)
  } finally {
    isUpdating.value = false
  }
}

async function moveDown(menuId: string) {
  if (isUpdating.value) return
  
  isUpdating.value = true
  errorMessage.value = ''
  
  try {
    await menuRankService.moveRankDown(menuId, ranks.value)
    ranks.value = await menuRankService.getMenuRanks()
    emit('updated')
  } catch (err: any) {
    errorMessage.value = err?.message ?? 'Failed to move item down'
    console.error('Error moving item down:', err)
  } finally {
    isUpdating.value = false
  }
}

function handleClose() {
  if (!isUpdating.value) {
    emit('close')
  }
}

onMounted(() => {
  if (props.isOpen) {
    loadData()
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
  overflow-y: auto;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.header-content {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.header-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.header-icon.rank-mode {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.3;
}

.modal-subtitle {
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 400;
}

.close-btn {
  background: #f3f4f6;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.close-btn:hover {
  background: #e5e7eb;
  color: #111827;
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: #fee2e2;
  color: #991b1b;
  border-bottom: 1px solid #fecaca;
  font-size: 0.875rem;
  font-weight: 500;
}

.error-banner svg {
  flex-shrink: 0;
}

.modal-body {
  padding: 2rem;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p,
.empty-state p {
  color: #6b7280;
  margin: 0.5rem 0 0 0;
}

.empty-state svg {
  color: #d1d5db;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.rank-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.rank-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  transition: all 0.2s;
}

.rank-item:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.rank-controls {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex-shrink: 0;
}

.rank-btn {
  width: 32px;
  height: 32px;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: all 0.2s;
  padding: 0;
}

.rank-btn:hover:not(:disabled) {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.rank-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.rank-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.rank-number {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.item-details {
  flex: 1;
}

.item-name {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
}

.item-category {
  font-size: 0.875rem;
  color: #6b7280;
}

@media (max-width: 640px) {
  .modal-container {
    max-width: 100%;
    margin: 0.5rem;
  }

  .modal-header {
    padding: 1.5rem;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .rank-item {
    padding: 0.875rem;
  }
}
</style>

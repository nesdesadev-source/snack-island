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
                <p class="modal-subtitle">Drag or type a position to reorder, then save</p>
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

            <div v-else-if="orderedItems.length === 0" class="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
              <h3>No menu items found</h3>
              <p>Add menu items first before ranking them</p>
            </div>

            <div v-else class="rank-list">
              <div
                v-for="(item, index) in orderedItems"
                :key="item.id"
                class="rank-item"
                draggable="true"
                @dragstart="onDragStart(index)"
                @dragover="onDragOver($event, index)"
                @drop="onDrop(index)"
                @dragend="onDragEnd()"
                :class="{
                  'is-dragging': dragSrcIndex === index,
                  'is-drag-over': dragOverIndex === index && dragSrcIndex !== index
                }"
              >
                <div class="rank-info">
                  <div class="drag-handle" title="Drag to reorder">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <circle cx="5" cy="4" r="1.5"/><circle cx="11" cy="4" r="1.5"/>
                      <circle cx="5" cy="8" r="1.5"/><circle cx="11" cy="8" r="1.5"/>
                      <circle cx="5" cy="12" r="1.5"/><circle cx="11" cy="12" r="1.5"/>
                    </svg>
                  </div>
                  <div class="rank-number">{{ index + 1 }}</div>
                  <div class="item-details">
                    <div class="item-name">{{ item.name }}</div>
                    <div class="item-category">{{ item.category }}</div>
                  </div>
                </div>
                <input
                  type="number"
                  :value="index + 1"
                  :min="1"
                  :max="orderedItems.length"
                  :aria-label="`Move ${item.name} to position`"
                  @blur="onPositionInput($event, index)"
                  @keydown.enter="($event.target as HTMLInputElement).blur()"
                  class="rank-position-input"
                />
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <template v-if="!showDiscardConfirm">
              <div class="footer-left">
                <span v-if="isDirty" class="unsaved-warning">Unsaved changes</span>
              </div>
              <div class="footer-right">
                <button class="save-btn" @click="saveOrder" :disabled="!isDirty || isSaving">
                  <div v-if="isSaving" class="spinner-small"></div>
                  <span>{{ isSaving ? 'Saving...' : 'Save Order' }}</span>
                </button>
              </div>
            </template>
            <template v-else>
              <span class="discard-question">Discard unsaved changes?</span>
              <button class="cancel-discard-btn" @click="showDiscardConfirm = false">Cancel</button>
              <button class="confirm-discard-btn" @click="confirmDiscard">Yes, discard</button>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { Ref } from 'vue'
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
const errorMessage = ref('')

// Mutable local ordered list used for drag-and-drop
const orderedItems: Ref<(MenuItem & { rank: number })[]> = ref([])

// Tracks whether the user has reordered since last save/load
const isDirty: Ref<boolean> = ref(false)

// True while save API calls are in flight
const isSaving: Ref<boolean> = ref(false)

// True when the X button is clicked while there are unsaved changes
const showDiscardConfirm: Ref<boolean> = ref(false)

// Drag-and-drop state
const dragSrcIndex: Ref<number | null> = ref(null)
const dragOverIndex: Ref<number | null> = ref(null)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Builds the sorted ordered list from the current menuItems + ranks state. */
function buildOrderedItems() {
  const itemsWithRank = menuItems.value.map(item => {
    const rank = ranks.value.find(r => r.menu_id === item.id)
    return { ...item, rank: rank?.rank ?? 999999 }
  })

  itemsWithRank.sort((a, b) => {
    if (a.rank !== b.rank) return a.rank - b.rank
    return a.name.localeCompare(b.name)
  })

  orderedItems.value = itemsWithRank
}

// ---------------------------------------------------------------------------
// Data loading
// ---------------------------------------------------------------------------

watch(() => props.isOpen, async (newVal) => {
  if (newVal) {
    await loadData()
  }
})

async function loadData() {
  isLoading.value = true
  errorMessage.value = ''
  isDirty.value = false
  showDiscardConfirm.value = false

  try {
    const [items, menuRanks] = await Promise.all([
      menuItemService.getMenuItems(),
      menuRankService.getMenuRanks().catch(() => [] as MenuRank[])
    ])

    menuItems.value = items.filter(item => item.is_active)
    ranks.value = menuRanks

    if (ranks.value.length === 0 && menuItems.value.length > 0) {
      await initializeRanks()
    }

    buildOrderedItems()
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

// ---------------------------------------------------------------------------
// Close / discard logic
// ---------------------------------------------------------------------------

function handleClose() {
  if (isSaving.value) return
  if (isDirty.value) {
    showDiscardConfirm.value = true
    return
  }
  emit('close')
}

function confirmDiscard() {
  // Revert to server state
  buildOrderedItems()
  isDirty.value = false
  showDiscardConfirm.value = false
  emit('close')
}

// ---------------------------------------------------------------------------
// Drag-and-drop handlers
// ---------------------------------------------------------------------------

function onDragStart(index: number) {
  dragSrcIndex.value = index
}

function onDragOver(e: DragEvent, index: number) {
  e.preventDefault()
  dragOverIndex.value = index
}

function onDrop(index: number) {
  if (dragSrcIndex.value === null || dragSrcIndex.value === index) return
  const [moved] = orderedItems.value.splice(dragSrcIndex.value, 1) as [MenuItem & { rank: number }]
  orderedItems.value.splice(index, 0, moved)
  isDirty.value = true
}

function onDragEnd() {
  dragSrcIndex.value = null
  dragOverIndex.value = null
}

function moveToPosition(fromIndex: number, toPosition: number) {
  const toIndex = toPosition - 1
  const items = orderedItems.value
  const [moved] = items.splice(fromIndex, 1) as [MenuItem & { rank: number }]
  items.splice(toIndex, 0, moved)
  isDirty.value = true
}

function onPositionInput(event: Event, fromIndex: number) {
  const input = event.target as HTMLInputElement
  const raw = input.valueAsNumber
  if (isNaN(raw)) return
  const total = orderedItems.value.length
  const clamped = Math.min(Math.max(Math.round(raw), 1), total)
  if (clamped === fromIndex + 1) return
  moveToPosition(fromIndex, clamped)
}

// ---------------------------------------------------------------------------
// Save
// ---------------------------------------------------------------------------

async function saveOrder() {
  isSaving.value = true
  errorMessage.value = ''

  try {
    for (let i = 0; i < orderedItems.value.length; i++) {
      await menuRankService.updateMenuRank(orderedItems.value[i]!.id, i + 1)
    }
    isDirty.value = false
    emit('updated')
    emit('close')
  } catch (err: any) {
    errorMessage.value = err?.message ?? 'Failed to save order'
    console.error('Error saving order:', err)

    // Revert to server state on failure
    try {
      ranks.value = await menuRankService.getMenuRanks()
      buildOrderedItems()
    } catch {
      // Ignore secondary fetch errors; the error banner already shows the primary failure
    }
  } finally {
    isSaving.value = false
  }
}

// ---------------------------------------------------------------------------
// Mount
// ---------------------------------------------------------------------------

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
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
  flex: 1 1 0;
  overflow-y: auto;
  min-height: 0;
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

.rank-item.is-dragging {
  opacity: 0.4;
  border-style: dashed;
}

.rank-item.is-drag-over {
  border-color: #667eea;
  background: #eef2ff;
}

.rank-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.drag-handle {
  cursor: grab;
  color: #9ca3af;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.drag-handle:active {
  cursor: grabbing;
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

.rank-position-input {
  width: 56px;
  padding: 0.25rem 0.375rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  text-align: center;
  background: white;
  transition: border-color 0.15s;
  flex-shrink: 0;
}

.rank-position-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

/* Footer */

.modal-footer {
  padding: 1rem 2rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.footer-left {
  flex: 1;
}

.footer-right {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.unsaved-warning {
  font-size: 0.875rem;
  color: #d97706;
  font-weight: 500;
}

.save-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.save-btn:not(:disabled):hover {
  opacity: 0.9;
}

.spinner-small {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.discard-question {
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
}

.cancel-discard-btn {
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  color: #374151;
}

.confirm-discard-btn {
  padding: 0.5rem 1rem;
  background: #ef4444;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  color: white;
  font-weight: 600;
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

  .modal-footer {
    padding: 1rem 1.5rem;
  }

  .rank-item {
    padding: 0.875rem;
  }
}
</style>

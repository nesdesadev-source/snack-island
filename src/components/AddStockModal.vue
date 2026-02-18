<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="isOpen" class="modal-overlay" @click.self="handleClose">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <div class="header-content">
              <div class="header-icon add-stock-mode">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 5v14M5 12h14"></path>
                </svg>
              </div>
              <div>
                <h2>Add stock{{ item ? `: ${item.name}` : '' }}</h2>
                <p class="modal-subtitle">Enter the amount to add to current stock</p>
              </div>
            </div>
            <button class="close-btn" @click="handleClose" aria-label="Close modal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <form @submit.prevent="handleSubmit" class="modal-body">
            <div class="form-section">
              <label class="form-label">
                Amount to add
                <span v-if="item" class="unit-badge">{{ item.unit }}</span>
              </label>
              <div class="input-wrapper">
                <input
                  ref="amountInputRef"
                  type="number"
                  v-model.number="localAmount"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  class="form-input"
                  :class="{ 'input-error': inlineError }"
                  @input="onAmountInput"
                  aria-describedby="add-stock-error add-stock-api-error"
                />
              </div>
              <p v-if="inlineError" id="add-stock-error" class="error-message" role="alert">
                {{ inlineError }}
              </p>
              <p v-if="apiError" id="add-stock-api-error" class="error-message api-error" role="alert">
                {{ apiError }}
              </p>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="handleClose">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                Cancel
              </button>
              <button type="submit" class="btn btn-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Confirm
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Inventory } from '../models/Inventory'

interface Props {
  isOpen: boolean
  item: Inventory | null
  apiError?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  apiError: null
})

const emit = defineEmits<{
  close: []
  submit: [amount: number]
  clearError: []
}>()

const amountInputRef = ref<HTMLInputElement | null>(null)
const localAmount = ref<number | ''>('')
const inlineError = ref('')

function onAmountInput() {
  inlineError.value = ''
  emit('clearError')
}

function handleClose() {
  emit('close')
}

function handleSubmit() {
  const num = typeof localAmount.value === 'number' ? localAmount.value : parseFloat(String(localAmount.value))
  if (num === undefined || num === null || isNaN(num) || num <= 0) {
    inlineError.value = 'Amount must be greater than 0'
    return
  }
  inlineError.value = ''
  emit('submit', num)
}

watch(() => props.isOpen, (open) => {
  if (open) {
    localAmount.value = ''
    inlineError.value = ''
    setTimeout(() => amountInputRef.value?.focus(), 50)
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

.modal-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 420px;
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
  padding: 1.5rem 2rem;
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

.header-icon.add-stock-mode {
  background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
  color: white;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
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
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
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

.modal-body {
  padding: 1.5rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.unit-badge {
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  background: #f3f4f6;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
}

.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.2s;
  background: #f9fafb;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input.input-error {
  border-color: #ef4444;
  background: #fef2f2;
}

.error-message {
  margin: 0;
  font-size: 0.8125rem;
  color: #ef4444;
  font-weight: 500;
}

.error-message.api-error {
  margin-top: 0.25rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
  margin-top: 0.5rem;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  min-height: 44px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
  transform: translateY(-1px);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .modal-container {
    margin: 0;
    max-width: 100%;
  }

  .modal-header {
    padding: 1.25rem 1.5rem;
  }

  .modal-header h2 {
    font-size: 1.125rem;
  }

  .header-icon {
    width: 40px;
    height: 40px;
  }

  .modal-body {
    padding: 1.25rem 1.5rem;
  }

  .modal-footer {
    flex-direction: column-reverse;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>

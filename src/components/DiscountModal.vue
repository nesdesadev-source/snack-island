<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="isOpen" class="modal-overlay" @click.self="handleClose">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <div class="header-content">
              <div class="header-icon" :class="isEditMode ? 'edit-mode' : 'add-mode'">
                <svg v-if="isEditMode" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
              <div>
                <h2>{{ isEditMode ? 'Edit Discount' : 'Add New Discount' }}</h2>
                <p class="modal-subtitle">{{ isEditMode ? 'Update discount details' : 'Fill in the discount information' }}</p>
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
              <div class="checkbox-wrapper">
                <input 
                  type="checkbox" 
                  v-model="localFormData.is_active" 
                  class="form-checkbox"
                  id="is-active"
                />
                <label for="is-active" class="checkbox-label">
                  Active (discount is currently available)
                </label>
              </div>
            </div>

            <div class="form-section">
              <label class="form-label">
                Name <span class="required">*</span>
              </label>
              <div class="input-wrapper">
                <input 
                  type="text" 
                  v-model="localFormData.name" 
                  placeholder="e.g., Summer Sale, 10% Off"
                  class="form-input"
                  required
                />
              </div>
            </div>

            <div class="form-section">
              <label class="form-label">
                Description
                <span class="label-hint">Optional</span>
              </label>
              <div class="input-wrapper">
                <textarea 
                  v-model="localFormData.description" 
                  placeholder="Enter discount description..."
                  class="form-textarea"
                  rows="3"
                ></textarea>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-section">
                <label class="form-label">
                  Discount Type <span class="required">*</span>
                </label>
                <div class="select-wrapper">
                  <select v-model="localFormData.discount_type" class="form-select" required>
                    <option value="flat">Flat Amount</option>
                    <option value="percentage">Percentage</option>
                  </select>
                  <svg class="select-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>

              <div class="form-section">
                <label class="form-label">
                  Amount <span class="required">*</span>
                  <span class="label-hint">{{ localFormData.discount_type === 'percentage' ? '(0-100)' : '(≥ 0)' }}</span>
                </label>
                <div class="input-wrapper">
                  <input 
                    type="number" 
                    v-model.number="localFormData.amount" 
                    :min="localFormData.discount_type === 'percentage' ? 0 : 0"
                    :max="localFormData.discount_type === 'percentage' ? 100 : undefined"
                    :step="localFormData.discount_type === 'percentage' ? 1 : 0.01"
                    :placeholder="localFormData.discount_type === 'percentage' ? '0-100' : '0.00'"
                    class="form-input"
                    required
                  />
                </div>
              </div>
            </div>

            <!-- Date Information (shown only in edit mode) -->
            <div v-if="isEditMode && (initialData?.created_at || initialData?.updated_at)" class="date-info-section">
              <div class="date-info-badges">
                <span v-if="initialData?.created_at" class="date-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  Created: {{ formatDate(initialData.created_at) }}
                </span>
                <span v-if="initialData?.updated_at" class="date-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                  </svg>
                  Updated: {{ formatDate(initialData.updated_at) }}
                </span>
              </div>
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
                {{ isEditMode ? 'Update Discount' : 'Add Discount' }}
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
import type { DiscountType } from '../models/Discount'

interface DiscountFormData {
  name: string
  description: string
  amount: number
  discount_type: DiscountType
  is_active: boolean
  created_at?: string
  updated_at?: string
}

interface Props {
  isOpen: boolean
  isEditMode: boolean
  initialData?: DiscountFormData
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
  isEditMode: false,
  initialData: undefined
})

const emit = defineEmits<{
  close: []
  submit: [data: DiscountFormData]
}>()

const localFormData = ref<DiscountFormData>({
  name: '',
  description: '',
  amount: 0,
  discount_type: 'flat',
  is_active: true
})

watch(() => props.initialData, (newData) => {
  if (newData) {
    localFormData.value = {
      name: newData.name,
      description: newData.description || '',
      amount: newData.amount,
      discount_type: newData.discount_type,
      is_active: newData.is_active !== undefined ? newData.is_active : true,
      created_at: newData.created_at,
      updated_at: newData.updated_at
    }
  }
}, { immediate: true })

watch(() => props.isOpen, (isOpen) => {
  if (isOpen && !props.isEditMode) {
    localFormData.value = {
      name: '',
      description: '',
      amount: 0,
      discount_type: 'flat',
      is_active: true
    }
  }
})

watch(() => localFormData.value.discount_type, (newType) => {
  // Reset amount when switching types
  if (newType === 'percentage' && localFormData.value.amount > 100) {
    localFormData.value.amount = 100
  }
})

const handleClose = () => {
  emit('close')
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  }) + ' ' + date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleSubmit = () => {
  // Validate amount based on type
  if (localFormData.value.discount_type === 'percentage') {
    if (localFormData.value.amount < 0 || localFormData.value.amount > 100) {
      alert('Percentage discount must be between 0 and 100')
      return
    }
  } else {
    if (localFormData.value.amount < 0) {
      alert('Flat discount amount must be positive')
      return
    }
  }

  emit('submit', { ...localFormData.value })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 28px;
  border-bottom: 1px solid #e9ecef;
}

.header-content {
  display: flex;
  gap: 16px;
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

.header-icon.add-mode {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.header-icon.edit-mode {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.modal-header h2 {
  margin: 0 0 4px 0;
  color: #212529;
  font-size: 1.5rem;
  font-weight: 700;
}

.modal-subtitle {
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.close-btn {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #f8f9fa;
  color: #212529;
}

.modal-body {
  padding: 28px;
}

.form-section {
  margin-bottom: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  color: #495057;
  font-weight: 600;
  font-size: 0.9rem;
}

.required {
  color: #dc3545;
}

.label-hint {
  color: #6c757d;
  font-weight: 400;
  font-size: 0.8rem;
  font-style: italic;
}

.input-wrapper,
.select-wrapper {
  position: relative;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #212529;
  transition: all 0.2s;
  background: white;
  box-sizing: border-box;
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #adb5bd;
}

.select-wrapper {
  position: relative;
}

.select-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #6c757d;
}

.form-select {
  appearance: none;
  padding-right: 36px;
  cursor: pointer;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.form-checkbox {
  width: 18px;
  height: 18px;
  accent-color: #667eea;
  cursor: pointer;
}

.checkbox-label {
  font-size: 0.95rem;
  color: #495057;
  font-weight: 500;
}

.date-info-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e9ecef;
}

.date-info-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.date-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: 0.8rem;
  color: #6c757d;
  font-weight: 500;
}

.date-badge svg {
  flex-shrink: 0;
  opacity: 0.7;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #e9ecef;
  margin-top: 8px;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: #e9ecef;
  color: #495057;
}

.btn-secondary:hover {
  background: #dee2e6;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-container,
.modal-fade-leave-active .modal-container {
  transition: transform 0.2s;
}

.modal-fade-enter-from .modal-container,
.modal-fade-leave-to .modal-container {
  transform: scale(0.95);
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: 0;
    align-items: flex-end;
  }
  
  .modal-container {
    border-radius: 16px 16px 0 0;
    max-height: 95vh;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .modal-header {
    padding: 20px;
  }
  
  .modal-body {
    padding: 20px;
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

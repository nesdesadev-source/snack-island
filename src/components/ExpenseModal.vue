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
                <h2>{{ isEditMode ? 'Edit Expense' : 'Add New Expense' }}</h2>
                <p class="modal-subtitle">{{ isEditMode ? 'Update expense details' : 'Fill in the expense information' }}</p>
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
            <div class="form-grid">
              <div class="form-section">
                <label class="form-label">
                  Date <span class="required">*</span>
                </label>
                <div class="input-wrapper">
                  <input 
                    type="date" 
                    v-model="localFormData.expense_date" 
                    class="form-input"
                    required
                  />
                </div>
              </div>

              <div class="form-section">
                <label class="form-label">
                  Category <span class="required">*</span>
                </label>
                <div class="select-wrapper">
                  <select v-model="localFormData.category" class="form-select" required>
                    <option value="Supplies">Supplies</option>
                    <option value="Gas">Gas</option>
                    <option value="Misc">Misc</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Food">Food</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Other">Other</option>
                  </select>
                  <svg class="select-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>
            </div>

            <div class="form-section">
              <label class="form-label">
                Description <span class="required">*</span>
              </label>
              <div class="input-wrapper">
                <textarea 
                  v-model="localFormData.description" 
                  placeholder="Enter expense description..."
                  class="form-textarea"
                  rows="3"
                  required
                ></textarea>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-section">
                <label class="form-label">
                  Amount <span class="required">*</span>
                </label>
                <div class="input-wrapper">
                  <input 
                    type="number" 
                    v-model.number="localFormData.amount" 
                    min="0" 
                    step="0.01"
                    placeholder="0.00"
                    class="form-input"
                    required
                  />
                </div>
              </div>

              <div class="form-section">
                <label class="form-label">
                  Supplier ID
                  <span class="label-hint">Optional</span>
                </label>
                <div class="input-wrapper">
                  <input 
                    type="text" 
                    v-model="localFormData.supplier_id" 
                    placeholder="e.g., SUP-001"
                    class="form-input"
                  />
                </div>
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
                {{ isEditMode ? 'Update Expense' : 'Add Expense' }}
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
import type { ExpenseCategory } from '../models/Expense'

interface ExpenseFormData {
  expense_date: string
  category: ExpenseCategory
  description: string
  amount: number
  supplier_id: string
}

interface Props {
  isOpen: boolean
  isEditMode: boolean
  initialData?: ExpenseFormData
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
  isEditMode: false,
  initialData: undefined
})

const emit = defineEmits<{
  close: []
  submit: [data: ExpenseFormData]
}>()

const localFormData = ref<ExpenseFormData>({
  expense_date: new Date().toISOString().split('T')[0] as string,
  category: 'Supplies' as ExpenseCategory,
  description: '',
  amount: 0,
  supplier_id: ''
})

watch(() => props.initialData, (newData) => {
  if (newData) {
    localFormData.value = {
      ...newData,
      supplier_id: newData.supplier_id || ''
    }
  }
}, { immediate: true })

watch(() => props.isOpen, (isOpen) => {
  if (isOpen && !props.isEditMode) {
    localFormData.value = {
      expense_date: new Date().toISOString().split('T')[0] as string,
      category: 'Supplies' as ExpenseCategory,
      description: '',
      amount: 0,
      supplier_id: ''
    }
  }
})

const handleClose = () => {
  emit('close')
}

const handleSubmit = () => {
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


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
                <h2>{{ isEditMode ? 'Edit Inventory Item' : 'Add New Item' }}</h2>
                <p class="modal-subtitle">{{ isEditMode ? 'Update item details' : 'Fill in the item information' }}</p>
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
                Item Name <span class="required">*</span>
              </label>
              <div class="input-wrapper">
                <input 
                  type="text" 
                  v-model="localFormData.name" 
                  placeholder="e.g., Cooking Oil, Potatoes, etc."
                  class="form-input"
                  required
                />
              </div>
            </div>

            <div class="form-grid">
              <div class="form-section">
                <label class="form-label">
                  Unit <span class="required">*</span>
                </label>
                <div class="select-wrapper">
                  <select v-model="localFormData.unit" class="form-select" required>
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="g">Grams (g)</option>
                    <option value="L">Liters (L)</option>
                    <option value="mL">Milliliters (mL)</option>
                  </select>
                  <svg class="select-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>

              <div class="form-section">
                <label class="form-label">
                  Current Quantity <span class="required">*</span>
                </label>
                <div class="input-wrapper">
                  <input 
                    type="number" 
                    v-model.number="localFormData.quantity" 
                    min="0" 
                    step="0.01"
                    placeholder="0.00"
                    class="form-input"
                    required
                  />
                </div>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-section">
                <label class="form-label">
                  Reorder Level <span class="required">*</span>
                  <span class="label-hint">Alert threshold</span>
                </label>
                <div class="input-wrapper">
                  <input 
                    type="number" 
                    v-model.number="localFormData.reorder_level" 
                    min="0" 
                    step="0.01"
                    placeholder="0.00"
                    class="form-input"
                    required
                  />
                </div>
              </div>

              <!-- <div class="form-section">
                <label class="form-label">
                  Supplier ID
                </label>
                <div class="input-wrapper">
                  <input 
                    type="text" 
                    v-model="localFormData.supplier_id" 
                    placeholder="e.g., SUP-001"
                    class="form-input"
                  />
                </div>
              </div> -->
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
                {{ isEditMode ? 'Update Item' : 'Add Item' }}
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
import type { InventoryUnit } from '../models/Inventory'

interface InventoryFormData {
  name: string
  unit: InventoryUnit
  quantity: number
  reorder_level: number
  supplier_id: string
}

interface Props {
  isOpen: boolean
  isEditMode?: boolean
  formData: InventoryFormData
}

interface Emits {
  (e: 'close'): void
  (e: 'submit', data: InventoryFormData): void
}

const props = withDefaults(defineProps<Props>(), {
  isEditMode: false
})

const emit = defineEmits<Emits>()

// Local form data to avoid mutating props
const localFormData = ref<InventoryFormData>({ ...props.formData })

// Watch for changes in props.formData
watch(() => props.formData, (newData) => {
  localFormData.value = { ...newData }
}, { deep: true })

const handleClose = () => {
  emit('close')
}

const handleSubmit = () => {
  emit('submit', { ...localFormData.value })
}
</script>

<style scoped>
/* Modal Overlay & Transitions */
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
  max-width: 600px;
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

/* Modal Header */
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

.header-icon.add-mode {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.header-icon.edit-mode {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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

/* Modal Body */
.modal-body {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

.required {
  color: #ef4444;
  font-weight: 700;
}

.label-hint {
  font-size: 0.75rem;
  font-weight: 400;
  color: #9ca3af;
  margin-left: auto;
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

.select-wrapper {
  position: relative;
}

.form-select {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.2s;
  background: #f9fafb;
  cursor: pointer;
  appearance: none;
  box-sizing: border-box;
}

.form-select:focus {
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.select-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #6b7280;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

/* Modal Footer */
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

/* Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-container {
    margin: 0;
    border-radius: 16px;
  }

  .modal-header {
    padding: 1.5rem;
  }

  .modal-header h2 {
    font-size: 1.25rem;
  }

  .header-icon {
    width: 40px;
    height: 40px;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
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


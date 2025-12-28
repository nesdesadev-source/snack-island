<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="showModal" class="modal-overlay" @click.self="$emit('close')">
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
                <h2>{{ isEditMode ? 'Edit Menu Item' : 'Add New Menu Item' }}</h2>
                <p class="modal-subtitle">{{ isEditMode ? 'Update menu item details' : 'Fill in the menu item information' }}</p>
              </div>
            </div>
            <button class="close-btn" @click="$emit('close')" aria-label="Close modal">
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

          <form @submit.prevent="saveAll" class="modal-body">
            <!-- Basic Info Section -->
            <div class="section-title">Basic Information</div>
            
            <div class="form-grid">
              <div class="form-section">
                <label class="form-label">
                  Item Name <span class="required">*</span>
                </label>
                <div class="input-wrapper">
                  <input 
                    type="text" 
                    v-model="localItem.name" 
                    placeholder="e.g., Cheese Fries, Iced Tea, etc."
                    class="form-input"
                    required
                  />
                </div>
              </div>

              <div class="form-section">
                <label class="form-label">
                  Item Code <span class="required">*</span>
                </label>
                <div class="input-wrapper">
                  <input 
                    type="text" 
                    v-model="localItem.item_code" 
                    placeholder="e.g., CF001, IT002, etc."
                    class="form-input"
                    required
                  />
                </div>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-section">
                <label class="form-label">
                  Category <span class="required">*</span>
                </label>
                <div class="select-wrapper">
                  <select v-model="localItem.category" class="form-select" required>
                    <option value="Snack">Snack</option>
                    <option value="Drink">Drink</option>
                    <option value="Combo">Combo</option>
                    <option value="Side">Side</option>
                  </select>
                  <svg class="select-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>

              <div class="form-section">
                <label class="form-label">
                  Price (₱) <span class="required">*</span>
                </label>
                <div class="input-wrapper">
                  <input 
                    type="number" 
                    v-model.number="localItem.price" 
                    min="0" 
                    step="0.01"
                    placeholder="0.00"
                    class="form-input"
                    required
                  />
                </div>
              </div>
            </div>

            <!-- Pricing Analysis Section -->
            <div class="section-title">Pricing Analysis</div>
            
            <div class="pricing-grid">
              <div class="pricing-card">
                <div class="pricing-label">Cost per Order</div>
                <div class="pricing-value cost">₱{{ costPerOrder.toFixed(2) }}</div>
              </div>
              <div class="pricing-card">
                <div class="pricing-label">Profit %</div>
                <input 
                  v-model.number="profitPercent" 
                  type="number" 
                  min="0" 
                  step="1"
                  class="pricing-input"
                />
              </div>
              <div class="pricing-card">
                <div class="pricing-label">Suggested Price</div>
                <div class="pricing-value suggested">₱{{ suggestedPrice.toFixed(2) }}</div>
              </div>
              <div class="pricing-card">
                <div class="pricing-label">Current Profit</div>
                <div class="pricing-value profit">₱{{ profitAtCurrentPrice.toFixed(2) }}</div>
              </div>
            </div>

            <!-- Recipe Ingredients Section -->
            <div class="section-title">
              Recipe Ingredients
              <button type="button" class="add-ingredient-btn" @click="addIngredient">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add Ingredient
              </button>
            </div>

            <div v-if="localRecipeMaps.length === 0" class="empty-ingredients">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              <p>No ingredients added yet</p>
              <small>Click "Add Ingredient" to start building your recipe</small>
            </div>

            <div v-else class="ingredients-table-wrap">
              <table class="ingredients-table">
                <thead>
                  <tr>
                    <th>Ingredient</th>
                    <th>QTY Used</th>
                    <th>Type</th>
                    <th>Purchase Price</th>
                    <th>Purchase Qty</th>
                    <th>Unit</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(rm, index) in localRecipeMaps" :key="index">
                    <td>
                      <select v-model="rm.ingredient_id" class="table-select" required @change="updateIngredientUnit(index)">
                        <option value="">Select ingredient...</option>
                        <option v-for="item in inventoryItems" :key="item.id" :value="item.id">
                          {{ item.name }}
                        </option>
                      </select>
                    </td>
                    <td><input v-model.number="rm.usage_per_order" type="number" min="0" step="0.0001" class="table-input" placeholder="0.00" /></td>
                    <td>
                      <select v-model="rm.usage_type" class="table-select">
                        <option value="per_order">per_order</option>
                        <option value="per_batch">per_batch</option>
                      </select>
                    </td>
                    <td><input v-model.number="rm.purchase_price" type="number" min="0" step="0.01" class="table-input" placeholder="0.00" /></td>
                    <td><input v-model.number="rm.purchase_quantity" type="number" min="0" step="0.0001" class="table-input" placeholder="0.00" /></td>
                    <td><input v-model="rm.purchase_unit" type="text" class="table-input" :placeholder="getInventoryUnit(rm.ingredient_id)" disabled /></td>
                    <td>
                      <button type="button" class="remove-btn" @click="removeIngredient(index)" title="Remove">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="$emit('close')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                {{ saving ? 'Saving...' : (isEditMode ? 'Update Item' : 'Add Item') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import type { MenuItem } from '../models/MenuItem'
import type { RecipeMap } from '../models/RecipeMap'
import type { Inventory } from '../models/Inventory'
import { recipeMapService } from '../services/recipeMapService'
import { menuItemService } from '../services/menuItemService'
import { inventoryService } from '../services/inventoryService'
import { computeCostPerOrderForMenuItem } from '../modules/menu/menuPageUtils'
import { calculateProfitPerOrderForPrice, calculateSuggestedPriceForTargetProfit } from '../modules/menu/menuItemUtils'

const props = defineProps<{ menuItem: MenuItem; recipeMaps: RecipeMap[] }>()
const emit = defineEmits<{ close: []; saved: [] }>()

const showModal = ref(true)
const localItem = ref<MenuItem>({ ...props.menuItem })
const localRecipeMaps = ref<RecipeMap[]>(props.recipeMaps.map(r => ({ ...r })))
const profitPercent = ref<number>(50)
const saving = ref(false)
const errorMessage = ref('')
const inventoryItems = ref<Inventory[]>([])

const isEditMode = computed(() => !!props.menuItem.id)

async function loadInventory() {
  try {
    var data = await inventoryService.getAll();
    inventoryItems.value = data.filter((item: Inventory) => item.is_active) || []
  } catch (err) {
    console.error('Failed to load inventory:', err)
  }
}

onMounted(loadInventory)

watch(
  () => props.menuItem,
  (val) => { localItem.value = { ...val } },
  { deep: true }
)

watch(
  () => props.recipeMaps,
  (val) => { localRecipeMaps.value = val.map(r => ({ ...r })) },
  { deep: true }
)

// For new items, we calculate cost directly from localRecipeMaps without filtering by menu_item_id
const costPerOrder = computed(() => {
  if (isEditMode.value) {
    return computeCostPerOrderForMenuItem(localRecipeMaps.value, localItem.value.id)
  } else {
    // For new items, calculate cost from all recipe maps in the form
    return computeCostPerOrderForMenuItem(
      localRecipeMaps.value.map(rm => ({ ...rm, menu_item_id: 'temp' })), 
      'temp'
    )
  }
})

const suggestedPrice = computed(() => calculateSuggestedPriceForTargetProfit(costPerOrder.value, profitPercent.value))
const profitAtCurrentPrice = computed(() => calculateProfitPerOrderForPrice(localItem.value.price, costPerOrder.value))

function getInventoryUnit(ingredientId: string): string {
  if (!ingredientId) return 'Select ingredient first'
  const inventory = inventoryItems.value.find(item => item.id === ingredientId)
  return inventory?.unit || ''
}

function updateIngredientUnit(index: number) {
  const rm = localRecipeMaps.value[index]
  if (rm && rm.ingredient_id) {
    const inventory = inventoryItems.value.find(item => item.id === rm.ingredient_id)
    if (inventory) {
      rm.purchase_unit = inventory.unit
    }
  }
}

function addIngredient() {
  localRecipeMaps.value.push({
    id: `temp-${Date.now()}`,
    menu_item_id: localItem.value.id || '',
    ingredient_id: '',
    usage_per_order: 0,
    usage_type: 'per_order',
    purchase_price: 0,
    purchase_quantity: 0,
    purchase_unit: ''
  })
}

function removeIngredient(index: number) {
  localRecipeMaps.value.splice(index, 1)
}

async function saveAll() {
  errorMessage.value = ''
  
  if (!localItem.value.name || !localItem.value.name.trim()) {
    errorMessage.value = 'Menu item name is required'
    return
  }
  
  if (!localItem.value.item_code || !localItem.value.item_code.trim()) {
    errorMessage.value = 'Item code is required'
    return
  }
  
  if (localItem.value.price <= 0) {
    errorMessage.value = 'Price must be greater than 0'
    return
  }
  
  saving.value = true
  try {
    let menuItemId = localItem.value.id

    if (isEditMode.value) {
      await menuItemService.updateMenuItem({
        id: localItem.value.id,
        name: localItem.value.name,
        price: localItem.value.price,
        category: localItem.value.category,
        item_code: localItem.value.item_code
      })

      // Update existing recipe maps
      for (const rm of localRecipeMaps.value) {
        if (!rm.id.startsWith('temp-')) {
          await recipeMapService.updateRecipeMap({
            id: rm.id,
            menu_item_id: rm.menu_item_id,
            ingredient_id: rm.ingredient_id,
            usage_per_order: rm.usage_per_order,
            usage_type: rm.usage_type,
            purchase_price: rm.purchase_price,
            purchase_quantity: rm.purchase_quantity,
            purchase_unit: rm.purchase_unit
          })
        } else {
          // Create new recipe maps (temp IDs)
          await recipeMapService.createRecipeMap({
            menu_item_id: menuItemId,
            ingredient_id: rm.ingredient_id,
            usage_per_order: rm.usage_per_order,
            usage_type: rm.usage_type,
            purchase_price: rm.purchase_price,
            purchase_quantity: rm.purchase_quantity,
            purchase_unit: rm.purchase_unit
          })
        }
      }
    } else {
      // Create new menu item
      menuItemId = await menuItemService.createMenuItem({
        name: localItem.value.name,
        price: localItem.value.price,
        category: localItem.value.category,
        item_code: localItem.value.item_code
      })

      // Create recipe maps for new item
      for (const rm of localRecipeMaps.value) {
        if (rm.ingredient_id) {
          await recipeMapService.createRecipeMap({
            menu_item_id: menuItemId,
            ingredient_id: rm.ingredient_id,
            usage_per_order: rm.usage_per_order,
            usage_type: rm.usage_type,
            purchase_price: rm.purchase_price,
            purchase_quantity: rm.purchase_quantity,
            purchase_unit: rm.purchase_unit
          })
        }
      }
    }

    emit('saved')
  } catch (err: any) {
    errorMessage.value = err?.message ?? 'Failed to save changes'
  } finally {
    saving.value = false
  }
}
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
  max-width: 900px;
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
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: -0.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.add-ingredient-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.add-ingredient-btn:hover {
  background: #e5e7eb;
  border-color: #d1d5db;
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

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.pricing-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.pricing-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pricing-value {
  font-size: 1.25rem;
  font-weight: 700;
}

.pricing-value.cost {
  color: #ef4444;
}

.pricing-value.suggested {
  color: #667eea;
}

.pricing-value.profit {
  color: #10b981;
}

.pricing-input {
  width: 100%;
  padding: 0.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 700;
  outline: none;
  transition: all 0.2s;
  background: white;
  box-sizing: border-box;
}

.pricing-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.empty-ingredients {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  background: #f9fafb;
  border: 2px dashed #e5e7eb;
  border-radius: 12px;
}

.empty-ingredients svg {
  color: #d1d5db;
  margin-bottom: 1rem;
}

.empty-ingredients p {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.25rem 0;
}

.empty-ingredients small {
  font-size: 0.875rem;
  color: #6b7280;
}

.ingredients-table-wrap {
  overflow-x: auto;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

.ingredients-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.ingredients-table thead {
  background: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
}

.ingredients-table th {
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.ingredients-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #f3f4f6;
}

.table-input,
.table-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.875rem;
  outline: none;
  transition: all 0.2s;
  background: white;
  box-sizing: border-box;
}

.table-input:focus,
.table-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.table-input:disabled {
  background: #f3f4f6;
  color: #6b7280;
  cursor: not-allowed;
}

.table-select {
  cursor: pointer;
}

.remove-btn {
  background: #fee2e2;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: #fecaca;
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

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
    max-width: 100%;
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

  .form-grid,
  .pricing-grid {
    grid-template-columns: 1fr;
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

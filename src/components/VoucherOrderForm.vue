<template>
  <div class="voucher-form">
    <div class="vf-mobile-header">
      <h3 class="vf-mobile-title">New Voucher Order</h3>
      <button class="vf-close" aria-label="Close" @click="emit('close')">×</button>
    </div>

    <div v-if="loadError" class="vf-banner vf-banner-error">{{ loadError }}</div>

    <template v-else>
      <!-- Code entry -->
      <form class="vf-entry" @submit.prevent="addCode">
        <label class="vf-label" for="voucher-code-input">Voucher code</label>
        <div class="vf-entry-row">
          <input
            id="voucher-code-input"
            ref="codeInput"
            v-model="codeInputValue"
            class="vf-input"
            :class="{ 'vf-input-error': entryError }"
            placeholder="SI-XXXXXX"
            autocomplete="off"
            autocapitalize="characters"
            spellcheck="false"
            :disabled="isChecking || !burger"
            data-testid="voucher-code-input"
            @input="entryError = ''"
          />
          <button type="submit" class="vf-btn vf-btn-primary" :disabled="!codeInputValue.trim() || isChecking || !burger">
            {{ isChecking ? 'Checking…' : 'Add' }}
          </button>
        </div>
        <p v-if="entryError" class="vf-entry-error" role="alert" data-testid="voucher-error">{{ entryError }}</p>
        <p v-else class="vf-hint">Each code adds 1 free {{ burger?.name || 'burger' }}.</p>
      </form>

      <!-- Lines -->
      <div v-if="lines.length > 0" class="vf-lines">
        <h4 class="vf-section-title">FREE ITEMS</h4>
        <div v-for="(line, index) in lines" :key="line.code" class="vf-line">
          <div class="vf-line-info">
            <div class="vf-line-name">{{ burger?.name }}{{ formatVariations(line) }}</div>
            <div class="vf-line-code">{{ line.code }}</div>
          </div>
          <div class="vf-line-price">₱0.00</div>
          <button class="vf-remove" :aria-label="`Remove ${line.code}`" @click="lines.splice(index, 1)">×</button>
        </div>

        <div class="vf-summary">
          <span>TOTAL</span>
          <span class="vf-total">₱0.00</span>
        </div>
        <div class="vf-payment">Payment: <strong>Cash</strong> · {{ fulfillment === 'take_out' ? 'Take out' : 'Dine in' }}</div>
      </div>

      <div v-else class="vf-empty">Enter the customer's voucher code to start.</div>

      <div v-if="submitError" class="vf-banner vf-banner-error" role="alert">{{ submitError }}</div>

      <div class="vf-actions">
        <button class="vf-btn vf-btn-secondary" @click="emit('close')">Cancel</button>
        <button
          class="vf-btn vf-btn-primary"
          :disabled="lines.length === 0 || isSubmitting"
          data-testid="submit-voucher-order-btn"
          @click="submit"
        >
          {{ isSubmitting ? 'Processing…' : `Submit Voucher Order (${lines.length})` }}
        </button>
      </div>
    </template>

    <!-- Customize the burger (flavors only, no upgrades) -->
    <Teleport to="body">
      <div v-if="pendingCode && burger" class="vf-overlay" @click.self="pendingCode = null">
        <div class="vf-dialog" role="dialog">
          <h3 class="vf-dialog-title">{{ burger.name }}</h3>
          <p class="vf-dialog-sub">Free with {{ pendingCode }}</p>

          <div v-if="burger.has_fries" class="vf-option">
            <div class="vf-option-label">Fries</div>
            <div class="vf-option-buttons">
              <button
                v-for="o in friesOptions"
                :key="o.value"
                :class="['vf-chip', { active: choice.fries_option === o.value }]"
                @click="choice.fries_option = o.value"
              >
                {{ o.label }}
              </button>
            </div>
          </div>

          <div v-if="burger.has_spicy" class="vf-option">
            <div class="vf-option-label">Spicy</div>
            <div class="vf-option-buttons">
              <button :class="['vf-chip', { active: !choice.is_spicy }]" @click="choice.is_spicy = false">Regular</button>
              <button :class="['vf-chip', { active: choice.is_spicy }]" @click="choice.is_spicy = true">Spicy</button>
            </div>
          </div>

          <div v-if="burger.has_drink" class="vf-option">
            <div class="vf-option-label">Drink</div>
            <div class="vf-option-buttons">
              <button
                v-for="o in drinkOptions"
                :key="o.value"
                :class="['vf-chip', { active: choice.drink_option === o.value }]"
                @click="choice.drink_option = o.value"
              >
                {{ o.label }}
              </button>
            </div>
          </div>

          <div class="vf-dialog-actions">
            <button class="vf-btn vf-btn-secondary" @click="pendingCode = null">Cancel</button>
            <button
              class="vf-btn vf-btn-primary"
              :disabled="(burger.has_fries && !choice.fries_option) || (burger.has_drink && !choice.drink_option)"
              @click="confirmChoice"
            >
              Add to Order
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import type { MenuItem, OrderFulfillment, FriesOption, DrinkOption } from '../models'
import { menuItemService } from '../services/menuItemService'
import { voucherService } from '../services/voucherService'
import { OrderService } from '../services/orderService'
import { VOUCHER_MENU_ITEM_ID } from '../modules/vouchers/voucherUtils'
import { createVoucherOrder, voucherLinesToOrderItems, type VoucherOrderLine } from '../modules/vouchers/voucherOrder'

const props = defineProps<{ fulfillment: OrderFulfillment }>()
const emit = defineEmits<{ orderSubmitted: []; close: [] }>()
const fulfillment = props.fulfillment

const friesOptions: Array<{ value: FriesOption; label: string }> = [
  { value: 'plain', label: 'Plain' },
  { value: 'cheese', label: 'Cheese' },
  { value: 'sour_cream', label: 'Sour Cream' },
  { value: 'bbq', label: 'BBQ' },
]
const drinkOptions: Array<{ value: DrinkOption; label: string }> = [
  { value: 'cucumber', label: 'Cucumber' },
  { value: 'iced_tea', label: 'Iced Tea' },
]

const burger = ref<MenuItem | null>(null)
const loadError = ref('')
const codeInput = ref<HTMLInputElement | null>(null)
const codeInputValue = ref('')
const entryError = ref('')
const submitError = ref('')
const isChecking = ref(false)
const isSubmitting = ref(false)
const lines = ref<VoucherOrderLine[]>([])

const pendingCode = ref<string | null>(null)
const choice = reactive<{ fries_option: FriesOption | null; is_spicy: boolean; drink_option: DrinkOption | null }>({
  fries_option: null,
  is_spicy: false,
  drink_option: null,
})

const hasOptions = (item: MenuItem) => Boolean(item.has_fries || item.has_spicy || item.has_drink)

function pushLine(code: string) {
  lines.value.push({
    code,
    fries_option: choice.fries_option || undefined,
    is_spicy: choice.is_spicy || undefined,
    drink_option: choice.drink_option || undefined,
  })
  codeInputValue.value = ''
  nextTick(() => codeInput.value?.focus())
}

async function addCode() {
  if (!burger.value || !codeInputValue.value.trim()) return
  isChecking.value = true
  entryError.value = ''
  submitError.value = ''
  try {
    const result = await voucherService.lookupForRedemption(codeInputValue.value, lines.value.map(l => l.code))
    if (!result.ok) {
      entryError.value = result.message
      return
    }
    choice.fries_option = null
    choice.is_spicy = false
    choice.drink_option = null
    if (hasOptions(burger.value)) {
      pendingCode.value = result.voucher.code
    } else {
      pushLine(result.voucher.code)
    }
  } catch (error) {
    console.error('Error checking voucher:', error)
    entryError.value = "Couldn't check the code. Check your connection and try again."
  } finally {
    isChecking.value = false
  }
}

function confirmChoice() {
  if (!pendingCode.value) return
  pushLine(pendingCode.value)
  pendingCode.value = null
}

const formatVariations = (line: VoucherOrderLine): string => {
  const parts: string[] = []
  if (line.fries_option) parts.push(`Fries: ${friesOptions.find(o => o.value === line.fries_option)?.label}`)
  if (line.is_spicy) parts.push('Spicy')
  if (line.drink_option) parts.push(`Drink: ${drinkOptions.find(o => o.value === line.drink_option)?.label}`)
  return parts.length ? ` (${parts.join(', ')})` : ''
}

async function submit() {
  if (lines.value.length === 0) return
  isSubmitting.value = true
  submitError.value = ''
  try {
    const check = await OrderService.checkInventoryForOrderItems(voucherLinesToOrderItems(lines.value))
    if (!check.isAvailable) {
      const names = check.insufficientItems.map(i => i.ingredientName).join(', ')
      if (!confirm(`There are insufficient items: ${names}. Do you want to continue regardless?`)) return
    }
    await createVoucherOrder(lines.value, fulfillment)
    lines.value = []
    emit('orderSubmitted')
  } catch (error) {
    console.error('Error submitting voucher order:', error)
    submitError.value = error instanceof Error && error.message.startsWith('Code ')
      ? `${error.message} Remove it and submit again.`
      : 'Failed to submit voucher order. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  try {
    const items = await menuItemService.getMenuItems()
    const item = items.find(i => i.id === VOUCHER_MENU_ITEM_ID)
    if (!item) {
      loadError.value = "The voucher burger isn't on the menu. Ask an admin to check the menu."
      return
    }
    burger.value = item
    nextTick(() => codeInput.value?.focus())
  } catch (error) {
    console.error('Error loading voucher burger:', error)
    loadError.value = 'Failed to load the menu. Please refresh the page.'
  }
})
</script>

<style scoped>
.voucher-form {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  max-width: 560px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.vf-mobile-header {
  display: none;
  justify-content: space-between;
  align-items: center;
}

.vf-mobile-title {
  margin: 0;
  font-size: 1rem;
  color: #1d1d1f;
}

.vf-close {
  background: none;
  border: none;
  font-size: 1.75rem;
  line-height: 1;
  color: #86868b;
  cursor: pointer;
}

.vf-entry {
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 1rem;
}

.vf-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: #86868b;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.vf-entry-row {
  display: flex;
  gap: 0.5rem;
}

.vf-input {
  flex: 1;
  min-width: 0;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 1.25rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 0.625rem 0.75rem;
  border: 1px solid #d2d2d7;
  border-radius: 6px;
  min-height: 44px;
}

.vf-input:focus {
  outline: 2px solid #0e3b2e;
  outline-offset: -1px;
}

.vf-input-error {
  border-color: #dc3545;
}

.vf-entry-error {
  color: #dc3545;
  font-size: 0.875rem;
  margin: 0.5rem 0 0;
  font-weight: 500;
}

.vf-hint {
  color: #86868b;
  font-size: 0.8rem;
  margin: 0.5rem 0 0;
}

.vf-section-title {
  font-size: 0.75rem;
  letter-spacing: 0.5px;
  color: #86868b;
  margin: 0 0 0.5rem;
}

.vf-lines {
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 1rem;
}

.vf-line {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f1f1;
}

.vf-line-info {
  flex: 1;
  min-width: 0;
}

.vf-line-name {
  font-weight: 600;
  color: #1d1d1f;
  font-size: 0.9rem;
}

.vf-line-code {
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 0.8rem;
  color: #0e3b2e;
}

.vf-line-price {
  font-weight: 600;
  color: #1d1d1f;
}

.vf-remove {
  background: none;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  width: 32px;
  height: 32px;
  font-size: 1.1rem;
  color: #86868b;
  cursor: pointer;
}

.vf-summary {
  display: flex;
  justify-content: space-between;
  margin-top: 0.75rem;
  font-weight: 700;
  color: #1d1d1f;
}

.vf-total {
  font-size: 1.25rem;
}

.vf-payment {
  margin-top: 0.25rem;
  font-size: 0.8rem;
  color: #86868b;
}

.vf-empty {
  text-align: center;
  color: #86868b;
  padding: 1.5rem 0;
  font-size: 0.9rem;
}

.vf-banner {
  border-radius: 6px;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
}

.vf-banner-error {
  background: #fdecea;
  color: #b02a37;
  border: 1px solid #f5c2c7;
}

.vf-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.vf-btn {
  border-radius: 6px;
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  min-height: 44px;
}

.vf-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.vf-btn-primary {
  background: #0e3b2e;
  color: #ffffff;
  border: 1px solid #0e3b2e;
}

.vf-btn-secondary {
  background: #ffffff;
  color: #1d1d1f;
  border: 1px solid #d2d2d7;
}

.vf-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
}

.vf-dialog {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.25rem;
  width: 100%;
  max-width: 420px;
}

.vf-dialog-title {
  margin: 0;
  font-size: 1.1rem;
  color: #1d1d1f;
}

.vf-dialog-sub {
  margin: 0.25rem 0 1rem;
  font-size: 0.85rem;
  color: #0e3b2e;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
}

.vf-option {
  margin-bottom: 1rem;
}

.vf-option-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #86868b;
  margin-bottom: 0.5rem;
}

.vf-option-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.vf-chip {
  border: 1px solid #d2d2d7;
  background: #ffffff;
  border-radius: 6px;
  padding: 0.5rem 0.875rem;
  min-height: 40px;
  font-size: 0.875rem;
  cursor: pointer;
}

.vf-chip.active {
  background: #0e3b2e;
  border-color: #0e3b2e;
  color: #ffffff;
}

.vf-dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .voucher-form {
    padding: 1rem;
    border-radius: 0;
  }

  .vf-mobile-header {
    display: flex;
  }

  .vf-actions .vf-btn {
    flex: 1;
  }
}
</style>

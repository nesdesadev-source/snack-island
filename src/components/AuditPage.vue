<template>
  <div class="audit-page">
    <div class="page-header">
      <h1 class="page-title">Audit</h1>
    </div>

    <!-- Ingredient Mapping Config (admin only) -->
    <div v-if="isAdmin" class="section mapping-section">
      <div class="section-header" @click="mappingOpen = !mappingOpen">
        <h2 class="section-title">Ingredient Mapping</h2>
        <svg class="chevron" :class="{ rotated: mappingOpen }" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      <div v-if="mappingOpen" class="mapping-content">
        <p class="mapping-hint">Define how many units of each ingredient each menu item uses.</p>

        <div v-if="loadingMenuItems" class="loading-text">Loading menu items...</div>

        <div v-else class="menu-items-list">
          <div v-for="item in menuItems" :key="item.id" class="menu-item-row">
            <div class="menu-item-name">{{ item.name }}</div>
            <div class="mappings-for-item">
              <div v-for="mapping in mappingsForItem(item.id)" :key="mapping.id" class="mapping-chip">
                <span class="chip-label">{{ mapping.ingredient }} × {{ mapping.quantity }}</span>
                <button class="chip-remove" @click="removeMapping(mapping.id)" title="Remove">×</button>
              </div>
              <div class="add-mapping-form">
                <select v-model="newMappingIngredient[item.id]" class="ingredient-select">
                  <option value="">+ Add ingredient</option>
                  <option v-for="ing in availableIngredients(item.id)" :key="ing" :value="ing">{{ ing }}</option>
                </select>
                <input
                  v-if="newMappingIngredient[item.id]"
                  v-model.number="newMappingQty[item.id]"
                  type="number"
                  min="1"
                  class="qty-input"
                  placeholder="Qty"
                />
                <button
                  v-if="newMappingIngredient[item.id]"
                  class="btn-add"
                  @click="addMapping(item.id)"
                >Add</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Session Audit -->
    <div class="section audit-section">
      <h2 class="section-title">Session Audit</h2>

      <div v-if="loadingSessions" class="loading-text">Loading sessions...</div>
      <div v-else class="session-select-row">
        <label class="field-label">Session</label>
        <select v-model="selectedSessionId" class="session-select" @change="onSessionChange">
          <option value="">— Select a session —</option>
          <option v-for="s in sessions" :key="s.id" :value="s.id">{{ sessionLabel(s) }}</option>
        </select>
      </div>

      <div v-if="loadingAudit" class="loading-text">Loading orders...</div>

      <div v-else-if="selectedSessionId && auditRows.length === 0 && !loadingAudit" class="empty-text">
        No ingredient mappings found for the orders in this session.
      </div>

      <div v-if="cashAuditRows.length > 0" class="table-wrapper cash-table-wrapper">
        <table class="audit-table cash-audit-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Amount</th>
              <th>Start of Day Count</th>
              <th>End of Day Count</th>
              <th>Difference</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in cashAuditRows" :key="row.name" :class="{ flagged: cashDifference(row) !== 0 }">
              <td>{{ row.name }}</td>
              <td v-if="row.name !== 'Expenses'">
                {{ row.amount !== null ? '₱' + row.amount.toFixed(2) : '—' }}
              </td>
              <td v-else>
                <input v-model.number="row.amount" type="number" min="0" class="count-input" />
              </td>
              <td><input v-model.number="row.startOfDay" type="number" min="0" class="count-input" /></td>
              <td><input v-model.number="row.endOfDay" type="number" min="0" class="count-input" /></td>
              <td class="diff-cell">{{ cashDifferenceLabel(cashDifference(row)) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="auditRows.length > 0" class="table-wrapper">
        <table class="audit-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Quantity</th>
              <th>Today Add-ons</th>
              <th>Yesterday's EOD Count</th>
              <th>Today's EOD Count</th>
              <th>Difference</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in auditRows" :key="row.ingredient" :class="{ flagged: difference(row) !== 0 }">
              <td>{{ row.ingredient }}</td>
              <td>{{ row.quantity }}</td>
              <td><input v-model.number="row.addOns" type="number" min="0" class="count-input" /></td>
              <td><input v-model.number="row.yesterdayEod" type="number" min="0" class="count-input" /></td>
              <td><input v-model.number="row.todayEod" type="number" min="0" class="count-input" /></td>
              <td class="diff-cell">{{ differenceLabel(difference(row)) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { authService } from '../services/authService'
import { StoreSessionService } from '../services/storeSessionService'
import { OrderService } from '../services/orderService'
import { menuItemService } from '../services/menuItemService'
import { AuditService, AUDIT_INGREDIENTS } from '../services/auditService'
import type { StoreSession, MenuItem, AuditIngredientMapping } from '../models'

interface AuditRow {
  ingredient: string
  quantity: number
  addOns: number
  yesterdayEod: number
  todayEod: number
}

interface CashAuditRow {
  name: string
  amount: number
  startOfDay: number
  endOfDay: number
}

const isAdmin = computed(() => authService.isAdmin())

// Mapping section
const mappingOpen = ref(false)
const loadingMenuItems = ref(false)
const menuItems = ref<MenuItem[]>([])
const allMappings = ref<AuditIngredientMapping[]>([])
const newMappingIngredient = reactive<Record<string, string>>({})
const newMappingQty = reactive<Record<string, number>>({})

// Session audit section
const loadingSessions = ref(false)
const sessions = ref<StoreSession[]>([])
const selectedSessionId = ref('')
const loadingAudit = ref(false)
const auditRows = ref<AuditRow[]>([])
const cashAuditRows = ref<CashAuditRow[]>([])

function sessionLabel(s: StoreSession): string {
  const start = formatDateTime(s.opened_at)
  if (!s.closed_at) return `${start} — Current Session`
  return `${start} — ${formatDateTime(s.closed_at)}`
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function mappingsForItem(menuItemId: string): AuditIngredientMapping[] {
  return allMappings.value.filter(m => m.menu_item_id === menuItemId)
}

function availableIngredients(menuItemId: string): string[] {
  const used = new Set(mappingsForItem(menuItemId).map(m => m.ingredient))
  return AUDIT_INGREDIENTS.filter(ing => !used.has(ing))
}

async function addMapping(menuItemId: string) {
  const ingredient = newMappingIngredient[menuItemId]
  const qty = newMappingQty[menuItemId] || 1
  if (!ingredient) return
  await AuditService.upsertMapping(menuItemId, ingredient, qty)
  newMappingIngredient[menuItemId] = ''
  newMappingQty[menuItemId] = 1
  allMappings.value = await AuditService.getMappings()
}

async function removeMapping(id: string) {
  await AuditService.deleteMapping(id)
  allMappings.value = allMappings.value.filter(m => m.id !== id)
}

async function onSessionChange() {
  if (!selectedSessionId.value) {
    auditRows.value = []
    return
  }
  const session = sessions.value.find(s => s.id === selectedSessionId.value)
  if (!session) return

  loadingAudit.value = true
  try {
    const { start, end } = StoreSessionService.getSessionRange(session)
    const orders = await OrderService.getOrders({ status: 'completed', startDate: start, endDate: end })

    if (orders.length === 0) {
      auditRows.value = []
      cashAuditRows.value = []
      return
    }

    const cashTotal = orders.filter(o => o.payment_method === 'cash').reduce((s, o) => s + (o.total_amount ?? 0), 0)
    const gcashTotal = orders.filter(o => o.payment_method === 'gcash').reduce((s, o) => s + (o.total_amount ?? 0), 0)
    const prev = cashAuditRows.value
    const prevByName = Object.fromEntries(prev.map(r => [r.name, r]))
    cashAuditRows.value = [
      { name: 'Cash', amount: cashTotal, startOfDay: prevByName['Cash']?.startOfDay ?? 0, endOfDay: prevByName['Cash']?.endOfDay ?? 0 },
      { name: 'GCash', amount: gcashTotal, startOfDay: prevByName['GCash']?.startOfDay ?? 0, endOfDay: prevByName['GCash']?.endOfDay ?? 0 },
      { name: 'Expenses', amount: 0, startOfDay: prevByName['Expenses']?.startOfDay ?? 0, endOfDay: prevByName['Expenses']?.endOfDay ?? 0 },
    ]

    const orderIds = orders.map(o => o.id)
    const [items, mappings] = await Promise.all([
      OrderService.getOrderItemsBulk(orderIds),
      AuditService.getMappings()
    ])
    allMappings.value = mappings

    // Aggregate: for each ingredient, sum qty used
    const ingredientQty: Record<string, number> = {}
    for (const item of items) {
      if (!item.menu_id) continue
      const itemMappings = mappings.filter(m => m.menu_item_id === item.menu_id)
      for (const m of itemMappings) {
        ingredientQty[m.ingredient] = (ingredientQty[m.ingredient] || 0) + item.quantity * m.quantity
      }
    }

    auditRows.value = Object.entries(ingredientQty)
      .sort(([a], [b]) => AUDIT_INGREDIENTS.indexOf(a as any) - AUDIT_INGREDIENTS.indexOf(b as any))
      .map(([ingredient, quantity]) => ({
        ingredient,
        quantity,
        addOns: 0,
        yesterdayEod: 0,
        todayEod: 0
      }))
  } finally {
    loadingAudit.value = false
  }
}

function cashDifference(row: CashAuditRow): number {
  if (row.name !== 'Expenses') return row.endOfDay - (row.startOfDay + row.amount);
  return row.startOfDay - row.amount - row.endOfDay
}

function cashDifferenceLabel(diff: number): string {
  if (diff < 0) return 'Short ₱' + Math.abs(diff).toFixed(2)
  if (diff === 0) return 'Balanced'
  return 'Over ₱' + diff.toFixed(2)
}

function difference(row: AuditRow): number {
  return row.yesterdayEod - row.quantity + row.addOns - row.todayEod
}

function differenceLabel(diff: number): string {
  if (diff < 0) {
    return "Sobra " + Math.abs(diff);
  } else if (diff == 0) {
    return "Balanced";
  } else {
    return "Missing " + diff;
  } 
}

onMounted(async () => {
  loadingSessions.value = true
  try {
    sessions.value = await StoreSessionService.getAllSessions()
  } finally {
    loadingSessions.value = false
  }

  if (isAdmin.value) {
    loadingMenuItems.value = true
    try {
      const [items, mappings] = await Promise.all([
        menuItemService.getMenuItems(),
        AuditService.getMappings()
      ])
      menuItems.value = items.filter(i => i.is_active)
      allMappings.value = mappings
    } finally {
      loadingMenuItems.value = false
    }
  }
})
</script>

<style scoped>
.audit-page {
  padding: 32px;
  max-width: 1100px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 28px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
}

.section {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin-bottom: 24px;
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  cursor: pointer;
  user-select: none;
}

.section-header:hover {
  background: #f9fafb;
}

.section-title {
  font-size: 17px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.audit-section .section-title {
  padding: 18px 24px 0;
}

.chevron {
  transition: transform 0.2s;
  color: #6b7280;
}

.chevron.rotated {
  transform: rotate(180deg);
}

.mapping-content {
  padding: 0 24px 24px;
  border-top: 1px solid #f3f4f6;
}

.mapping-hint {
  font-size: 13px;
  color: #6b7280;
  margin: 12px 0 16px;
}

.menu-items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.menu-item-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.menu-item-name {
  font-weight: 600;
  font-size: 14px;
  color: #374151;
  min-width: 160px;
  padding-top: 6px;
}

.mappings-for-item {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.mapping-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #e0f2fe;
  border-radius: 20px;
  padding: 4px 10px 4px 12px;
  font-size: 13px;
  color: #0369a1;
}

.chip-remove {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #0369a1;
  line-height: 1;
  padding: 0 2px;
  opacity: 0.7;
}

.chip-remove:hover {
  opacity: 1;
}

.add-mapping-form {
  display: flex;
  align-items: center;
  gap: 6px;
}

.ingredient-select {
  font-size: 13px;
  padding: 5px 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  color: #374151;
  cursor: pointer;
}

.qty-input {
  width: 64px;
  font-size: 13px;
  padding: 5px 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  text-align: center;
}

.btn-add {
  font-size: 13px;
  padding: 5px 12px;
  background: #0e3b2e;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.btn-add:hover {
  background: #114e43;
}

.session-select-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px 20px;
}

.field-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
}

.session-select {
  font-size: 14px;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
  color: #111827;
  min-width: 320px;
  cursor: pointer;
}

.loading-text {
  padding: 16px 24px;
  color: #6b7280;
  font-size: 14px;
}

.empty-text {
  padding: 16px 24px 24px;
  color: #6b7280;
  font-size: 14px;
}

.table-wrapper {
  padding: 0 24px 24px;
  overflow-x: auto;
}

.audit-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.audit-table th {
  text-align: left;
  padding: 10px 14px;
  background: #f3f4f6;
  color: #374151;
  font-weight: 600;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}

.audit-table td {
  padding: 10px 14px;
  border-bottom: 1px solid #f3f4f6;
  color: #111827;
  vertical-align: middle;
}

.audit-table tr.flagged td {
  background: #fee2e2;
}

.count-input {
  width: 80px;
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  text-align: center;
  background: #fff;
}

.audit-table tr.flagged .count-input {
  background: #fff;
}

.diff-cell {
  font-weight: 600;
  text-align: center;
}
</style>

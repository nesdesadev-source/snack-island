<template>
  <div class="chart-card vouchers-card">
    <div class="chart-header">
      <h3>IG Story Vouchers</h3>
      <span class="vouchers-period">Issued this period</span>
    </div>

    <div class="voucher-stats">
      <div class="voucher-stat">
        <span class="stat-number">{{ summary.issued }}</span>
        <span class="stat-label">Issued</span>
      </div>
      <div class="voucher-stat">
        <span class="stat-number stat-green">{{ summary.redeemed }}</span>
        <span class="stat-label">Burgers given</span>
      </div>
      <div class="voucher-stat">
        <span class="stat-number">{{ summary.unused }}</span>
        <span class="stat-label">Not used yet</span>
      </div>
      <div class="voucher-stat">
        <span class="stat-number stat-muted">{{ summary.expired }}</span>
        <span class="stat-label">Expired</span>
      </div>
    </div>

    <p class="voucher-cost">
      Ingredient cost of free burgers: <strong>₱{{ (summary.redeemed * burgerCost).toFixed(2) }}</strong>
      <span v-if="summary.issued > 0"> · {{ redeemRate }}% redeemed</span>
    </p>

    <div v-if="recent.length > 0" class="voucher-list">
      <div v-for="v in recent" :key="v.id" class="voucher-row">
        <span class="voucher-row-code">{{ v.code }}</span>
        <span :class="['voucher-badge', `badge-${stateOf(v)}`]">{{ stateLabel[stateOf(v)] }}</span>
        <span class="voucher-row-date">{{ rowDate(v) }}</span>
        <button
          v-if="stateOf(v) === 'unused'"
          class="voucher-void-btn"
          :disabled="voidingId === v.id"
          @click="$emit('void', v)"
        >
          Void
        </button>
        <span v-else class="voucher-void-spacer"></span>
      </div>
    </div>
    <p v-else class="voucher-empty">No vouchers yet. Click <strong>Voucher code</strong> above to make one.</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Voucher, VoucherState } from '../../models'
import { getVoucherState, summarizeVouchers, formatVoucherDate } from '../../modules/vouchers/voucherUtils'

const props = defineProps<{
  vouchers: Voucher[]
  periodStart: Date
  periodEnd: Date
  burgerCost: number
  voidingId?: string | null
}>()

defineEmits<{ void: [voucher: Voucher] }>()

const stateLabel: Record<VoucherState, string> = {
  unused: 'Not used',
  redeemed: 'Used',
  expired: 'Expired',
  void: 'Voided',
}

const summary = computed(() => summarizeVouchers(props.vouchers, props.periodStart, props.periodEnd))
const redeemRate = computed(() =>
  summary.value.issued ? Math.round((summary.value.redeemed / summary.value.issued) * 100) : 0,
)
const recent = computed(() => props.vouchers.slice(0, 8))

const stateOf = (v: Voucher) => getVoucherState(v)
const rowDate = (v: Voucher) => {
  const state = stateOf(v)
  if (state === 'redeemed' && v.redeemed_at) return `Used ${formatVoucherDate(v.redeemed_at)}`
  if (state === 'unused') return `Expires ${formatVoucherDate(v.expires_at)}`
  return `Made ${formatVoucherDate(v.created_at)}`
}
</script>

<style scoped>
.chart-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 0.5rem;
}

.chart-header h3 {
  margin: 0;
  color: #343a40;
  font-size: 1.1rem;
}

.vouchers-period {
  font-size: 0.8rem;
  color: #6c757d;
}

.voucher-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.voucher-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 0.75rem 0.25rem;
}

.stat-number {
  font-size: 1.6rem;
  font-weight: 700;
  color: #343a40;
}

.stat-green { color: #0e3b2e; }
.stat-muted { color: #adb5bd; }

.stat-label {
  font-size: 0.75rem;
  color: #6c757d;
  text-align: center;
}

.voucher-cost {
  margin: 1rem 0;
  font-size: 0.875rem;
  color: #495057;
}

.voucher-list {
  display: flex;
  flex-direction: column;
  border-top: 1px solid #e9ecef;
}

.voucher-row {
  display: grid;
  grid-template-columns: auto auto 1fr auto;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f3f5;
  font-size: 0.85rem;
}

.voucher-row-code {
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-weight: 600;
  color: #343a40;
}

.voucher-row-date {
  color: #6c757d;
  font-size: 0.8rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.voucher-badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
}

.badge-unused { background: #fff3cd; color: #8a6d00; }
.badge-redeemed { background: #d1e7dd; color: #0e3b2e; }
.badge-expired { background: #e9ecef; color: #6c757d; }
.badge-void { background: #f8d7da; color: #842029; }

.voucher-void-btn {
  background: none;
  border: 1px solid #dc3545;
  color: #dc3545;
  border-radius: 6px;
  padding: 0.2rem 0.6rem;
  font-size: 0.75rem;
  cursor: pointer;
}

.voucher-void-btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.voucher-void-spacer {
  width: 0;
}

.voucher-empty {
  color: #6c757d;
  font-size: 0.875rem;
  margin: 0;
}

@media (max-width: 480px) {
  .voucher-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .voucher-row {
    grid-template-columns: 1fr auto auto;
  }

  .voucher-row-date {
    grid-column: 1 / -1;
    order: 4;
  }
}
</style>

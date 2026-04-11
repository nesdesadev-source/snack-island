<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div class="ots-backdrop" @click="emit('cancel')">
        <div class="ots-card" @click.stop>
          <h2 class="ots-title">How will this order be served?</h2>
          <div class="ots-buttons">
            <button class="ots-btn" @click="emit('chosen', 'dine_in')">
              <span class="ots-btn-icon">🍽️</span>
              <span class="ots-btn-label">Dine In</span>
            </button>
            <button class="ots-btn" @click="emit('chosen', 'take_out')">
              <span class="ots-btn-icon">🥡</span>
              <span class="ots-btn-label">Take Out</span>
              <span class="ots-btn-note">+₱10 per box</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { OrderFulfillment } from '../models'

const emit = defineEmits<{
  chosen: [fulfillment: OrderFulfillment]
  cancel: []
}>()
</script>

<style scoped>
.ots-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.ots-card {
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 16px;
  padding: 2rem 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.75rem;
  min-width: 320px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.ots-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a2e;
  text-align: center;
  margin: 0;
  letter-spacing: 0.03em;
}

.ots-buttons {
  display: flex;
  gap: 1rem;
  width: 100%;
}

.ots-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.25rem 1rem;
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  color: #1a1a2e;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, transform 0.1s;
  font-family: inherit;
}

.ots-btn:hover {
  background: #f0f0f0;
  border-color: #bbb;
  transform: translateY(-1px);
}

.ots-btn:active {
  transform: translateY(0);
}

.ots-btn-icon {
  font-size: 2rem;
  line-height: 1;
}

.ots-btn-label {
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #1a1a2e;
}

.ots-btn-note {
  font-size: 0.72rem;
  color: #888;
  margin-top: 0.1rem;
}
</style>

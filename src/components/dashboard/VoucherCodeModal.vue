<template>
  <Teleport to="body">
    <div class="voucher-overlay" @click.self="$emit('close')">
      <div class="voucher-dialog" role="dialog" aria-labelledby="voucher-dialog-title">
        <div class="voucher-header">
          <h2 id="voucher-dialog-title">New Voucher</h2>
          <button class="voucher-close" aria-label="Close" @click="$emit('close')">×</button>
        </div>

        <div class="voucher-body">
          <div v-if="state === 'loading'" class="voucher-status">
            <div class="voucher-spinner"></div>
            <p>Creating voucher…</p>
          </div>

          <div v-else-if="state === 'error'" class="voucher-status voucher-error">
            <p>{{ errorMessage }}</p>
            <button class="voucher-btn voucher-btn-primary" @click="generate">Try again</button>
          </div>

          <template v-else-if="voucher">
            <img v-if="imageUrl" :src="imageUrl" :alt="`Voucher ${voucher.code}`" class="voucher-preview" />
            <div class="voucher-code-row">
              <span class="voucher-code" data-testid="voucher-code">{{ voucher.code }}</span>
              <button class="voucher-btn voucher-btn-ghost" @click="copyCode">{{ copied ? 'Copied' : 'Copy code' }}</button>
            </div>
            <p class="voucher-expiry">Valid until {{ formatVoucherDate(voucher.expires_at) }}</p>
          </template>
        </div>

        <div v-if="state === 'ready'" class="voucher-footer">
          <button class="voucher-btn voucher-btn-ghost" @click="generate">Make another</button>
          <button v-if="canShare" class="voucher-btn voucher-btn-secondary" @click="shareImage">Share</button>
          <button v-if="canCopyImage" class="voucher-btn voucher-btn-secondary" @click="copyImage">
            {{ imageCopyLabel }}
          </button>
          <button class="voucher-btn voucher-btn-primary" @click="downloadImage">Download image</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import type { Voucher } from '../../models'
import { voucherService } from '../../services/voucherService'
import { formatVoucherDate, VOUCHER_POOL_EXHAUSTED_MESSAGE } from '../../modules/vouchers/voucherUtils'
import { renderVoucherImage, voucherImageFileName } from '../../modules/vouchers/voucherImage'
import logoUrl from '../../assets/logo.png'

const props = defineProps<{ burgerName: string }>()
const emit = defineEmits<{ close: []; created: [voucher: Voucher] }>()

const state = ref<'loading' | 'ready' | 'error'>('loading')
const errorMessage = ref('')
const voucher = ref<Voucher | null>(null)
const imageBlob = ref<Blob | null>(null)
const imageUrl = ref<string | null>(null)
const copied = ref(false)
const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'
const canCopyImage =
  typeof ClipboardItem !== 'undefined' && typeof navigator !== 'undefined' && typeof navigator.clipboard?.write === 'function'
const imageCopyLabel = ref('Copy image')

function clearImage() {
  if (imageUrl.value) URL.revokeObjectURL(imageUrl.value)
  imageUrl.value = null
  imageBlob.value = null
}

async function generate() {
  state.value = 'loading'
  copied.value = false
  clearImage()
  try {
    const created = await voucherService.createVoucher()
    voucher.value = created
    emit('created', created)
    imageBlob.value = await renderVoucherImage(created, props.burgerName, logoUrl)
    imageUrl.value = URL.createObjectURL(imageBlob.value)
    state.value = 'ready'
  } catch (error) {
    console.error('Error generating voucher:', error)
    errorMessage.value = voucher.value
      ? 'The code was saved, but the image could not be drawn. Try again.'
      : error instanceof Error && error.message === VOUCHER_POOL_EXHAUSTED_MESSAGE
        ? error.message
        : 'Could not create a voucher. Check your connection and try again.'
    state.value = 'error'
  }
}

function downloadImage() {
  if (!imageUrl.value || !voucher.value) return
  const a = document.createElement('a')
  a.href = imageUrl.value
  a.download = voucherImageFileName(voucher.value.code)
  a.click()
}

async function shareImage() {
  if (!imageBlob.value || !voucher.value) return
  const file = new File([imageBlob.value], voucherImageFileName(voucher.value.code), { type: 'image/png' })
  try {
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: 'Island Snack Bar voucher' })
    } else {
      await navigator.share({ title: 'Island Snack Bar voucher', text: `Your free burger code: ${voucher.value.code}` })
    }
  } catch {
    // User closed the share sheet
  }
}

async function copyImage() {
  if (!imageBlob.value) return
  try {
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': imageBlob.value })])
    imageCopyLabel.value = 'Image copied'
  } catch (error) {
    console.error('Error copying voucher image:', error)
    imageCopyLabel.value = "Couldn't copy"
  }
  setTimeout(() => { imageCopyLabel.value = 'Copy image' }, 2000)
}

async function copyCode() {
  if (!voucher.value) return
  try {
    await navigator.clipboard.writeText(voucher.value.code)
    copied.value = true
  } catch {
    copied.value = false
  }
}

onMounted(generate)
onBeforeUnmount(clearImage)
</script>

<style scoped>
.voucher-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.voucher-dialog {
  background: #ffffff;
  border-radius: 12px;
  width: 100%;
  max-width: 460px;
  max-height: calc(100dvh - 2rem);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.voucher-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e5e5e5;
}

.voucher-header h2 {
  margin: 0;
  font-size: 1.1rem;
  color: #1d1d1f;
}

.voucher-close {
  background: none;
  border: none;
  font-size: 1.75rem;
  line-height: 1;
  color: #86868b;
  cursor: pointer;
}

.voucher-body {
  padding: 1.25rem;
  overflow-y: auto;
  text-align: center;
}

.voucher-preview {
  width: 100%;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
}

.voucher-code-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 1rem;
}

.voucher-code {
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 1.5rem;
  font-weight: 700;
  color: #0e3b2e;
  letter-spacing: 1px;
}

.voucher-expiry {
  margin: 0.5rem 0 0;
  color: #86868b;
  font-size: 0.875rem;
}

.voucher-status {
  padding: 2rem 0;
  color: #86868b;
}

.voucher-error p {
  color: #dc3545;
  margin-bottom: 1rem;
}

.voucher-spinner {
  width: 32px;
  height: 32px;
  margin: 0 auto 0.75rem;
  border: 3px solid #e5e5e5;
  border-top-color: #0e3b2e;
  border-radius: 50%;
  animation: voucher-spin 0.8s linear infinite;
}

@keyframes voucher-spin {
  to { transform: rotate(360deg); }
}

.voucher-footer {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  flex-wrap: wrap;
  padding: 1rem 1.25rem;
  border-top: 1px solid #e5e5e5;
}

.voucher-btn {
  border-radius: 6px;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  min-height: 40px;
}

.voucher-btn-primary {
  background: #0e3b2e;
  color: #ffffff;
  border: 1px solid #0e3b2e;
}

.voucher-btn-secondary {
  background: #ffffff;
  color: #0e3b2e;
  border: 1px solid #0e3b2e;
}

.voucher-btn-ghost {
  background: #f5f5f7;
  color: #1d1d1f;
  border: 1px solid #e5e5e5;
}

@media (max-width: 480px) {
  .voucher-footer .voucher-btn {
    flex: 1 1 auto;
  }
}
</style>

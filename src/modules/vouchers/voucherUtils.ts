import type { Voucher, VoucherState } from '../../models'

/** The burger every voucher is worth. */
export const VOUCHER_MENU_ITEM_ID = '91941e73-43cf-4ef0-ab0f-d68736f455bf'
export const VOUCHER_VALID_DAYS = 3
export const VOUCHER_CODE_PREFIX = 'SI-'
const CODE_LENGTH = 6
// No 0/O, 1/I/L so codes are easy to read off a phone screen.
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

export type VoucherRejectReason = 'not_found' | 'redeemed' | 'expired' | 'void' | 'duplicate'

export type VoucherCheckResult =
  | { ok: true; voucher: Voucher }
  | { ok: false; reason: VoucherRejectReason; message: string }

function secureRandom(): number {
  const buf = new Uint32Array(1)
  globalThis.crypto.getRandomValues(buf)
  return (buf[0] ?? 0) / 2 ** 32
}

export function generateVoucherCode(random: () => number = secureRandom): string {
  let body = ''
  for (let i = 0; i < CODE_LENGTH; i++) {
    body += CODE_ALPHABET[Math.floor(random() * CODE_ALPHABET.length)]
  }
  return VOUCHER_CODE_PREFIX + body
}

/** Accepts "si-abc234", "abc234", "SI ABC 234" etc. and returns "SI-ABC234". */
export function normalizeVoucherCode(input: string): string {
  let raw = (input || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (!raw) return ''
  if (raw.startsWith('SI') && raw.length === CODE_LENGTH + 2) raw = raw.slice(2)
  return VOUCHER_CODE_PREFIX + raw
}

/** Valid until 11:59 PM on the 3rd day after it was issued (local time). */
export function computeVoucherExpiry(issuedAt: Date): Date {
  const expiry = new Date(issuedAt)
  expiry.setDate(expiry.getDate() + VOUCHER_VALID_DAYS)
  expiry.setHours(23, 59, 59, 999)
  return expiry
}

export function getVoucherState(voucher: Voucher, now: Date = new Date()): VoucherState {
  if (voucher.status !== 'unused') return voucher.status
  return new Date(voucher.expires_at) <= now ? 'expired' : 'unused'
}

export function formatVoucherDate(value: string | Date): string {
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function rejectMessage(reason: VoucherRejectReason, code: string, voucher?: Voucher | null): string {
  switch (reason) {
    case 'not_found':
      return `Code ${code} doesn't exist. Check the spelling with the customer.`
    case 'redeemed':
      return voucher?.redeemed_at
        ? `Code ${code} was already used on ${formatVoucherDate(voucher.redeemed_at)}.`
        : `Code ${code} was already used.`
    case 'expired':
      return voucher
        ? `Code ${code} expired on ${formatVoucherDate(voucher.expires_at)}.`
        : `Code ${code} has expired.`
    case 'void':
      return `Code ${code} was cancelled by an admin.`
    case 'duplicate':
      return `Code ${code} is already in this order.`
  }
}

export function checkVoucherForRedemption(
  voucher: Voucher | null,
  code: string,
  codesInOrder: string[],
  now: Date = new Date(),
): VoucherCheckResult {
  const reject = (reason: VoucherRejectReason): VoucherCheckResult => ({
    ok: false,
    reason,
    message: rejectMessage(reason, code, voucher),
  })

  if (codesInOrder.includes(code)) return reject('duplicate')
  if (!voucher) return reject('not_found')

  const state = getVoucherState(voucher, now)
  if (state !== 'unused') return reject(state)
  return { ok: true, voucher }
}

const DB_REASONS: Record<string, VoucherRejectReason> = {
  VOUCHER_NOT_FOUND: 'not_found',
  VOUCHER_REDEEMED: 'redeemed',
  VOUCHER_EXPIRED: 'expired',
  VOUCHER_VOID: 'void',
  VOUCHER_DUPLICATE: 'duplicate',
}

/** Turns an error raised by the redeem_vouchers function into a staff-friendly message. */
export function voucherErrorFromDb(error: { message?: string } | null | undefined): string | null {
  const match = error?.message?.match(/(VOUCHER_[A-Z_]+):(\S+)/)
  if (!match) return null
  const reason = DB_REASONS[match[1] ?? '']
  return reason ? rejectMessage(reason, match[2] ?? '') : null
}

export interface VoucherSummary {
  issued: number
  redeemed: number
  expired: number
  unused: number
  void: number
}

/** Counts vouchers issued between start and end, grouped by their current state. */
export function summarizeVouchers(vouchers: Voucher[], start: Date, end: Date, now: Date = new Date()): VoucherSummary {
  const summary: VoucherSummary = { issued: 0, redeemed: 0, expired: 0, unused: 0, void: 0 }
  for (const v of vouchers) {
    const created = new Date(v.created_at)
    if (created < start || created > end) continue
    summary.issued++
    summary[getVoucherState(v, now)]++
  }
  return summary
}

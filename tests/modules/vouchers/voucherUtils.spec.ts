import { describe, it, expect } from 'vitest'
import {
  VOUCHER_CODE_PREFIX,
  VOUCHER_CODE_DIGITS,
  sanitizeVoucherDigits,
  normalizeVoucherCode,
  computeVoucherExpiry,
  getVoucherState,
  checkVoucherForRedemption,
  voucherErrorFromDb,
  summarizeVouchers,
} from '../../../src/modules/vouchers/voucherUtils'
import type { Voucher } from '../../../src/models'

const makeVoucher = (overrides: Partial<Voucher> = {}): Voucher => ({
  id: 'v1',
  code: 'ISB-231',
  menu_item_id: 'm1',
  status: 'unused',
  expires_at: '2026-11-02T15:59:59.000Z',
  order_id: null,
  redeemed_at: null,
  redeemed_by: null,
  created_at: '2026-10-30T02:00:00.000Z',
  created_by: 'admin',
  ...overrides,
})

const NOW = new Date('2026-10-31T00:00:00.000Z')

describe('voucher code format', () => {
  it('is ISB- followed by 3 digits', () => {
    expect(VOUCHER_CODE_PREFIX).toBe('ISB-')
    expect(VOUCHER_CODE_DIGITS).toBe(3)
  })
})

describe('sanitizeVoucherDigits', () => {
  it('keeps only digits, at most 3', () => {
    expect(sanitizeVoucherDigits('2a3-1')).toBe('231')
    expect(sanitizeVoucherDigits('23145')).toBe('231')
  })

  it('drops the prefix if staff paste a full code', () => {
    expect(sanitizeVoucherDigits('ISB-231')).toBe('231')
  })
})

describe('normalizeVoucherCode', () => {
  it('adds the prefix to the 3 digits staff type', () => {
    expect(normalizeVoucherCode('231')).toBe('ISB-231')
  })

  it('accepts a full code in any case, with or without the dash', () => {
    expect(normalizeVoucherCode('  isb-231 ')).toBe('ISB-231')
    expect(normalizeVoucherCode('ISB231')).toBe('ISB-231')
  })

  it('returns empty string for empty input', () => {
    expect(normalizeVoucherCode('   ')).toBe('')
  })
})

describe('computeVoucherExpiry', () => {
  it('lasts until the end of the 3rd day after it was issued', () => {
    const issued = new Date(2026, 9, 30, 14, 30) // Oct 30, 2:30 PM local
    const expiry = computeVoucherExpiry(issued)
    expect(expiry.getFullYear()).toBe(2026)
    expect(expiry.getMonth()).toBe(10) // November
    expect(expiry.getDate()).toBe(2)
    expect(expiry.getHours()).toBe(23)
    expect(expiry.getMinutes()).toBe(59)
  })
})

describe('getVoucherState', () => {
  it('is unused before expiry', () => {
    expect(getVoucherState(makeVoucher(), NOW)).toBe('unused')
  })

  it('is expired when unused and past expiry', () => {
    expect(getVoucherState(makeVoucher(), new Date('2026-11-03T00:00:00Z'))).toBe('expired')
  })

  it('stays redeemed even after expiry', () => {
    const v = makeVoucher({ status: 'redeemed', order_id: 'o1' })
    expect(getVoucherState(v, new Date('2026-12-01T00:00:00Z'))).toBe('redeemed')
  })

  it('reports void', () => {
    expect(getVoucherState(makeVoucher({ status: 'void' }), NOW)).toBe('void')
  })
})

describe('checkVoucherForRedemption', () => {
  it('accepts a valid unused code', () => {
    const result = checkVoucherForRedemption(makeVoucher(), 'ISB-231', [], NOW)
    expect(result.ok).toBe(true)
  })

  it('says the code does not exist when it is not found', () => {
    const result = checkVoucherForRedemption(null, 'ISB-999', [], NOW)
    expect(result).toMatchObject({ ok: false, reason: 'not_found' })
    if (!result.ok) expect(result.message).toMatch(/doesn't exist/i)
  })

  it('says the code was already used (different from not found)', () => {
    const v = makeVoucher({ status: 'redeemed', redeemed_at: '2026-10-30T07:12:00Z', order_id: 'o1' })
    const result = checkVoucherForRedemption(v, v.code, [], NOW)
    expect(result).toMatchObject({ ok: false, reason: 'redeemed' })
    if (!result.ok) expect(result.message).toMatch(/already used/i)
  })

  it('says the code expired', () => {
    const result = checkVoucherForRedemption(makeVoucher(), 'ISB-231', [], new Date('2026-11-05T00:00:00Z'))
    expect(result).toMatchObject({ ok: false, reason: 'expired' })
    if (!result.ok) expect(result.message).toMatch(/expired/i)
  })

  it('says the code was cancelled', () => {
    const result = checkVoucherForRedemption(makeVoucher({ status: 'void' }), 'ISB-231', [], NOW)
    expect(result).toMatchObject({ ok: false, reason: 'void' })
  })

  it('blocks the same code twice in one order', () => {
    const result = checkVoucherForRedemption(makeVoucher(), 'ISB-231', ['ISB-231'], NOW)
    expect(result).toMatchObject({ ok: false, reason: 'duplicate' })
    if (!result.ok) expect(result.message).toMatch(/already in this order/i)
  })
})

describe('voucherErrorFromDb', () => {
  it('turns a database reason into the matching message', () => {
    expect(voucherErrorFromDb({ message: 'VOUCHER_REDEEMED:ISB-231' })).toMatch(/ISB-231 was already used/)
    expect(voucherErrorFromDb({ message: 'VOUCHER_NOT_FOUND:ISB-231' })).toMatch(/doesn't exist/)
    expect(voucherErrorFromDb({ message: 'VOUCHER_EXPIRED:ISB-231' })).toMatch(/expired/)
    expect(voucherErrorFromDb({ message: 'VOUCHER_VOID:ISB-231' })).toMatch(/cancelled/)
    expect(voucherErrorFromDb({ message: 'VOUCHER_DUPLICATE:ISB-231' })).toMatch(/already in this order/)
  })

  it('returns null for unrelated errors', () => {
    expect(voucherErrorFromDb({ message: 'network down' })).toBeNull()
    expect(voucherErrorFromDb(null)).toBeNull()
  })
})

describe('summarizeVouchers', () => {
  it('counts issued, redeemed, expired and still-open codes in a date range', () => {
    const vouchers = [
      makeVoucher({ id: '1' }),
      makeVoucher({ id: '2', status: 'redeemed', order_id: 'o1', redeemed_at: '2026-10-30T05:00:00Z' }),
      makeVoucher({ id: '3', expires_at: '2026-10-30T10:00:00Z' }), // expired
      makeVoucher({ id: '4', status: 'void' }),
      makeVoucher({ id: '5', created_at: '2026-09-01T00:00:00Z' }), // outside range
    ]
    const summary = summarizeVouchers(
      vouchers,
      new Date('2026-10-01T00:00:00Z'),
      new Date('2026-10-31T23:59:59Z'),
      NOW,
    )
    expect(summary).toEqual({ issued: 4, redeemed: 1, expired: 1, unused: 1, void: 1 })
  })
})

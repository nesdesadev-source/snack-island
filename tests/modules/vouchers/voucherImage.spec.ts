import { describe, it, expect } from 'vitest'
import { buildVoucherImageText, voucherImageFileName } from '../../../src/modules/vouchers/voucherImage'

describe('buildVoucherImageText', () => {
  const text = buildVoucherImageText({ code: 'ISB-231', expires_at: '2026-11-02T15:59:59.000Z' }, 'Classic Burger')

  it('shows the code and the burger', () => {
    expect(text.code).toBe('ISB-231')
    expect(text.headline).toMatch(/free/i)
    expect(text.reward).toContain('Classic Burger')
  })

  it('shows when it expires', () => {
    expect(text.validUntil).toMatch(/Valid until .*2026/)
  })

  it('explains how to redeem', () => {
    expect(text.steps.join(' ')).toMatch(/staff/i)
  })

  it('lists the rules agreed for vouchers', () => {
    const rules = text.rules.join(' ')
    expect(rules).toMatch(/one-time use/i)
    expect(rules).toMatch(/3 days/i)
    expect(rules).toMatch(/no upgrades/i)
    expect(rules).toMatch(/separate order/i)
  })
})

describe('voucherImageFileName', () => {
  it('names the file after the code', () => {
    expect(voucherImageFileName('ISB-231')).toBe('island-snack-bar-voucher-ISB-231.png')
  })
})

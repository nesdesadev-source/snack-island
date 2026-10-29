import { describe, it, expect, vi, beforeEach } from 'vitest'
import { voucherService } from '../../src/services/voucherService'
import { supabase } from '../../src/supabase'
import { VOUCHER_MENU_ITEM_ID } from '../../src/modules/vouchers/voucherUtils'
import type { Voucher } from '../../src/models'

vi.mock('../../src/supabase', () => ({
  supabase: {
    rpc: vi.fn(),
    from: vi.fn(),
  },
}))

/** A chainable stand-in for supabase.from(...) that resolves to `result`. */
function mockQuery(result: { data: unknown; error: unknown }) {
  const chain: Record<string, any> = {}
  for (const m of ['select', 'insert', 'update', 'eq', 'order', 'gte', 'lte']) {
    chain[m] = vi.fn(() => chain)
  }
  chain.single = vi.fn(() => Promise.resolve(result))
  chain.maybeSingle = vi.fn(() => Promise.resolve(result))
  chain.then = (resolve: (r: unknown) => unknown, reject: (e: unknown) => unknown) =>
    Promise.resolve(result).then(resolve, reject)
  return chain
}

const voucher = (overrides: Partial<Voucher> = {}): Voucher => ({
  id: 'v1',
  code: 'SI-ABC234',
  menu_item_id: VOUCHER_MENU_ITEM_ID,
  status: 'unused',
  expires_at: new Date(Date.now() + 86_400_000).toISOString(),
  order_id: null,
  redeemed_at: null,
  redeemed_by: null,
  created_at: new Date().toISOString(),
  created_by: 'admin',
  ...overrides,
})

describe('voucherService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createVoucher', () => {
    it('saves a new code for the voucher burger that expires in 3 days', async () => {
      const q = mockQuery({ data: voucher(), error: null })
      vi.mocked(supabase.from).mockReturnValue(q as any)

      const result = await voucherService.createVoucher()

      expect(supabase.from).toHaveBeenCalledWith('vouchers')
      const inserted = q.insert.mock.calls[0][0]
      expect(inserted.code).toMatch(/^SI-[A-Z2-9]{6}$/)
      expect(inserted.menu_item_id).toBe(VOUCHER_MENU_ITEM_ID)
      const days = (new Date(inserted.expires_at).getTime() - Date.now()) / 86_400_000
      expect(days).toBeGreaterThan(3)
      expect(days).toBeLessThanOrEqual(4)
      expect(result.code).toBe('SI-ABC234')
    })

    it('retries with a new code if the code is already taken', async () => {
      const taken = mockQuery({ data: null, error: { code: '23505', message: 'duplicate key' } })
      const ok = mockQuery({ data: voucher(), error: null })
      vi.mocked(supabase.from).mockReturnValueOnce(taken as any).mockReturnValueOnce(ok as any)

      await voucherService.createVoucher()

      expect(supabase.from).toHaveBeenCalledTimes(2)
    })

    it('throws other errors', async () => {
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: null, error: { code: '42501', message: 'denied' } }) as any,
      )
      await expect(voucherService.createVoucher()).rejects.toBeTruthy()
    })
  })

  describe('lookupForRedemption', () => {
    it('normalizes what staff type and accepts a valid code', async () => {
      const q = mockQuery({ data: voucher(), error: null })
      vi.mocked(supabase.from).mockReturnValue(q as any)

      const result = await voucherService.lookupForRedemption(' abc234 ', [])

      expect(q.eq).toHaveBeenCalledWith('code', 'SI-ABC234')
      expect(result.ok).toBe(true)
    })

    it('reports a wrong code as not found', async () => {
      vi.mocked(supabase.from).mockReturnValue(mockQuery({ data: null, error: null }) as any)
      const result = await voucherService.lookupForRedemption('SI-ZZZZZZ', [])
      expect(result).toMatchObject({ ok: false, reason: 'not_found' })
    })

    it('reports a used code as already used', async () => {
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: voucher({ status: 'redeemed', order_id: 'o1', redeemed_at: new Date().toISOString() }), error: null }) as any,
      )
      const result = await voucherService.lookupForRedemption('SI-ABC234', [])
      expect(result).toMatchObject({ ok: false, reason: 'redeemed' })
    })

    it('blocks a code already in the order without calling the database', async () => {
      const result = await voucherService.lookupForRedemption('abc234', ['SI-ABC234'])
      expect(result).toMatchObject({ ok: false, reason: 'duplicate' })
      expect(supabase.from).not.toHaveBeenCalled()
    })
  })

  describe('redeemVouchers', () => {
    it('calls redeem_vouchers with the codes and order', async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({ data: [voucher({ status: 'redeemed' })], error: null } as any)
      await voucherService.redeemVouchers(['SI-ABC234'], 'o1')
      expect(supabase.rpc).toHaveBeenCalledWith('redeem_vouchers', { p_codes: ['SI-ABC234'], p_order_id: 'o1' })
    })

    it('throws a staff-friendly message when a code was used in the meantime', async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: { message: 'VOUCHER_REDEEMED:SI-ABC234' } } as any)
      await expect(voucherService.redeemVouchers(['SI-ABC234'], 'o1')).rejects.toThrow(/SI-ABC234 was already used/)
    })
  })

  describe('releaseVouchersForOrder', () => {
    it('calls release_vouchers for the order', async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({ data: [], error: null } as any)
      await voucherService.releaseVouchersForOrder('o1')
      expect(supabase.rpc).toHaveBeenCalledWith('release_vouchers', { p_order_id: 'o1' })
    })
  })

  describe('voidVoucher', () => {
    it('only voids codes that are still unused', async () => {
      const q = mockQuery({ data: voucher({ status: 'void' }), error: null })
      vi.mocked(supabase.from).mockReturnValue(q as any)

      await voucherService.voidVoucher('v1')

      expect(q.update).toHaveBeenCalledWith({ status: 'void' })
      expect(q.eq).toHaveBeenCalledWith('id', 'v1')
      expect(q.eq).toHaveBeenCalledWith('status', 'unused')
    })
  })
})

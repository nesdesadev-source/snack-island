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
  for (const m of ['select', 'insert', 'update', 'eq', 'order', 'limit', 'gte', 'lte']) {
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
  code: 'ISB-231',
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
    it('asks the database for a new code for the voucher burger that expires in 3 days', async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({ data: voucher(), error: null } as any)

      const result = await voucherService.createVoucher()

      const [fn, args] = vi.mocked(supabase.rpc).mock.calls[0] as [string, any]
      expect(fn).toBe('create_voucher')
      expect(args.p_menu_item_id).toBe(VOUCHER_MENU_ITEM_ID)
      const days = (new Date(args.p_expires_at).getTime() - Date.now()) / 86_400_000
      expect(days).toBeGreaterThan(3)
      expect(days).toBeLessThanOrEqual(4)
      expect(result.code).toBe('ISB-231')
    })

    it('handles the function returning a one-row array', async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({ data: [voucher()], error: null } as any)
      const result = await voucherService.createVoucher()
      expect(result.code).toBe('ISB-231')
    })

    it('explains when every 3-digit code is taken', async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: { message: 'VOUCHER_POOL_EXHAUSTED' } } as any)
      await expect(voucherService.createVoucher()).rejects.toThrow(/all 900/i)
    })

    it('throws other errors', async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: { code: '42501', message: 'denied' } } as any)
      await expect(voucherService.createVoucher()).rejects.toBeTruthy()
    })
  })

  describe('lookupForRedemption', () => {
    it('adds the prefix to the 3 digits and checks the newest voucher with that code', async () => {
      const q = mockQuery({ data: voucher(), error: null })
      vi.mocked(supabase.from).mockReturnValue(q as any)

      const result = await voucherService.lookupForRedemption('231', [])

      expect(q.eq).toHaveBeenCalledWith('code', 'ISB-231')
      expect(q.order).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(q.limit).toHaveBeenCalledWith(1)
      expect(result.ok).toBe(true)
    })

    it('reports a wrong code as not found', async () => {
      vi.mocked(supabase.from).mockReturnValue(mockQuery({ data: null, error: null }) as any)
      const result = await voucherService.lookupForRedemption('ISB-999', [])
      expect(result).toMatchObject({ ok: false, reason: 'not_found' })
    })

    it('reports a used code as already used', async () => {
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: voucher({ status: 'redeemed', order_id: 'o1', redeemed_at: new Date().toISOString() }), error: null }) as any,
      )
      const result = await voucherService.lookupForRedemption('ISB-231', [])
      expect(result).toMatchObject({ ok: false, reason: 'redeemed' })
    })

    it('blocks a code already in the order without calling the database', async () => {
      const result = await voucherService.lookupForRedemption('231', ['ISB-231'])
      expect(result).toMatchObject({ ok: false, reason: 'duplicate' })
      expect(supabase.from).not.toHaveBeenCalled()
    })
  })

  describe('redeemVouchers', () => {
    it('calls redeem_vouchers with the codes and order', async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({ data: [voucher({ status: 'redeemed' })], error: null } as any)
      await voucherService.redeemVouchers(['ISB-231'], 'o1')
      expect(supabase.rpc).toHaveBeenCalledWith('redeem_vouchers', { p_codes: ['ISB-231'], p_order_id: 'o1' })
    })

    it('throws a staff-friendly message when a code was used in the meantime', async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: { message: 'VOUCHER_REDEEMED:ISB-231' } } as any)
      await expect(voucherService.redeemVouchers(['ISB-231'], 'o1')).rejects.toThrow(/ISB-231 was already used/)
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

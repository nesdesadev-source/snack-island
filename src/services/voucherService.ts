import { supabase } from '../supabase'
import type { Voucher } from '../models'
import {
  VOUCHER_MENU_ITEM_ID,
  generateVoucherCode,
  normalizeVoucherCode,
  computeVoucherExpiry,
  checkVoucherForRedemption,
  voucherErrorFromDb,
  type VoucherCheckResult,
} from '../modules/vouchers/voucherUtils'

const UNIQUE_VIOLATION = '23505'
const MAX_CODE_ATTEMPTS = 5

export const voucherService = {
  async getAll(): Promise<Voucher[]> {
    const { data, error } = await supabase
      .from('vouchers')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data || []) as Voucher[]
  },

  async getByCode(code: string): Promise<Voucher | null> {
    const { data, error } = await supabase.from('vouchers').select('*').eq('code', code).maybeSingle()
    if (error) throw error
    return (data as Voucher) || null
  },

  /** Admin only (enforced in the database). */
  async createVoucher(): Promise<Voucher> {
    const expires_at = computeVoucherExpiry(new Date()).toISOString()
    let lastError: unknown = null

    for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
      const { data, error } = await supabase
        .from('vouchers')
        .insert({ code: generateVoucherCode(), menu_item_id: VOUCHER_MENU_ITEM_ID, expires_at })
        .select('*')
        .single()

      if (!error) return data as Voucher
      lastError = error
      if ((error as { code?: string }).code !== UNIQUE_VIOLATION) break
    }
    console.error('Error creating voucher:', lastError)
    throw lastError
  },

  /** Admin only. A code that's already been used can't be voided. */
  async voidVoucher(id: string): Promise<Voucher> {
    const { data, error } = await supabase
      .from('vouchers')
      .update({ status: 'void' })
      .eq('id', id)
      .eq('status', 'unused')
      .select('*')
      .single()
    if (error) throw error
    return data as Voucher
  },

  /** Checks a code typed by staff. `codesInOrder` are the codes already added to this order. */
  async lookupForRedemption(input: string, codesInOrder: string[]): Promise<VoucherCheckResult> {
    const code = normalizeVoucherCode(input)
    if (codesInOrder.includes(code)) return checkVoucherForRedemption(null, code, codesInOrder)
    const voucher = await this.getByCode(code)
    return checkVoucherForRedemption(voucher, code, codesInOrder)
  },

  /** Marks all codes as used on the order, or none of them if any can't be used. */
  async redeemVouchers(codes: string[], orderId: string): Promise<Voucher[]> {
    const { data, error } = await supabase.rpc('redeem_vouchers', { p_codes: codes, p_order_id: orderId })
    if (error) {
      console.error('Error redeeming vouchers:', error)
      throw new Error(voucherErrorFromDb(error) || 'Could not redeem the voucher codes. Please try again.')
    }
    return (data || []) as Voucher[]
  },

  /** Puts an order's codes back to unused (e.g. the order was cancelled). */
  async releaseVouchersForOrder(orderId: string): Promise<Voucher[]> {
    const { data, error } = await supabase.rpc('release_vouchers', { p_order_id: orderId })
    if (error) {
      console.error('Error releasing vouchers:', error)
      throw error
    }
    return (data || []) as Voucher[]
  },
}

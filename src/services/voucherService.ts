import { supabase } from '../supabase'
import type { Voucher } from '../models'
import {
  VOUCHER_MENU_ITEM_ID,
  VOUCHER_POOL_EXHAUSTED_MESSAGE,
  normalizeVoucherCode,
  computeVoucherExpiry,
  checkVoucherForRedemption,
  voucherErrorFromDb,
  type VoucherCheckResult,
} from '../modules/vouchers/voucherUtils'

export const voucherService = {
  async getAll(): Promise<Voucher[]> {
    const { data, error } = await supabase
      .from('vouchers')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data || []) as Voucher[]
  },

  /** 3-digit numbers are reused over time, so the newest voucher with the code is the one that counts. */
  async getByCode(code: string): Promise<Voucher | null> {
    const { data, error } = await supabase
      .from('vouchers')
      .select('*')
      .eq('code', code)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) throw error
    return (data as Voucher) || null
  },

  /** Admin only (enforced in the database). The database picks a free 3-digit number. */
  async createVoucher(): Promise<Voucher> {
    const { data, error } = await supabase.rpc('create_voucher', {
      p_menu_item_id: VOUCHER_MENU_ITEM_ID,
      p_expires_at: computeVoucherExpiry(new Date()).toISOString(),
    })
    if (error) {
      console.error('Error creating voucher:', error)
      if (error.message?.includes('VOUCHER_POOL_EXHAUSTED')) throw new Error(VOUCHER_POOL_EXHAUSTED_MESSAGE)
      throw error
    }
    const voucher = Array.isArray(data) ? data[0] : data
    if (!voucher) throw new Error('Failed to create voucher: no data returned')
    return voucher as Voucher
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

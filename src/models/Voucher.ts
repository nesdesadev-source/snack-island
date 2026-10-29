export type VoucherStatus = 'unused' | 'redeemed' | 'void';

/** Status shown to people: an unused code past its expiry reads as "expired". */
export type VoucherState = VoucherStatus | 'expired';

export interface Voucher {
  id: string;
  code: string;
  menu_item_id: string;
  status: VoucherStatus;
  expires_at: string;
  order_id: string | null;
  redeemed_at: string | null;
  redeemed_by: string | null;
  created_at: string;
  created_by: string | null;
}

export type DiscountType = 'flat' | 'percentage';

// This matches the actual database schema from Supabase
export interface Discount {
  id: string;
  name: string;
  description?: string;
  amount: number;
  discount_type: DiscountType;
  is_active: boolean;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateDiscountInput {
  name: string;
  description?: string;
  amount: number;
  discount_type: DiscountType;
  is_active?: boolean;
}

export interface UpdateDiscountInput {
  name?: string;
  description?: string;
  amount?: number;
  discount_type?: DiscountType;
  is_active?: boolean;
}

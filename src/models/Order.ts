export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export type PaymentMethod = 'cash' | 'gcash' | 'maya' | 'gotyme' | 'bpi' | 'other';

export interface Order {
  id: string;
  total_amount: number;
  payment_method: PaymentMethod | null;
  status: OrderStatus | null;
  discount_id?: string | null;
  created_at: string | null;
  updated_at: string | null;
  created_by: string | null;
  updated_by: string | null;
}

export interface CreateOrderInput {
  total_amount: number;
  payment_method?: PaymentMethod | null;
  status?: OrderStatus | null;
  discount_id?: string | null;
}

export interface UpdateOrderInput {
  total_amount?: number;
  payment_method?: PaymentMethod | null;
  status?: OrderStatus | null;
  discount_id?: string | null;
}


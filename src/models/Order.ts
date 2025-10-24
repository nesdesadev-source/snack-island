export type OrderStatus = 'Pending' | 'Preparing' | 'Ready' | 'Completed' | 'Cancelled';

export type PaymentMethod = 'Cash' | 'GCash' | 'Card' | 'Other';

export interface Order {
  id: string;
  datetime: string;
  total_amount: number;
  payment_method: PaymentMethod;
  status: OrderStatus;
}

export interface CreateOrderInput {
  datetime: string;
  total_amount: number;
  payment_method: PaymentMethod;
  status?: OrderStatus;
}

export interface UpdateOrderInput {
  datetime?: string;
  total_amount?: number;
  payment_method?: PaymentMethod;
  status?: OrderStatus;
}


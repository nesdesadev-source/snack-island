export interface OrderItem {
  id: string;
  order_id: string | null;
  quantity: number;
  subtotal: number;
  created_at: string | null;
  created_by: string | null;
  menu_id: string | null;
}

export interface CreateOrderItemInput {
  order_id: string;
  menu_id: string;
  quantity: number;
  subtotal: number;
  created_by?: string | null;
}

export interface UpdateOrderItemInput {
  order_id?: string;
  menu_id?: string;
  quantity?: number;
  subtotal?: number;
  created_by?: string | null;
}


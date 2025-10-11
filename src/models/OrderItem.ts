export interface OrderItem {
  id: string;
  order_id: string;
  item_id: string;
  quantity: number;
  subtotal: number;
}

export interface CreateOrderItemInput {
  order_id: string;
  item_id: string;
  quantity: number;
  subtotal: number;
}

export interface UpdateOrderItemInput {
  order_id?: string;
  item_id?: string;
  quantity?: number;
  subtotal?: number;
}


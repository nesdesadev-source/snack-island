export type InventoryType = 'solid' | 'liquid';

export type InventoryUnit = 'pcs' | 'kg' | 'L' | 'mL' | 'g';

// This matches the actual database schema from Supabase
export interface Inventory {
  id: string;
  name: string;
  unit: InventoryUnit;
  quantity: number;
  reorder_level: number;
  is_active?: boolean;
  supplier_id?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface CreateInventoryInput {
  name: string;
  unit: InventoryUnit;
  quantity: number;
  reorder_level: number;
  is_active?: boolean;
  supplier_id: string;
}

export interface UpdateInventoryInput {
  name?: string;
  unit?: InventoryUnit;
  quantity?: number;
  reorder_level?: number;
  is_active?: boolean;
  supplier_id?: string;
}


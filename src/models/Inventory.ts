export type InventoryType = 'solid' | 'liquid';

export type InventoryUnit = 'pcs' | 'kg' | 'L' | 'mL' | 'g';

export interface Inventory {
  id: string;
  item_name: string;
  unit: InventoryUnit;
  current_stock: number;
  cost_per_unit: number;
  reorder_level: number;
  type: InventoryType;
}

export interface CreateInventoryInput {
  item_name: string;
  unit: InventoryUnit;
  current_stock: number;
  cost_per_unit: number;
  reorder_level: number;
  type: InventoryType;
}

export interface UpdateInventoryInput {
  item_name?: string;
  unit?: InventoryUnit;
  current_stock?: number;
  cost_per_unit?: number;
  reorder_level?: number;
  type?: InventoryType;
}


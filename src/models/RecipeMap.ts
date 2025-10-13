export type UsageType = 'per_order' | 'per_batch';

export interface RecipeMap {
  id: string;
  menu_item_id: string;
  ingredient_id: string;
  usage_per_order: number;
  usage_type: UsageType;
  purchase_price: number;
  purchase_quantity: number;
  purchase_unit: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateRecipeMapInput {
  menu_item_id: string;
  ingredient_id: string;
  usage_per_order: number;
  usage_type: UsageType;
  purchase_price: number;
  purchase_quantity: number;
  purchase_unit: string;
}

export interface UpdateRecipeMapInput {
  menu_item_id?: string;
  ingredient_id?: string;
  usage_per_order?: number;
  usage_type?: UsageType;
  purchase_price?: number;
  purchase_quantity?: number;
  purchase_unit?: string;
}


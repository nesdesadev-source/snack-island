export type UsageType = 'per_order' | 'per_batch';

export interface RecipeMap {
  id: string;
  menu_item_id: string;
  ingredient_id: string;
  usage_per_order: number;
  usage_type: UsageType;
}

export interface CreateRecipeMapInput {
  menu_item_id: string;
  ingredient_id: string;
  usage_per_order: number;
  usage_type: UsageType;
}

export interface UpdateRecipeMapInput {
  menu_item_id?: string;
  ingredient_id?: string;
  usage_per_order?: number;
  usage_type?: UsageType;
}


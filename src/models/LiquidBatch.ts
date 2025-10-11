export type BatchStatus = 'active' | 'replaced';

export interface LiquidBatch {
  id: string;
  ingredient_id: string;
  batch_volume: number;
  expected_servings: number;
  servings_used: number;
  start_date: string;
  status: BatchStatus;
}

export interface CreateLiquidBatchInput {
  ingredient_id: string;
  batch_volume: number;
  expected_servings: number;
  servings_used?: number;
  start_date: string;
  status?: BatchStatus;
}

export interface UpdateLiquidBatchInput {
  ingredient_id?: string;
  batch_volume?: number;
  expected_servings?: number;
  servings_used?: number;
  start_date?: string;
  status?: BatchStatus;
}


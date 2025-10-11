import type { LiquidBatch } from '../models';

/**
 * Calculates the stock level after deducting usage amount
 * Prevents stock from going below zero
 */
export function calculateStockAfterDeduction(
  currentStock: number,
  usageAmount: number
): number {
  const result = currentStock - usageAmount;
  return Math.max(0, result);
}

/**
 * Checks if current stock is at or below the reorder level
 */
export function isLowStock(
  currentStock: number,
  reorderLevel: number
): boolean {
  return currentStock <= reorderLevel;
}

/**
 * Calculates the progress percentage of a liquid batch
 * Returns value between 0-100 (or more if overused)
 */
export function calculateBatchProgress(batch: LiquidBatch): number {
  if (batch.expected_servings === 0) return 0;
  
  const progress = (batch.servings_used / batch.expected_servings) * 100;
  return Math.round(progress);
}

/**
 * Determines if a batch should be replaced based on usage
 * Default threshold is 100%, but can be set lower (e.g., 90%) for early warning
 */
export function shouldReplaceBatch(
  batch: LiquidBatch,
  threshold: number = 100
): boolean {
  const progress = calculateBatchProgress(batch);
  return progress >= threshold;
}

/**
 * Calculates liquid efficiency by comparing expected vs actual usage
 * Returns percentage where:
 * - 100% = perfect match
 * - >100% = more efficient (used less than expected)
 * - <100% = less efficient (used more than expected)
 */
export function calculateLiquidEfficiency(
  expectedUsage: number,
  actualUsage: number
): number {
  if (actualUsage === 0) return Infinity;
  
  const efficiency = (expectedUsage / actualUsage) * 100;
  return Math.round(efficiency * 100) / 100;
}

/**
 * Calculates the cost of ingredient usage
 */
export function calculateUsageCost(
  usageAmount: number,
  costPerUnit: number
): number {
  return usageAmount * costPerUnit;
}

/**
 * Adjusts stock level based on manual adjustment or actual count
 * If actualStock is provided, it overrides the calculated adjustment
 * Prevents stock from going below zero
 */
export function calculateAdjustedStock(
  currentStock: number,
  adjustment: number,
  actualStock?: number
): number {
  if (actualStock !== undefined) {
    return actualStock;
  }
  
  const adjusted = currentStock + adjustment;
  return Math.max(0, adjusted);
}

/**
 * Calculates how many servings remain in a liquid batch
 */
export function calculateEstimatedServingsRemaining(
  batch: LiquidBatch
): number {
  const remaining = batch.expected_servings - batch.servings_used;
  return Math.max(0, remaining);
}

/**
 * Calculates the usage percentage of a batch
 * Can exceed 100% if batch is overused
 */
export function calculateBatchUsagePercentage(
  servingsUsed: number,
  expectedServings: number
): number {
  if (expectedServings === 0) return 0;
  
  const percentage = (servingsUsed / expectedServings) * 100;
  return Math.round(percentage);
}

/**
 * Calculates how much stock to reorder to reach optimal level
 * Returns 0 if current stock is above reorder level
 * If no optimal stock is provided, uses reorder level as target
 * Always ensures target is at least at the reorder level
 */
export function calculateReorderQuantity(
  currentStock: number,
  reorderLevel: number,
  optimalStock?: number
): number {
  if (currentStock > reorderLevel) {
    return 0;
  }
  
  const targetStock = optimalStock !== undefined 
    ? Math.max(optimalStock, reorderLevel)
    : reorderLevel;
  const reorderAmount = targetStock - currentStock;
  
  return Math.max(0, reorderAmount);
}


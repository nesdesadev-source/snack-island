import { describe, it, expect } from 'vitest';
import {
  calculateStockAfterDeduction,
  isLowStock,
  calculateBatchProgress,
  shouldReplaceBatch,
  calculateLiquidEfficiency,
  calculateUsageCost,
  calculateAdjustedStock,
  calculateEstimatedServingsRemaining,
  calculateBatchUsagePercentage,
  calculateReorderQuantity
} from '../../src/services/inventoryService';
import type { Inventory, LiquidBatch } from '../../src/models';

describe('Inventory Service - Stock Calculations', () => {
  describe('calculateStockAfterDeduction', () => {
    it('should correctly deduct solid items from current stock', () => {
      const currentStock = 50;
      const usageAmount = 10;
      
      const result = calculateStockAfterDeduction(currentStock, usageAmount);
      
      expect(result).toBe(40);
    });

    it('should handle decimal values for liquid measurements', () => {
      const currentStock = 5.5;
      const usageAmount = 0.05;
      
      const result = calculateStockAfterDeduction(currentStock, usageAmount);
      
      expect(result).toBeCloseTo(5.45, 2);
    });

    it('should return 0 when deduction exceeds current stock', () => {
      const currentStock = 5;
      const usageAmount = 10;
      
      const result = calculateStockAfterDeduction(currentStock, usageAmount);
      
      expect(result).toBe(0);
    });

    it('should handle zero usage amount', () => {
      const currentStock = 100;
      const usageAmount = 0;
      
      const result = calculateStockAfterDeduction(currentStock, usageAmount);
      
      expect(result).toBe(100);
    });
  });

  describe('isLowStock', () => {
    it('should return true when stock is below reorder level', () => {
      const currentStock = 5;
      const reorderLevel = 10;
      
      const result = isLowStock(currentStock, reorderLevel);
      
      expect(result).toBe(true);
    });

    it('should return true when stock equals reorder level', () => {
      const currentStock = 10;
      const reorderLevel = 10;
      
      const result = isLowStock(currentStock, reorderLevel);
      
      expect(result).toBe(true);
    });

    it('should return false when stock is above reorder level', () => {
      const currentStock = 15;
      const reorderLevel = 10;
      
      const result = isLowStock(currentStock, reorderLevel);
      
      expect(result).toBe(false);
    });

    it('should handle decimal values for liquid stock', () => {
      const currentStock = 0.5;
      const reorderLevel = 1.0;
      
      const result = isLowStock(currentStock, reorderLevel);
      
      expect(result).toBe(true);
    });
  });

  describe('calculateBatchProgress', () => {
    it('should calculate correct progress percentage for active batch', () => {
      const batch: LiquidBatch = {
        id: '1',
        ingredient_id: 'oil-1',
        batch_volume: 5.0,
        expected_servings: 100,
        servings_used: 50,
        start_date: '2025-10-01',
        status: 'active'
      };
      
      const result = calculateBatchProgress(batch);
      
      expect(result).toBe(50);
    });

    it('should return 100 when servings used equals expected servings', () => {
      const batch: LiquidBatch = {
        id: '1',
        ingredient_id: 'oil-1',
        batch_volume: 5.0,
        expected_servings: 100,
        servings_used: 100,
        start_date: '2025-10-01',
        status: 'active'
      };
      
      const result = calculateBatchProgress(batch);
      
      expect(result).toBe(100);
    });

    it('should handle batches with no servings used yet', () => {
      const batch: LiquidBatch = {
        id: '1',
        ingredient_id: 'oil-1',
        batch_volume: 5.0,
        expected_servings: 100,
        servings_used: 0,
        start_date: '2025-10-01',
        status: 'active'
      };
      
      const result = calculateBatchProgress(batch);
      
      expect(result).toBe(0);
    });

    it('should handle decimal serving counts', () => {
      const batch: LiquidBatch = {
        id: '1',
        ingredient_id: 'oil-1',
        batch_volume: 5.0,
        expected_servings: 100,
        servings_used: 33,
        start_date: '2025-10-01',
        status: 'active'
      };
      
      const result = calculateBatchProgress(batch);
      
      expect(result).toBe(33);
    });
  });

  describe('shouldReplaceBatch', () => {
    it('should return true when servings used reaches expected servings', () => {
      const batch: LiquidBatch = {
        id: '1',
        ingredient_id: 'oil-1',
        batch_volume: 5.0,
        expected_servings: 100,
        servings_used: 100,
        start_date: '2025-10-01',
        status: 'active'
      };
      
      const result = shouldReplaceBatch(batch);
      
      expect(result).toBe(true);
    });

    it('should return true when servings used exceeds expected servings', () => {
      const batch: LiquidBatch = {
        id: '1',
        ingredient_id: 'oil-1',
        batch_volume: 5.0,
        expected_servings: 100,
        servings_used: 105,
        start_date: '2025-10-01',
        status: 'active'
      };
      
      const result = shouldReplaceBatch(batch);
      
      expect(result).toBe(true);
    });

    it('should return false when servings used is below threshold', () => {
      const batch: LiquidBatch = {
        id: '1',
        ingredient_id: 'oil-1',
        batch_volume: 5.0,
        expected_servings: 100,
        servings_used: 50,
        start_date: '2025-10-01',
        status: 'active'
      };
      
      const result = shouldReplaceBatch(batch);
      
      expect(result).toBe(false);
    });

    it('should return true when batch is at 90% or more threshold', () => {
      const batch: LiquidBatch = {
        id: '1',
        ingredient_id: 'oil-1',
        batch_volume: 5.0,
        expected_servings: 100,
        servings_used: 90,
        start_date: '2025-10-01',
        status: 'active'
      };
      const threshold = 90;
      
      const result = shouldReplaceBatch(batch, threshold);
      
      expect(result).toBe(true);
    });
  });

  describe('calculateLiquidEfficiency', () => {
    it('should calculate efficiency percentage when actual matches expected', () => {
      const expectedUsage = 5.0;
      const actualUsage = 5.0;
      
      const result = calculateLiquidEfficiency(expectedUsage, actualUsage);
      
      expect(result).toBe(100);
    });

    it('should calculate efficiency when actual is less than expected (more efficient)', () => {
      const expectedUsage = 5.0;
      const actualUsage = 4.0;
      
      const result = calculateLiquidEfficiency(expectedUsage, actualUsage);
      
      expect(result).toBe(125);
    });

    it('should calculate efficiency when actual is more than expected (less efficient)', () => {
      const expectedUsage = 5.0;
      const actualUsage = 6.0;
      
      const result = calculateLiquidEfficiency(expectedUsage, actualUsage);
      
      expect(result).toBeCloseTo(83.33, 2);
    });

    it('should handle zero actual usage', () => {
      const expectedUsage = 5.0;
      const actualUsage = 0;
      
      const result = calculateLiquidEfficiency(expectedUsage, actualUsage);
      
      expect(result).toBe(Infinity);
    });

    it('should handle decimal values', () => {
      const expectedUsage = 0.5;
      const actualUsage = 0.45;
      
      const result = calculateLiquidEfficiency(expectedUsage, actualUsage);
      
      expect(result).toBeCloseTo(111.11, 2);
    });
  });

  describe('calculateUsageCost', () => {
    it('should calculate correct cost for solid item usage', () => {
      const usageAmount = 10;
      const costPerUnit = 5;
      
      const result = calculateUsageCost(usageAmount, costPerUnit);
      
      expect(result).toBe(50);
    });

    it('should calculate correct cost for liquid item usage', () => {
      const usageAmount = 0.05;
      const costPerUnit = 200;
      
      const result = calculateUsageCost(usageAmount, costPerUnit);
      
      expect(result).toBe(10);
    });

    it('should handle zero usage amount', () => {
      const usageAmount = 0;
      const costPerUnit = 100;
      
      const result = calculateUsageCost(usageAmount, costPerUnit);
      
      expect(result).toBe(0);
    });

    it('should handle decimal cost values', () => {
      const usageAmount = 3;
      const costPerUnit = 15.50;
      
      const result = calculateUsageCost(usageAmount, costPerUnit);
      
      expect(result).toBe(46.5);
    });
  });

  describe('calculateAdjustedStock', () => {
    it('should increase stock when adjustment is positive', () => {
      const currentStock = 50;
      const adjustment = 20;
      
      const result = calculateAdjustedStock(currentStock, adjustment);
      
      expect(result).toBe(70);
    });

    it('should decrease stock when adjustment is negative', () => {
      const currentStock = 50;
      const adjustment = -20;
      
      const result = calculateAdjustedStock(currentStock, adjustment);
      
      expect(result).toBe(30);
    });

    it('should handle zero adjustment', () => {
      const currentStock = 50;
      const adjustment = 0;
      
      const result = calculateAdjustedStock(currentStock, adjustment);
      
      expect(result).toBe(50);
    });

    it('should set to actual stock when provided', () => {
      const currentStock = 50;
      const adjustment = 0;
      const actualStock = 45;
      
      const result = calculateAdjustedStock(currentStock, adjustment, actualStock);
      
      expect(result).toBe(45);
    });

    it('should handle decimal adjustments for liquids', () => {
      const currentStock = 5.5;
      const adjustment = -0.3;
      
      const result = calculateAdjustedStock(currentStock, adjustment);
      
      expect(result).toBeCloseTo(5.2, 2);
    });

    it('should not allow stock to go below zero', () => {
      const currentStock = 10;
      const adjustment = -20;
      
      const result = calculateAdjustedStock(currentStock, adjustment);
      
      expect(result).toBe(0);
    });
  });

  describe('calculateEstimatedServingsRemaining', () => {
    it('should calculate remaining servings in active batch', () => {
      const batch: LiquidBatch = {
        id: '1',
        ingredient_id: 'oil-1',
        batch_volume: 5.0,
        expected_servings: 100,
        servings_used: 30,
        start_date: '2025-10-01',
        status: 'active'
      };
      
      const result = calculateEstimatedServingsRemaining(batch);
      
      expect(result).toBe(70);
    });

    it('should return 0 when all servings are used', () => {
      const batch: LiquidBatch = {
        id: '1',
        ingredient_id: 'oil-1',
        batch_volume: 5.0,
        expected_servings: 100,
        servings_used: 100,
        start_date: '2025-10-01',
        status: 'active'
      };
      
      const result = calculateEstimatedServingsRemaining(batch);
      
      expect(result).toBe(0);
    });

    it('should return 0 when servings used exceeds expected', () => {
      const batch: LiquidBatch = {
        id: '1',
        ingredient_id: 'oil-1',
        batch_volume: 5.0,
        expected_servings: 100,
        servings_used: 110,
        start_date: '2025-10-01',
        status: 'active'
      };
      
      const result = calculateEstimatedServingsRemaining(batch);
      
      expect(result).toBe(0);
    });
  });

  describe('calculateBatchUsagePercentage', () => {
    it('should calculate correct usage percentage', () => {
      const servingsUsed = 50;
      const expectedServings = 100;
      
      const result = calculateBatchUsagePercentage(servingsUsed, expectedServings);
      
      expect(result).toBe(50);
    });

    it('should return 0 when no servings are used', () => {
      const servingsUsed = 0;
      const expectedServings = 100;
      
      const result = calculateBatchUsagePercentage(servingsUsed, expectedServings);
      
      expect(result).toBe(0);
    });

    it('should handle over 100% usage', () => {
      const servingsUsed = 120;
      const expectedServings = 100;
      
      const result = calculateBatchUsagePercentage(servingsUsed, expectedServings);
      
      expect(result).toBe(120);
    });

    it('should round to 2 decimal places', () => {
      const servingsUsed = 33;
      const expectedServings = 100;
      
      const result = calculateBatchUsagePercentage(servingsUsed, expectedServings);
      
      expect(result).toBe(33);
    });
  });

  describe('calculateReorderQuantity', () => {
    it('should calculate reorder quantity to reach optimal level', () => {
      const currentStock = 5;
      const reorderLevel = 10;
      const optimalStock = 50;
      
      const result = calculateReorderQuantity(currentStock, reorderLevel, optimalStock);
      
      expect(result).toBe(45);
    });

    it('should return 0 when stock is above reorder level', () => {
      const currentStock = 60;
      const reorderLevel = 10;
      const optimalStock = 50;
      
      const result = calculateReorderQuantity(currentStock, reorderLevel, optimalStock);
      
      expect(result).toBe(0);
    });

    it('should calculate to reach optimal when no optimal provided', () => {
      const currentStock = 5;
      const reorderLevel = 10;
      
      const result = calculateReorderQuantity(currentStock, reorderLevel);
      
      expect(result).toBe(5);
    });

    it('should handle decimal values for liquids', () => {
      const currentStock = 0.5;
      const reorderLevel = 1.0;
      const optimalStock = 5.0;
      
      const result = calculateReorderQuantity(currentStock, reorderLevel, optimalStock);
      
      expect(result).toBe(4.5);
    });

    it('should return at least enough to reach reorder level', () => {
      const currentStock = 3;
      const reorderLevel = 10;
      const optimalStock = 8;
      
      const result = calculateReorderQuantity(currentStock, reorderLevel, optimalStock);
      
      expect(result).toBe(7);
    });
  });
});


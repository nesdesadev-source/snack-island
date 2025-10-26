import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  deductInventoryForOrder, 
  restoreInventoryForOrder,
  checkInventoryAvailability, 
  getInventoryImpactSummary 
} from '../../../src/modules/orders/inventoryDeduction'
import { inventoryService } from '../../../src/services/inventoryService'
import { recipeMapService } from '../../../src/services/recipeMapService'
import type { OrderItem, RecipeMap } from '../../../src/models'

// Mock the services
vi.mock('../../../src/services/inventoryService')
vi.mock('../../../src/services/recipeMapService')

const mockInventoryService = vi.mocked(inventoryService)
const mockRecipeMapService = vi.mocked(recipeMapService)

describe('Inventory Deduction Module', () => {
  const mockOrderItems: OrderItem[] = [
    {
      id: 'item-1',
      order_id: 'order-1',
      quantity: 2,
      subtotal: 100,
      created_at: '2025-01-01T00:00:00Z',
      created_by: 'user-1',
      menu_id: 'menu-1'
    },
    {
      id: 'item-2',
      order_id: 'order-1',
      quantity: 1,
      subtotal: 50,
      created_at: '2025-01-01T00:00:00Z',
      created_by: 'user-1',
      menu_id: 'menu-2'
    }
  ]

  const mockRecipeMappings: RecipeMap[] = [
    {
      id: 'recipe-1',
      menu_item_id: 'menu-1',
      ingredient_id: 'ingredient-1',
      usage_per_order: 2.5,
      usage_type: 'per_order',
      purchase_price: 10.0,
      purchase_quantity: 1,
      purchase_unit: 'kg',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z'
    },
    {
      id: 'recipe-2',
      menu_item_id: 'menu-1',
      ingredient_id: 'ingredient-2',
      usage_per_order: 1.0,
      usage_type: 'per_order',
      purchase_price: 5.0,
      purchase_quantity: 1,
      purchase_unit: 'piece',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z'
    },
    {
      id: 'recipe-3',
      menu_item_id: 'menu-2',
      ingredient_id: 'ingredient-3',
      usage_per_order: 3.0,
      usage_type: 'per_order',
      purchase_price: 8.0,
      purchase_quantity: 1,
      purchase_unit: 'liter',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z'
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('deductInventoryForOrder', () => {
    it('should calculate correct usage amounts and update inventory', async () => {
      // Arrange - Mock service responses
      mockRecipeMapService.getRecipeMaps.mockResolvedValue(mockRecipeMappings)
      
      // Mock inventory items with realistic data
      const flourInventory = {
        id: 'ingredient-1',
        name: 'Flour',
        unit: 'kg',
        quantity: 10,
        reorder_level: 2,
        supplier_id: 'supplier-1'
      }
      const eggsInventory = {
        id: 'ingredient-2',
        name: 'Eggs',
        unit: 'piece',
        quantity: 20,
        reorder_level: 5,
        supplier_id: 'supplier-2'
      }
      const oilInventory = {
        id: 'ingredient-3',
        name: 'Oil',
        unit: 'liter',
        quantity: 15,
        reorder_level: 3,
        supplier_id: 'supplier-3'
      }

      mockInventoryService.getById
        .mockResolvedValueOnce(flourInventory)
        .mockResolvedValueOnce(eggsInventory)
        .mockResolvedValueOnce(oilInventory)
      
      mockInventoryService.updateItem.mockResolvedValue(true)

      // Act
      await deductInventoryForOrder(mockOrderItems)

      // Assert - Verify service calls
      expect(mockRecipeMapService.getRecipeMaps).toHaveBeenCalledTimes(1)
      expect(mockInventoryService.getById).toHaveBeenCalledTimes(3)
      expect(mockInventoryService.updateItem).toHaveBeenCalledTimes(3)

      // Verify correct calculations for each ingredient
      // Flour: 10 - (2.5 * 2) = 5
      expect(mockInventoryService.updateItem).toHaveBeenNthCalledWith(1, {
        id: 'ingredient-1',
        name: 'Flour',
        unit: 'kg',
        quantity: 5,
        reorder_level: 2,
        supplier_id: 'supplier-1'
      })

      // Eggs: 20 - (1.0 * 2) = 18
      expect(mockInventoryService.updateItem).toHaveBeenNthCalledWith(2, {
        id: 'ingredient-2',
        name: 'Eggs',
        unit: 'piece',
        quantity: 18,
        reorder_level: 5,
        supplier_id: 'supplier-2'
      })

      // Oil: 15 - (3.0 * 1) = 12
      expect(mockInventoryService.updateItem).toHaveBeenNthCalledWith(3, {
        id: 'ingredient-3',
        name: 'Oil',
        unit: 'liter',
        quantity: 12,
        reorder_level: 3,
        supplier_id: 'supplier-3'
      })
    })

    it('should handle missing inventory items without crashing', async () => {
      // Arrange
      mockRecipeMapService.getRecipeMaps.mockResolvedValue(mockRecipeMappings)
      mockInventoryService.getById
        .mockResolvedValueOnce({
          id: 'ingredient-1',
          name: 'Flour',
          unit: 'kg',
          quantity: 10,
          reorder_level: 2,
          supplier_id: 'supplier-1'
        })
        .mockResolvedValueOnce(null) // Missing ingredient
        .mockResolvedValueOnce({
          id: 'ingredient-3',
          name: 'Oil',
          unit: 'liter',
          quantity: 15,
          reorder_level: 3,
          supplier_id: 'supplier-3'
        })

      // Act
      await deductInventoryForOrder(mockOrderItems)

      // Assert - Should only update existing items
      expect(mockInventoryService.updateItem).toHaveBeenCalledTimes(2)
      expect(mockInventoryService.updateItem).toHaveBeenCalledWith({
        id: 'ingredient-1',
        name: 'Flour',
        unit: 'kg',
        quantity: 5, // 10 - (2.5 * 2)
        reorder_level: 2,
        supplier_id: 'supplier-1'
      })
      expect(mockInventoryService.updateItem).toHaveBeenCalledWith({
        id: 'ingredient-3',
        name: 'Oil',
        unit: 'liter',
        quantity: 12, // 15 - (3.0 * 1)
        reorder_level: 3,
        supplier_id: 'supplier-3'
      })
    })

    it('should handle empty order items array', async () => {
      // Arrange
      mockRecipeMapService.getRecipeMaps.mockResolvedValue([])

      // Act
      await deductInventoryForOrder([])

      // Assert
      expect(mockRecipeMapService.getRecipeMaps).toHaveBeenCalledTimes(1)
      expect(mockInventoryService.getById).not.toHaveBeenCalled()
      expect(mockInventoryService.updateItem).not.toHaveBeenCalled()
    })

    it('should propagate errors from services', async () => {
      // Arrange
      const error = new Error('Database connection failed')
      mockRecipeMapService.getRecipeMaps.mockRejectedValue(error)

      // Act & Assert
      await expect(deductInventoryForOrder(mockOrderItems)).rejects.toThrow('Database connection failed')
    })
  })

  describe('restoreInventoryForOrder', () => {
    it('should calculate correct restoration amounts and update inventory', async () => {
      // Arrange - Mock service responses
      mockRecipeMapService.getRecipeMaps.mockResolvedValue(mockRecipeMappings)
      
      // Mock inventory items with realistic data (after deduction)
      const flourInventory = {
        id: 'ingredient-1',
        name: 'Flour',
        unit: 'kg',
        quantity: 5, // After deduction
        reorder_level: 2,
        supplier_id: 'supplier-1'
      }
      const eggsInventory = {
        id: 'ingredient-2',
        name: 'Eggs',
        unit: 'piece',
        quantity: 18, // After deduction
        reorder_level: 5,
        supplier_id: 'supplier-2'
      }
      const oilInventory = {
        id: 'ingredient-3',
        name: 'Oil',
        unit: 'liter',
        quantity: 12, // After deduction
        reorder_level: 3,
        supplier_id: 'supplier-3'
      }

      mockInventoryService.getById
        .mockResolvedValueOnce(flourInventory)
        .mockResolvedValueOnce(eggsInventory)
        .mockResolvedValueOnce(oilInventory)
      
      mockInventoryService.updateItem.mockResolvedValue(true)

      // Act
      await restoreInventoryForOrder(mockOrderItems)

      // Assert - Verify service calls
      expect(mockRecipeMapService.getRecipeMaps).toHaveBeenCalledTimes(1)
      expect(mockInventoryService.getById).toHaveBeenCalledTimes(3)
      expect(mockInventoryService.updateItem).toHaveBeenCalledTimes(3)

      // Verify correct restoration calculations for each ingredient
      // Flour: 5 + (2.5 * 2) = 10
      expect(mockInventoryService.updateItem).toHaveBeenNthCalledWith(1, {
        id: 'ingredient-1',
        name: 'Flour',
        unit: 'kg',
        quantity: 10,
        reorder_level: 2,
        supplier_id: 'supplier-1'
      })

      // Eggs: 18 + (1.0 * 2) = 20
      expect(mockInventoryService.updateItem).toHaveBeenNthCalledWith(2, {
        id: 'ingredient-2',
        name: 'Eggs',
        unit: 'piece',
        quantity: 20,
        reorder_level: 5,
        supplier_id: 'supplier-2'
      })

      // Oil: 12 + (3.0 * 1) = 15
      expect(mockInventoryService.updateItem).toHaveBeenNthCalledWith(3, {
        id: 'ingredient-3',
        name: 'Oil',
        unit: 'liter',
        quantity: 15,
        reorder_level: 3,
        supplier_id: 'supplier-3'
      })
    })

    it('should handle missing inventory items without crashing', async () => {
      // Arrange
      mockRecipeMapService.getRecipeMaps.mockResolvedValue(mockRecipeMappings)
      mockInventoryService.getById
        .mockResolvedValueOnce({
          id: 'ingredient-1',
          name: 'Flour',
          unit: 'kg',
          quantity: 5,
          reorder_level: 2,
          supplier_id: 'supplier-1'
        })
        .mockResolvedValueOnce(null) // Missing ingredient
        .mockResolvedValueOnce({
          id: 'ingredient-3',
          name: 'Oil',
          unit: 'liter',
          quantity: 12,
          reorder_level: 3,
          supplier_id: 'supplier-3'
        })

      // Act
      await restoreInventoryForOrder(mockOrderItems)

      // Assert - Should only update existing items
      expect(mockInventoryService.updateItem).toHaveBeenCalledTimes(2)
      expect(mockInventoryService.updateItem).toHaveBeenCalledWith({
        id: 'ingredient-1',
        name: 'Flour',
        unit: 'kg',
        quantity: 10, // 5 + (2.5 * 2)
        reorder_level: 2,
        supplier_id: 'supplier-1'
      })
      expect(mockInventoryService.updateItem).toHaveBeenCalledWith({
        id: 'ingredient-3',
        name: 'Oil',
        unit: 'liter',
        quantity: 15, // 12 + (3.0 * 1)
        reorder_level: 3,
        supplier_id: 'supplier-3'
      })
    })

    it('should handle empty order items array', async () => {
      // Arrange
      mockRecipeMapService.getRecipeMaps.mockResolvedValue([])

      // Act
      await restoreInventoryForOrder([])

      // Assert
      expect(mockRecipeMapService.getRecipeMaps).toHaveBeenCalledTimes(1)
      expect(mockInventoryService.getById).not.toHaveBeenCalled()
      expect(mockInventoryService.updateItem).not.toHaveBeenCalled()
    })

    it('should propagate errors from services', async () => {
      // Arrange
      const error = new Error('Database connection failed')
      mockRecipeMapService.getRecipeMaps.mockRejectedValue(error)

      // Act & Assert
      await expect(restoreInventoryForOrder(mockOrderItems)).rejects.toThrow('Database connection failed')
    })
  })

  describe('checkInventoryAvailability', () => {
    it('should return available when inventory is sufficient', async () => {
      // Arrange
      mockRecipeMapService.getRecipeMappingsByMenuItems.mockResolvedValue(mockRecipeMappings)
      mockInventoryService.getInventoryItem
        .mockResolvedValueOnce({
          ingredient_id: 'ingredient-1',
          item_name: 'Flour',
          current_stock: 10,
          type: 'solid'
        })
        .mockResolvedValueOnce({
          ingredient_id: 'ingredient-2',
          item_name: 'Eggs',
          current_stock: 20,
          type: 'solid'
        })
        .mockResolvedValueOnce({
          ingredient_id: 'ingredient-3',
          item_name: 'Oil',
          current_stock: 15,
          type: 'solid'
        })

      // Act
      const result = await checkInventoryAvailability(mockOrderItems)

      // Assert
      expect(result.isAvailable).toBe(true)
      expect(result.insufficientItems).toHaveLength(0)
      expect(mockRecipeMapService.getRecipeMappingsByMenuItems).toHaveBeenCalledWith(['menu-1', 'menu-2'])
    })

    it('should identify insufficient inventory items with correct calculations', async () => {
      // Arrange
      mockRecipeMapService.getRecipeMappingsByMenuItems.mockResolvedValue(mockRecipeMappings)
      mockInventoryService.getInventoryItem
        .mockResolvedValueOnce({
          ingredient_id: 'ingredient-1',
          item_name: 'Flour',
          current_stock: 2, // Less than required (2.5 * 2 = 5)
          type: 'solid'
        })
        .mockResolvedValueOnce({
          ingredient_id: 'ingredient-2',
          item_name: 'Eggs',
          current_stock: 1, // Less than required (1.0 * 2 = 2)
          type: 'solid'
        })
        .mockResolvedValueOnce({
          ingredient_id: 'ingredient-3',
          item_name: 'Oil',
          current_stock: 10, // Sufficient (3.0 * 1 = 3)
          type: 'solid'
        })

      // Act
      const result = await checkInventoryAvailability(mockOrderItems)

      // Assert
      expect(result.isAvailable).toBe(false)
      expect(result.insufficientItems).toHaveLength(2)
      
      // Verify correct calculations
      const flourShortage = result.insufficientItems.find(item => item.ingredientId === 'ingredient-1')
      expect(flourShortage).toEqual({
        ingredientId: 'ingredient-1',
        ingredientName: 'Flour',
        required: 5, // 2.5 * 2
        available: 2
      })

      const eggsShortage = result.insufficientItems.find(item => item.ingredientId === 'ingredient-2')
      expect(eggsShortage).toEqual({
        ingredientId: 'ingredient-2',
        ingredientName: 'Eggs',
        required: 2, // 1.0 * 2
        available: 1
      })
    })

    it('should handle missing inventory items gracefully', async () => {
      // Arrange
      mockRecipeMapService.getRecipeMappingsByMenuItems.mockResolvedValue(mockRecipeMappings)
      mockInventoryService.getInventoryItem
        .mockResolvedValueOnce({
          ingredient_id: 'ingredient-1',
          item_name: 'Flour',
          current_stock: 10,
          type: 'solid'
        })
        .mockResolvedValueOnce(null) // Missing inventory
        .mockResolvedValueOnce({
          ingredient_id: 'ingredient-3',
          item_name: 'Oil',
          current_stock: 15,
          type: 'solid'
        })

      // Act
      const result = await checkInventoryAvailability(mockOrderItems)

      // Assert
      expect(result.isAvailable).toBe(true) // Missing items don't cause insufficiency
      expect(result.insufficientItems).toHaveLength(0)
    })

    it('should handle empty order items array', async () => {
      // Arrange
      mockRecipeMapService.getRecipeMappingsByMenuItems.mockResolvedValue([])

      // Act
      const result = await checkInventoryAvailability([])

      // Assert
      expect(result.isAvailable).toBe(true)
      expect(result.insufficientItems).toHaveLength(0)
    })

    it('should propagate service errors', async () => {
      // Arrange
      const error = new Error('Service unavailable')
      mockRecipeMapService.getRecipeMappingsByMenuItems.mockRejectedValue(error)

      // Act & Assert
      await expect(checkInventoryAvailability(mockOrderItems)).rejects.toThrow('Service unavailable')
    })
  })

  describe('getInventoryImpactSummary', () => {
    it('should calculate correct impact summary for solid items', async () => {
      // Arrange
      mockRecipeMapService.getRecipeMappingsByMenuItems.mockResolvedValue(mockRecipeMappings)
      mockInventoryService.getInventoryItem
        .mockResolvedValueOnce({
          ingredient_id: 'ingredient-1',
          item_name: 'Flour',
          current_stock: 10,
          type: 'solid'
        })
        .mockResolvedValueOnce({
          ingredient_id: 'ingredient-2',
          item_name: 'Eggs',
          current_stock: 20,
          type: 'solid'
        })
        .mockResolvedValueOnce({
          ingredient_id: 'ingredient-3',
          item_name: 'Oil',
          current_stock: 15,
          type: 'solid'
        })

      // Act
      const result = await getInventoryImpactSummary(mockOrderItems)

      // Assert
      expect(result.solidItems).toHaveLength(3)
      expect(result.liquidBatches).toHaveLength(0)

      // Verify calculations
      const flourImpact = result.solidItems.find(item => item.ingredientId === 'ingredient-1')
      expect(flourImpact).toEqual({
        ingredientId: 'ingredient-1',
        ingredientName: 'Flour',
        currentStock: 10,
        usage: 5, // 2.5 * 2
        remainingStock: 5 // 10 - 5
      })

      const eggsImpact = result.solidItems.find(item => item.ingredientId === 'ingredient-2')
      expect(eggsImpact).toEqual({
        ingredientId: 'ingredient-2',
        ingredientName: 'Eggs',
        currentStock: 20,
        usage: 2, // 1.0 * 2
        remainingStock: 18 // 20 - 2
      })

      const oilImpact = result.solidItems.find(item => item.ingredientId === 'ingredient-3')
      expect(oilImpact).toEqual({
        ingredientId: 'ingredient-3',
        ingredientName: 'Oil',
        currentStock: 15,
        usage: 3, // 3.0 * 1
        remainingStock: 12 // 15 - 3
      })
    })

    it('should aggregate usage for same ingredient across multiple orders', async () => {
      // Arrange
      const orderItemsWithSameIngredient: OrderItem[] = [
        {
          id: 'item-1',
          order_id: 'order-1',
          quantity: 2,
          subtotal: 100,
          created_at: '2025-01-01T00:00:00Z',
          created_by: 'user-1',
          menu_id: 'menu-1'
        },
        {
          id: 'item-2',
          order_id: 'order-1',
          quantity: 1,
          subtotal: 50,
          created_at: '2025-01-01T00:00:00Z',
          created_by: 'user-1',
          menu_id: 'menu-1' // Same menu item
        }
      ]

      const recipeMappingsForSameIngredient: RecipeMap[] = [
        {
          id: 'recipe-1',
          menu_item_id: 'menu-1',
          ingredient_id: 'ingredient-1',
          usage_per_order: 2.0,
          usage_type: 'per_order',
          purchase_price: 10.0,
          purchase_quantity: 1,
          purchase_unit: 'kg',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z'
        }
      ]

      mockRecipeMapService.getRecipeMappingsByMenuItems.mockResolvedValue(recipeMappingsForSameIngredient)
      mockInventoryService.getInventoryItem.mockResolvedValueOnce({
        ingredient_id: 'ingredient-1',
        item_name: 'Flour',
        current_stock: 10,
        type: 'solid'
      })

      // Act
      const result = await getInventoryImpactSummary(orderItemsWithSameIngredient)

      // Assert
      expect(result.solidItems).toHaveLength(1)
      const flourItem = result.solidItems[0]
      expect(flourItem.usage).toBe(6) // 2.0 * (2 + 1) = 6
      expect(flourItem.remainingStock).toBe(4) // 10 - 6
    })

    it('should handle missing inventory items', async () => {
      // Arrange
      mockRecipeMapService.getRecipeMappingsByMenuItems.mockResolvedValue(mockRecipeMappings)
      mockInventoryService.getInventoryItem
        .mockResolvedValueOnce({
          ingredient_id: 'ingredient-1',
          item_name: 'Flour',
          current_stock: 10,
          type: 'solid'
        })
        .mockResolvedValueOnce(null) // Missing inventory
        .mockResolvedValueOnce({
          ingredient_id: 'ingredient-3',
          item_name: 'Oil',
          current_stock: 15,
          type: 'solid'
        })

      // Act
      const result = await getInventoryImpactSummary(mockOrderItems)

      // Assert
      expect(result.solidItems).toHaveLength(2) // Only 2 items found
      expect(result.liquidBatches).toHaveLength(0)
    })

    it('should handle empty order items array', async () => {
      // Arrange
      mockRecipeMapService.getRecipeMappingsByMenuItems.mockResolvedValue([])

      // Act
      const result = await getInventoryImpactSummary([])

      // Assert
      expect(result.solidItems).toHaveLength(0)
      expect(result.liquidBatches).toHaveLength(0)
    })

    it('should propagate service errors', async () => {
      // Arrange
      const error = new Error('Database error')
      mockRecipeMapService.getRecipeMappingsByMenuItems.mockRejectedValue(error)

      // Act & Assert
      await expect(getInventoryImpactSummary(mockOrderItems)).rejects.toThrow('Database error')
    })
  })

  describe('Edge Cases', () => {
    it('should handle order items with null menu_id', async () => {
      // Arrange
      const orderItemsWithNullMenuId: OrderItem[] = [
        {
          id: 'item-1',
          order_id: 'order-1',
          quantity: 2,
          subtotal: 100,
          created_at: '2025-01-01T00:00:00Z',
          created_by: 'user-1',
          menu_id: null
        }
      ]

      mockRecipeMapService.getRecipeMaps.mockResolvedValue([])

      // Act
      await deductInventoryForOrder(orderItemsWithNullMenuId)

      // Assert
      expect(mockInventoryService.getById).not.toHaveBeenCalled()
      expect(mockInventoryService.updateItem).not.toHaveBeenCalled()
    })

    it('should handle zero quantity order items', async () => {
      // Arrange
      const zeroQuantityItems: OrderItem[] = [
        {
          id: 'item-1',
          order_id: 'order-1',
          quantity: 0,
          subtotal: 0,
          created_at: '2025-01-01T00:00:00Z',
          created_by: 'user-1',
          menu_id: 'menu-1'
        }
      ]

      mockRecipeMapService.getRecipeMaps.mockResolvedValue(mockRecipeMappings)
      mockInventoryService.getById.mockResolvedValue({
        id: 'ingredient-1',
        name: 'Flour',
        unit: 'kg',
        quantity: 10,
        reorder_level: 2,
        supplier_id: 'supplier-1'
      })
      mockInventoryService.updateItem.mockResolvedValue(true)

      // Act
      await deductInventoryForOrder(zeroQuantityItems)

      // Assert
      expect(mockInventoryService.updateItem).toHaveBeenCalledWith({
        id: 'ingredient-1',
        name: 'Flour',
        unit: 'kg',
        quantity: 10, // 10 - (2.5 * 0) = 10
        reorder_level: 2,
        supplier_id: 'supplier-1'
      })
    })

    it('should handle recipe mappings with per_batch usage type', async () => {
      // Arrange
      const recipeMappingsWithPerBatch: RecipeMap[] = [
        {
          id: 'recipe-1',
          menu_item_id: 'menu-1',
          ingredient_id: 'ingredient-1',
          usage_per_order: 2.5,
          usage_type: 'per_batch', // Different usage type
          purchase_price: 10.0,
          purchase_quantity: 1,
          purchase_unit: 'kg',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z'
        }
      ]

      mockRecipeMapService.getRecipeMappingsByMenuItems.mockResolvedValue(recipeMappingsWithPerBatch)
      mockInventoryService.getInventoryItem.mockResolvedValue({
        ingredient_id: 'ingredient-1',
        item_name: 'Flour',
        current_stock: 10,
        type: 'solid'
      })

      // Act
      const result = await checkInventoryAvailability(mockOrderItems)

      // Assert
      expect(result.isAvailable).toBe(true) // per_batch items are not checked in availability
      expect(result.insufficientItems).toHaveLength(0)
    })
  })
})
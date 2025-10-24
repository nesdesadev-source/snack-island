import type { OrderItem, RecipeMap } from '../../models'
import { inventoryService } from '../../services/inventoryService'
import { recipeMapService } from '../../services/recipeMapService'

/**
 * Deduct inventory for completed order items
 * @param orderItems - Array of order items to process
 */
export async function deductInventoryForOrder(orderItems: OrderItem[]): Promise<void> {
  try {
    // Get all recipe mappings
    const recipeMappings = await recipeMapService.getRecipeMaps()
    
    // Group recipe mappings by menu item ID for easy lookup
    const recipeMapByMenuItem = new Map<string, RecipeMap[]>()
    recipeMappings.forEach((mapping: RecipeMap) => {
      if (!recipeMapByMenuItem.has(mapping.menu_item_id)) {
        recipeMapByMenuItem.set(mapping.menu_item_id, [])
      }
      recipeMapByMenuItem.get(mapping.menu_item_id)!.push(mapping)
    })
    
    // Process each order item
    for (const orderItem of orderItems) {
      const itemRecipeMappings = recipeMapByMenuItem.get(orderItem.item_id) || []
      
      for (const recipeMapping of itemRecipeMappings) {
        await deductIngredientForOrderItem(recipeMapping, orderItem.quantity)
      }
    }
    
    console.log('Inventory deduction completed for order items:', orderItems.length)
  } catch (error) {
    console.error('Error deducting inventory for order:', error)
    throw error
  }
}

/**
 * Deduct a specific ingredient for an order item
 * @param recipeMapping - The recipe mapping containing usage information
 * @param orderQuantity - The quantity of the menu item ordered
 */
async function deductIngredientForOrderItem(
  recipeMapping: RecipeMap, 
  orderQuantity: number
): Promise<void> {
  try {
    const totalUsage = recipeMapping.usage_per_order * orderQuantity
    
    // Get current inventory item
    const inventoryItem = await inventoryService.getById(recipeMapping.ingredient_id)
    if (!inventoryItem) {
      console.warn(`Inventory item not found: ${recipeMapping.ingredient_id}`)
      return
    }
    
    // Calculate new quantity
    const newQuantity = inventoryItem.quantity - totalUsage
    
    // Update inventory with new quantity
    await inventoryService.updateItem({
      id: recipeMapping.ingredient_id,
      name: inventoryItem.name,
      unit: inventoryItem.unit,
      quantity: newQuantity,
      reorder_level: inventoryItem.reorder_level,
      supplier_id: inventoryItem.supplier_id
    })
    
    console.log(`Deducted ${totalUsage} of ingredient ${recipeMapping.ingredient_id} for ${orderQuantity} orders`)
  } catch (error) {
    console.error('Error deducting ingredient:', error)
    throw error
  }
}

/**
 * Check if there's sufficient inventory for an order
 * @param orderItems - Array of order items to check
 * @returns Object with availability status and any insufficient items
 */
export async function checkInventoryAvailability(orderItems: OrderItem[]): Promise<{
  isAvailable: boolean
  insufficientItems: Array<{
    ingredientId: string
    ingredientName: string
    required: number
    available: number
  }>
}> {
  const insufficientItems: Array<{
    ingredientId: string
    ingredientName: string
    required: number
    available: number
  }> = []
  
  try {
    // Get all recipe mappings for the menu items
    const menuItemIds = orderItems.map(item => item.item_id)
    const recipeMappings = await recipeMapService.getRecipeMappingsByMenuItems(menuItemIds)
    
    // Group recipe mappings by menu item ID
    const recipeMapByMenuItem = new Map<string, RecipeMap[]>()
    recipeMappings.forEach(mapping => {
      if (!recipeMapByMenuItem.has(mapping.menu_item_id)) {
        recipeMapByMenuItem.set(mapping.menu_item_id, [])
      }
      recipeMapByMenuItem.get(mapping.menu_item_id)!.push(mapping)
    })
    
    // Check each order item
    for (const orderItem of orderItems) {
      const itemRecipeMappings = recipeMapByMenuItem.get(orderItem.item_id) || []
      
      for (const recipeMapping of itemRecipeMappings) {
        if (recipeMapping.usage_type === 'per_order') {
          const requiredAmount = recipeMapping.usage_per_order * orderItem.quantity
          const inventory = await inventoryService.getInventoryItem(recipeMapping.ingredient_id)
          
          if (inventory && inventory.current_stock < requiredAmount) {
            insufficientItems.push({
              ingredientId: recipeMapping.ingredient_id,
              ingredientName: inventory.item_name,
              required: requiredAmount,
              available: inventory.current_stock
            })
          }
        }
      }
    }
    
    return {
      isAvailable: insufficientItems.length === 0,
      insufficientItems
    }
  } catch (error) {
    console.error('Error checking inventory availability:', error)
    throw error
  }
}

/**
 * Get inventory impact summary for an order
 * @param orderItems - Array of order items
 * @returns Summary of inventory changes
 */
export async function getInventoryImpactSummary(orderItems: OrderItem[]): Promise<{
  solidItems: Array<{
    ingredientId: string
    ingredientName: string
    currentStock: number
    usage: number
    remainingStock: number
  }>
  liquidBatches: Array<{
    ingredientId: string
    ingredientName: string
    currentServings: number
    additionalServings: number
    newTotalServings: number
  }>
}> {
  const solidItems: Array<{
    ingredientId: string
    ingredientName: string
    currentStock: number
    usage: number
    remainingStock: number
  }> = []
  
  const liquidBatches: Array<{
    ingredientId: string
    ingredientName: string
    currentServings: number
    additionalServings: number
    newTotalServings: number
  }> = []
  
  try {
    // Get recipe mappings
    const menuItemIds = orderItems.map(item => item.item_id)
    const recipeMappings = await recipeMapService.getRecipeMappingsByMenuItems(menuItemIds)
    
    // Group by ingredient and calculate totals
    const ingredientUsage = new Map<string, number>()
    const ingredientOrderCount = new Map<string, number>()
    
    for (const orderItem of orderItems) {
      const itemRecipeMappings = recipeMappings.filter(m => m.menu_item_id === orderItem.item_id)
      
      for (const mapping of itemRecipeMappings) {
        const key = mapping.ingredient_id
        const usage = mapping.usage_per_order * orderItem.quantity
        const orderCount = orderItem.quantity
        
        ingredientUsage.set(key, (ingredientUsage.get(key) || 0) + usage)
        ingredientOrderCount.set(key, (ingredientOrderCount.get(key) || 0) + orderCount)
      }
    }
    
    // Get inventory details and build summary
    for (const [ingredientId, totalUsage] of ingredientUsage) {
      const inventory = await inventoryService.getInventoryItem(ingredientId)
      const orderCount = ingredientOrderCount.get(ingredientId) || 0
      
      if (inventory) {
        if (inventory.type === 'solid') {
          solidItems.push({
            ingredientId,
            ingredientName: inventory.item_name,
            currentStock: inventory.current_stock,
            usage: totalUsage,
            remainingStock: inventory.current_stock - totalUsage
          })
        } else if (inventory.type === 'liquid') {
          // For liquid items, we track batch usage
          const batch = await inventoryService.getActiveBatch(ingredientId)
          const currentServings = batch?.servings_used || 0
          
          liquidBatches.push({
            ingredientId,
            ingredientName: inventory.item_name,
            currentServings,
            additionalServings: orderCount,
            newTotalServings: currentServings + orderCount
          })
        }
      }
    }
    
    return { solidItems, liquidBatches }
  } catch (error) {
    console.error('Error getting inventory impact summary:', error)
    throw error
  }
}

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
      const itemRecipeMappings = recipeMapByMenuItem.get(orderItem.menu_id || '') || []
      
      for (const recipeMapping of itemRecipeMappings) {
        await deductIngredientForOrderItem(recipeMapping, orderItem.quantity)
      }
    }
    
    console.log('Inventory deduction completed successfully')
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
    
    console.log(`Deducted ${totalUsage} ${inventoryItem.unit} of ingredient ${inventoryItem.name} for ${orderQuantity} orders`)
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
    const menuItemIds = orderItems.map(item => item.menu_id || '')
    const recipeMappings = await recipeMapService.getRecipeMappingsByMenuItems(menuItemIds)
    
    // Group recipe mappings by menu item ID
    const recipeMapByMenuItem = new Map<string, RecipeMap[]>()
    recipeMappings.forEach((mapping: RecipeMap) => {
      if (!recipeMapByMenuItem.has(mapping.menu_item_id)) {
        recipeMapByMenuItem.set(mapping.menu_item_id, [])
      }
      recipeMapByMenuItem.get(mapping.menu_item_id)!.push(mapping)
    })
    
    // Check each order item
    for (const orderItem of orderItems) {
      const itemRecipeMappings = recipeMapByMenuItem.get(orderItem.menu_id || '') || []
      
      for (const recipeMapping of itemRecipeMappings) {
        if (recipeMapping.usage_type === 'per_order') {
          const requiredAmount = recipeMapping.usage_per_order * orderItem.quantity
          const inventory = await inventoryService.getInventoryItem(recipeMapping.ingredient_id)
          
          if (inventory && inventory.quantity < requiredAmount) {
            insufficientItems.push({
              ingredientId: recipeMapping.ingredient_id,
              ingredientName: inventory.name,
              required: requiredAmount,
              available: inventory.quantity
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
    const menuItemIds = orderItems.map(item => item.menu_id || '')
    const recipeMappings = await recipeMapService.getRecipeMappingsByMenuItems(menuItemIds)
    
    // Group by ingredient and calculate totals
    const ingredientUsage = new Map<string, number>()
    const ingredientOrderCount = new Map<string, number>()
    
    for (const orderItem of orderItems) {
      const itemRecipeMappings = recipeMappings.filter(m => m.menu_item_id === orderItem.menu_id || '')
      
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
      
      if (inventory) {
        if (inventory.type === 'solid') {
          solidItems.push({
            ingredientId,
            ingredientName: inventory.item_name,
            currentStock: inventory.current_stock,
            usage: totalUsage,
            remainingStock: inventory.current_stock - totalUsage
          })
        } 
        // else if (inventory.type === 'liquid') {
        //   // For liquid items, we track batch usage
        //   const batch = await inventoryService.getActiveBatch(ingredientId)
        //   const currentServings = batch?.servings_used || 0
          
        //   liquidBatches.push({
        //     ingredientId,
        //     ingredientName: inventory.item_name,
        //     currentServings,
        //     additionalServings: orderCount,
        //     newTotalServings: currentServings + orderCount
        //   })
        // }
      }
    }
    
    return { solidItems, liquidBatches }
  } catch (error) {
    console.error('Error getting inventory impact summary:', error)
    throw error
  }
}

/**
 * Restore inventory for cancelled order items
 * @param orderItems - Array of order items to restore inventory for
 */
export async function restoreInventoryForOrder(orderItems: OrderItem[]): Promise<void> {
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
      const itemRecipeMappings = recipeMapByMenuItem.get(orderItem.menu_id || '') || []
      
      for (const recipeMapping of itemRecipeMappings) {
        await restoreIngredientForOrderItem(recipeMapping, orderItem.quantity)
      }
    }
    
    console.log('Inventory restored successfully')
  } catch (error) {
    console.error('Error restoring inventory for order:', error)
    throw error
  }
}

/**
 * Restore a specific ingredient for a cancelled order item
 * @param recipeMapping - The recipe mapping containing usage information
 * @param orderQuantity - The quantity of the menu item that was cancelled
 */
async function restoreIngredientForOrderItem(
  recipeMapping: RecipeMap, 
  orderQuantity: number
): Promise<void> {
  try {
    const totalUsage = recipeMapping.usage_per_order * orderQuantity
    
    // Get current inventory item
    const inventoryItem = await inventoryService.getById(recipeMapping.ingredient_id)
    if (!inventoryItem) {
      console.warn(`Inventory item not found for restoration: ${recipeMapping.ingredient_id}`)
      return
    }
    
    // Calculate new quantity (add back the usage)
    const newQuantity = inventoryItem.quantity + totalUsage
    
    // Update inventory with restored quantity
    await inventoryService.updateItem({
      id: recipeMapping.ingredient_id,
      name: inventoryItem.name,
      unit: inventoryItem.unit,
      quantity: newQuantity,
      reorder_level: inventoryItem.reorder_level,
      supplier_id: inventoryItem.supplier_id
    })
    
    console.log(`Restored ${totalUsage} ${inventoryItem.unit} of ingredient ${inventoryItem.name} for ${orderQuantity} cancelled orders`)
  } catch (error) {
    console.error('Error restoring ingredient:', error)
    throw error
  }
}

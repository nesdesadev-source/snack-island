import { supabase } from '../supabase'
import { authService } from './authService'
import type { Inventory } from '../models/Inventory'
import type { InventoryVerb } from '../modules/inventory/inventoryLogUtils'
import {
  formatInventoryQuantityLogMessage,
  formatInventoryFieldChangeLogMessage
} from '../modules/inventory/inventoryLogUtils'

interface UserContext {
  userId: string | null
  displayName: string
}

export interface InventoryChangeLog {
  id: string
  inventory_id: string
  user_id: string | null
  message: string
  created_at: string
}

async function getUserContext(): Promise<UserContext> {
  try {
    const currentUser = authService.getCurrentUser()

    if (!currentUser) {
      return {
        userId: null,
        displayName: 'System'
      }
    }

    return {
      userId: currentUser.id,
      displayName: currentUser.username
    }
  } catch (error) {
    console.error('Error getting user context for inventory log:', error)
    return {
      userId: null,
      displayName: 'System'
    }
  }
}

async function insertInventoryChangeLog(
  inventoryId: string,
  userId: string | null,
  message: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('inventory_change_logs')
      .insert({
        inventory_id: inventoryId,
        user_id: userId,
        message
      })

    if (error) {
      console.error('Error inserting inventory change log:', error)
    }
  } catch (error) {
    console.error('Unexpected error inserting inventory change log:', error)
  }
}

export const inventoryChangeLogService = {
  async logQuantityChange(params: {
    inventory: Inventory
    prevQty: number
    newQty: number
    /** When provided, use this verb instead of inferring (e.g. "set" for edit-form save). */
    verb?: InventoryVerb
  }): Promise<void> {
    const { inventory, prevQty, newQty, verb } = params
    const { userId, displayName } = await getUserContext()

    const message = formatInventoryQuantityLogMessage({
      displayName,
      itemName: inventory.name,
      unit: inventory.unit,
      prevQty,
      newQty,
      verb
    })

    await insertInventoryChangeLog(inventory.id, userId, message)
  },

  async logCustomMessage(params: {
    inventory: Inventory
    message: string
  }): Promise<void> {
    const { inventory, message } = params
    const { userId } = await getUserContext()

    await insertInventoryChangeLog(inventory.id, userId, message)
  },

  async logFieldChanges(params: {
    prev: Inventory
    next: Inventory
  }): Promise<void> {
    const { prev, next } = params

    // If IDs differ, treat as different items and do not log
    if (prev.id !== next.id) {
      return
    }

    const { userId, displayName } = await getUserContext()

    const changes: Array<{
      fieldLabel: string
      prevValue: string | number | null
      newValue: string | number | null
    }> = []

    if (prev.name !== next.name) {
      changes.push({
        fieldLabel: 'name',
        prevValue: prev.name,
        newValue: next.name
      })
    }

    if (prev.unit !== next.unit) {
      changes.push({
        fieldLabel: 'unit',
        prevValue: prev.unit,
        newValue: next.unit
      })
    }

    if (prev.reorder_level !== next.reorder_level) {
      changes.push({
        fieldLabel: 'reorder level',
        prevValue: prev.reorder_level,
        newValue: next.reorder_level
      })
    }

    if (prev.supplier_id !== next.supplier_id) {
      changes.push({
        fieldLabel: 'supplier',
        prevValue: prev.supplier_id ?? null,
        newValue: next.supplier_id ?? null
      })
    }

    if (changes.length === 0) {
      return
    }

    for (const change of changes) {
      const message = formatInventoryFieldChangeLogMessage({
        displayName,
        itemName: prev.name,
        fieldLabel: change.fieldLabel,
        prevValue: change.prevValue,
        newValue: change.newValue
      })

      await insertInventoryChangeLog(prev.id, userId, message)
    }
  },

  async fetchLogs(params: {
    inventoryId?: string
    userId?: string
    fromDate?: string
    toDate?: string
    limit?: number
  }): Promise<InventoryChangeLog[]> {
    const { inventoryId, userId, fromDate, toDate, limit } = params

    const { data, error } = await supabase
      .from('inventory_change_logs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    let logs = (data ?? []) as InventoryChangeLog[]

    if (inventoryId) {
      logs = logs.filter(log => log.inventory_id === inventoryId)
    }

    if (userId) {
      logs = logs.filter(log => log.user_id === userId)
    }

    if (fromDate) {
      logs = logs.filter(log => log.created_at >= fromDate)
    }

    if (toDate) {
      logs = logs.filter(log => log.created_at <= toDate)
    }

    // Ensure logs are sorted by created_at desc even if Supabase ordering changes
    logs = logs.sort((a, b) => b.created_at.localeCompare(a.created_at))

    if (typeof limit === 'number') {
      logs = logs.slice(0, limit)
    }

    return logs
  }
}


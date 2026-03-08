## Inventory & Logs – Supabase Operations

This document describes how **inventory items** are managed, how stock is adjusted when orders change, and how **inventory change logs** are written.

Based on:

- `src/services/inventoryService.ts`
- `src/services/inventoryChangeLogService.ts`
- `src/modules/inventory/inventoryUtils.ts`
- `src/modules/inventory/inventoryLogUtils.ts`
- `src/modules/orders/inventoryDeduction.ts`

---

### 1. Inventory CRUD

Inventory operations are wrapped in `inventoryService`. Most calls use RPCs with fallbacks to direct table queries.

The canonical table is `inventory` (see `data-models.md` for fields).

#### 1.1 `rpc('add_inventory_item')`

- **Used in**: `inventoryService.addItem`
- **Purpose**: Create a new inventory item.

**Request**

```json
{
  "_name": "Cooking Oil",
  "_unit": "L",
  "_quantity": 12.5,
  "_reorder_level": 5,
  "_supplier_id": "supplier-uuid-or-null"
}
```

**Response**

- Created row (or its id) as returned by the RPC.

#### 1.2 `rpc('get_inventory')`

- **Used in**: `inventoryService.getAll`
- **Purpose**: Fetch all inventory items.

**Request**

```json
{}
```

**Response**

- Array of inventory rows (`Inventory`-like shape).

**Fallback**

- If the RPC errors, the client falls back to:

```ts
supabase
  .from('inventory')
  .select('*')
```

Mobile can either:

- Use the same RPC, or
- Query the table directly with equivalent filters/order.

#### 1.3 `rpc('get_inventory_item')`

- **Used in**:
  - `inventoryService.getById`
  - `inventoryService.getInventoryItem`
  - `inventoryDeduction.ts` (via `inventoryService.getInventoryItem` in availability/impact functions)

**Request**

```json
{ "_id": "inventory-uuid" }
```

**Response**

- Single inventory row.

#### 1.4 `rpc('update_inventory_item')`

- **Used in**: `inventoryService.updateItem`
- **Purpose**: Update an inventory item, including stock quantity.

**Request**

```json
{
  "_id": "inventory-uuid",
  "_name": "Cooking Oil",
  "_unit": "L",
  "_quantity": 10.0,                 // updated quantity
  "_reorder_level": 5,
  "_supplier_id": "supplier-uuid-or-null"
}
```

**Response**

- `true` if successful.

This is the **core RPC** used by:

- `deductInventoryForOrder` (subtract usage).
- `restoreInventoryForOrder` (add usage).

#### 1.5 `rpc('delete_inventory_item')`

- **Used in**: `inventoryService.deleteItem`

**Request**

```json
{ "_id": "inventory-uuid" }
```

**Response**

- `true` if successful.

---

### 2. Inventory Deduction & Restoration (Orders)

Inventory is adjusted **client-side** using helpers in `inventoryDeduction.ts`, not by a dedicated RPC. The mobile app should mirror this logic or encapsulate it in new RPCs.

#### 2.1 Deduct inventory when order is placed / pending

Function: `deductInventoryForOrder(orderItems: OrderItem[])`

**Algorithm (simplified)**

1. Fetch all recipe maps via `recipeMapService.getRecipeMaps()`.
2. Group them by `menu_item_id`.
3. For each `OrderItem`:
   - Look up its recipe maps.
   - For each map:
     - `usageForItem = usage_per_order * quantity`.
     - Aggregate into `ingredientUsage[ingredient_id] += usageForItem`.
4. Collect all unique `ingredient_id`s into a set.
5. Fetch **all inventory** via `inventoryService.getAll()`.
6. Create a map `inventoryMap[id] = Inventory`.
7. For each entry in `ingredientUsage`:
   - Look up the inventory record.
   - Compute `newQuantity = inventoryItem.quantity - totalUsage`.
   - Call `inventoryService.updateItem` (→ `rpc('update_inventory_item')`) with the new quantity.
   - Track for logging.
8. Build a **single log message** summarizing the deductions:
   - e.g. `"Order items were completed. 0.5L Cooking Oil and 1pcs Potatoes were subtracted from inventory."`
9. Call `inventoryChangeLogService.logCustomMessage` once with:

```json
{
  "inventory": primaryInventoryItem,
  "message": "Order items were completed. ..."
}
```

#### 2.2 Restore inventory when order is cancelled

Function: `restoreInventoryForOrder(orderItems: OrderItem[])`

Same steps as deduction, but:

- `newQuantity = inventoryItem.quantity + totalUsage`.
- Log message template:

> `"Order items were cancelled. ... was/were restored to inventory."`

**Mobile implications**

- When an order is:
  - **Created and treated as “pending”**, call **deduct** logic.
  - **Cancelled**, call **restore** logic.
- If you add an explicit “completed” status in the order creation flow, ensure you don’t **double-deduct** inventory.

---

### 3. Inventory Availability & Impact Helpers

These helpers are used in `OrderForm.vue` to **check** inventory before creating the order and to **summarize** impact.

#### 3.1 `checkInventoryAvailability(orderItems)`

**Returns**

```json
{
  "isAvailable": true,
  "insufficientItems": [
    {
      "ingredientId": "inventory-uuid",
      "ingredientName": "Cooking Oil",
      "required": 3.0,
      "available": 2.5
    }
  ]
}
```

**Algorithm (simplified)**

1. Compute `menuItemIds` from `orderItems`.
2. Call `recipeMapService.getRecipeMappingsByMenuItems(menuItemIds)`.
3. For each `OrderItem`, for each recipe mapping with `usage_type === 'per_order'`:
   - `required = usage_per_order * quantity`.
   - Call `inventoryService.getInventoryItem(ingredient_id)` (→ `rpc('get_inventory_item')`).
   - If `inventory.current_stock < required`, add an entry to `insufficientItems`.
4. Set `isAvailable = insufficientItems.length === 0`.

**Usage in UI**

- If `isAvailable === false`:
  - Show a confirmation modal listing `ingredientName`s that are insufficient.
  - Let the user cancel or “continue regardless”.

#### 3.2 `getInventoryImpactSummary(orderItems)`

Returns a breakdown of:

- Solid item stock impact.
- Liquid batch impact (future extension; currently commented out).

Useful if you want to show a summary like:

> “This order will use 2 pcs cups and 0.5 L oil (remaining: 3 L).”

Mobile can re-use the same pattern.

---

### 4. Inventory Utility Functions (Conceptual)

From `inventoryUtils.ts`, used for dashboards and stock UX. These are **pure functions** and can be reimplemented on mobile.

- `calculateStockAfterDeduction(currentStock, usageAmount)`
  - Ensures stock never goes below 0.
- `isLowStock(currentStock, reorderLevel)`
  - True if `currentStock <= reorderLevel`.
- `calculateBatchProgress(batch)`
  - Percentage of `servings_used / expected_servings`.
- `shouldReplaceBatch(batch, threshold = 100)`
  - Whether a liquid batch should be replaced.
- `calculateLiquidEfficiency(expectedUsage, actualUsage)`
  - Percent efficiency (100% = perfect, >100% = used less than expected).
- `calculateUsageCost(usageAmount, costPerUnit)`
- `calculateAdjustedStock(currentStock, adjustment, actualStock?)`
- `calculateEstimatedServingsRemaining(batch)`
- `calculateBatchUsagePercentage(servingsUsed, expectedServings)`
- `calculateReorderQuantity(currentStock, reorderLevel, optimalStock?)`

Mobile should:

- Use `isLowStock` / `calculateReorderQuantity` patterns to show **low stock warnings**.
- Use batch helpers if you surface liquid efficiency/batch health in the app.

---

### 5. Inventory Change Logs

Change logs are stored in the `inventory_change_logs` table and provide an audit trail of stock changes.

#### 5.1 Log model

From `InventoryChangeLog` interface:

```json
{
  "id": "string",
  "inventory_id": "inventory-uuid",
  "user_id": "user-uuid-or-null",
  "message": "string",
  "created_at": "2025-02-01T12:34:56Z"
}
```

#### 5.2 Writing logs – `insertInventoryChangeLog`

- **Used in**: `inventoryChangeLogService` helpers.
- **Supabase call**:

```ts
supabase
  .from('inventory_change_logs')
  .insert({
    inventory_id: inventoryId,
    user_id: userId,
    message
  })
```

**Helpers**

- `logQuantityChange({ inventory, prevQty, newQty, verb? })`
  - Builds a human-readable message using `formatInventoryQuantityLogMessage`.
- `logCustomMessage({ inventory, message })`
  - Used by bulk deduction/restoration to log summary messages.
- `logFieldChanges({ prev, next })`
  - Compares selected fields (name, unit, reorder_level) and logs each change.

`getUserContext()` uses `authService.getCurrentUser()` to attach:

```json
{
  "userId": "user-uuid-or-null",
  "displayName": "username-or-System"
}
```

#### 5.3 Reading logs – `fetchLogs`

- **Used in**: `inventoryChangeLogService.fetchLogs`

**Supabase call**

```ts
supabase
  .from('inventory_change_logs')
  .select('*')
  .order('created_at', { ascending: false })
```

**Client-side filtering**

- By `inventoryId`
- By `userId`
- By `fromDate` / `toDate`
- Optional `limit`

Mobile can call the same table and apply equivalent filters client-side, or push filters into the SQL query.

---

### 6. Logging Message Formats

From `inventoryLogUtils.ts`:

- Quantity change messages:

> `"Alice added 5 kg to Potatoes. (Prev: 10 kg. New: 15 kg)"`
>
> `"Bob subtracted 1 L from Cooking Oil. (Prev: 5 L. New: 4 L)"`
>
> `"System set Cooking Oil to 10 L. (Prev: 8 L. New: 10 L)"`

- Field change messages:

> `"Alice changed name of Cooking Oil from \"Old Name\" to \"New Name\""`

- Bulk deduction example (from order completion):

> `"Order items were completed. 0.5L Cooking Oil and 1pcs Potatoes were subtracted from inventory."`

The mobile app can:

- **Reuse the same text patterns** for consistency, or
- Generate simpler messages but still fill the same `inventory_change_logs` table.

---

### 7. Recommended Mobile Patterns

- Treat inventory as **the source of truth** for:
  - low stock,
  - reorder warnings,
  - and cost analysis.
- When orders are placed, updated, or cancelled on mobile:
  - Always keep `orders`, `order_items`, and `inventory` in sync.
  - Reuse the same deduction/restoration formulas to avoid drift from the web POS.
- Use change logs to:
  - Debug discrepancies.
  - Show an audit trail to admins.


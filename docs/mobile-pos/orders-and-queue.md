## Orders & Queue – Supabase Operations

This document covers all **order and order-item operations** and how the **order queue** behaves, based on:

- `src/services/orderService.ts`
- `src/components/OrderForm.vue`
- `src/components/OrderQueue.vue`
- `src/components/OrderPage.vue`
- `src/modules/orders/orderUtils.ts`
- `src/modules/orders/inventoryDeduction.ts`

The mobile app should mirror these flows when creating orders, attaching items, and updating statuses.

---

### 1. Fetching Orders

#### 1.1 `rpc('get_orders')` – list orders with filters

- **Used in**: `OrderService.getOrders`
- **Purpose**: Fetch orders within an optional date range, optionally filtered by status, with pagination.
- **Auth**: Requires a signed-in user with access to orders (staff/admin).

**Request DTO**

```json
{
  "p_start_date": "2025-02-01T00:00:00Z",   // Date, defaults to 2025-01-01
  "p_end_date": "2025-02-01T23:59:59Z",     // Date, defaults to now
  "p_status": "pending|null",               // optional OrderStatus
  "p_limit": 5000,                          // optional
  "p_offset": 0                             // optional
}
```

**Response**

- Array of `Order` (see `data-models.md`).

**Notes**

- `OrderQueue.vue` uses this with `startDate` and `endDate` set to **today** to show today’s queue.

#### 1.2 `rpc('get_order')` – fetch single order

- **Used in**: `OrderService.getOrderById`
- **Purpose**: Get a single order by id.

**Request**

```json
{ "p_id": "order-uuid" }
```

**Response**

- Single `Order` or `null`.

---

### 2. Order Creation Flow

The primary order-creation flow in `OrderForm.vue` is:

1. Build an array of **temporary `OrderItem`-like objects** in memory using menu item selection and variations.
2. Compute totals and discounts.
3. Call **`createOrderWithInventoryCheck`** via `OrderService`.
4. If inventory is sufficient:
   - RPC `create_order` for the order.
   - RPC `create_order_items_batch` for all items.
   - Run `deductInventoryForOrder` to update inventory.
5. If inventory is insufficient:
   - Show a confirmation modal.
   - On “Continue”, call basic `createOrder` + `create_order_items_batch` and still deduct inventory.

#### 2.1 Local order item building (no Supabase call)

From `orderUtils.ts` and `OrderForm.vue`:

- `createOrderItem(orderId, menuItem, quantity, created_by, fries_option?, is_spicy?, drink_option?)`
- For new orders, `orderId` is temporarily `'temp-order-id'`; real order id comes from Supabase after creation.

**Key rules**

- `quantity > 0`
- `subtotal = price * quantity`
- Similar items with the same variations are merged by increasing quantity.

The mobile app should mirror this structure before sending items to Supabase.

#### 2.2 `OrderService.createOrderWithInventoryCheck`

This combines an **inventory availability check** and **order creation**.

**Input DTO** (from `CreateOrderInput` and in-memory items):

```json
{
  "orderData": {
    "total_amount": 450.0,
    "payment_method": "cash",
    "status": "pending",
    "order_fulfillment": "dine_in",
    "discount_id": "discount-uuid-or-null"
  },
  "orderItems": [
    {
      "menu_id": "menu-uuid",
      "quantity": 2,
      "subtotal": 300,
      "fries_option": "cheese",
      "is_spicy": true,
      "drink_option": null
    }
  ]
}
```

**Behaviour**

- Calls `checkInventoryAvailability(orderItems)` (client-side module that uses recipe maps + inventory RPCs).
- If `isAvailable === false`:
  - Returns `{ inventoryCheck }` **without** creating an order.
  - UI shows the “Insufficient Inventory” modal.
- If `isAvailable === true`:
  - Calls `rpc('create_order')` (see below).
  - Returns `{ order, inventoryCheck }`.

> The inventory availability check itself is implemented client-side using:
> - `recipeMapService.getRecipeMappingsByMenuItems`
> - `inventoryService.getInventoryItem`
> and does **not** correspond to a single RPC.

#### 2.3 `rpc('create_order')`

- **Used in**: `OrderService.createOrder`, `OrderService.createOrderWithInventoryCheck`

**Request**

```json
{
  "p_total_amount": 450.0,
  "p_payment_method": "cash|null",
  "p_status": "pending|null",
  "p_discount_id": "discount-uuid-or-null",
  "p_order_fulfillment": "dine_in|null"
}
```

**Response**

- Single `Order` (sometimes returned as array, web client unwraps it).

#### 2.4 `rpc('create_order_items_batch')`

- **Used in**: `OrderService.createOrderItemsBatch`, `OrderForm.vue`
- **Purpose**: Create multiple order items for a given order in one RPC call.

**Request**

```json
{
  "p_order_id": "order-uuid",
  "p_items": [
    {
      "menu_id": "menu-uuid",
      "quantity": 2,
      "subtotal": 300.0,
      "fries_option": "cheese|null",
      "is_spicy": true,
      "drink_option": "cucumber|null"
    }
  ]
}
```

**Response**

- Array of created `OrderItem` objects.

**Error handling**

- Any error in the underlying RPC is thrown and must be surfaced to the user (web uses `alert('Failed to submit order...')`).

#### 2.5 Alternative flow: `continueOrder`

When inventory is insufficient and the user chooses to proceed:

1. Use **basic** `OrderService.createOrder` (calls `rpc('create_order')` directly).
2. Use `createOrderItemsBatch` with the same items.
3. Call `deductInventoryForOrder(pendingOrderItems)` to adjust inventory anyway.

Mobile should replicate the same branching:

- Either stop on insufficient inventory, or mirror the “continue anyway” behaviour if you want parity with the web app.

---

### 3. Order Items – Other Operations

While the main path uses `create_order_items_batch`, the service also exposes granular RPCs:

- `rpc('create_order_items')` – batch-create items from a generic `CreateOrderItemInput[]`.
- `rpc('create_order_item')` – create a single item.
- `rpc('get_order_items')` – filter by `p_order_id`, `p_menu_id`, with pagination.
- `rpc('get_order_items_by_order')` – enhanced variant by order.
- `rpc('update_order_item')` – update quantity/subtotal.
- `rpc('delete_order_item')` – delete a single item.

For mobile, the key ones to mirror are:

#### 3.1 `rpc('get_order_items')` by order

- **Used in**: `OrderService.getOrderItems`, `OrderQueue.vue`

**Request**

```json
{ "p_order_id": "order-uuid" }
```

**Response**

- Array of `OrderItem` (mapped to the interface in `data-models.md`).

The queue loads items for:

- All non-completed orders first (TO DO and READY).
- Completed orders later (secondary batch), for better perceived performance.

#### 3.2 `rpc('update_order_item')`

**Request**

```json
{
  "p_id": "order-item-uuid",
  "p_quantity": 3,         // or null to leave unchanged
  "p_subtotal": 450.0      // or null to leave unchanged
}
```

**Response**

- Updated `OrderItem`.

Only needed if you plan to support editing items on mobile.

---

### 4. Order Status Updates & Queue Columns

Statuses and queue columns:

- `pending` → **TO DO**
- `ready` → **READY**
- `completed` → **DONE** (only today’s completed orders shown)
- `cancelled` → not prominently shown in the queue (but exists)

#### 4.1 `rpc('update_order')` (via `updateOrderStatus`)

- **Used in**: `OrderService.updateOrderStatus`, `OrderQueue.vue`

When the mobile app changes an order’s status, it should behave like:

```ts
await supabase.rpc('update_order', {
  p_id: orderId,
  p_total_amount: null,
  p_payment_method: null,
  p_status: newStatus,
  p_discount_id: null,
  p_order_fulfillment: null
})
```

Then the web client:

1. Fetches the order’s items via `get_order_items`.
2. Calls **inventory side-effects** depending on `newStatus`:
   - If `status === 'pending'`: `deductInventoryForOrder(orderItems)`
   - If `status === 'cancelled'`: `restoreInventoryForOrder(orderItems)`

> **Important quirk**: inventory deduction is tied to `status === 'pending'` in `updateOrderStatus`, even though the order is already created with `status: 'pending'`. The mobile app should either:
> - Keep the same logic (call the same RPC and helper), or
> - If you change the timing, ensure inventory is still deducted exactly once per fulfilled order and restored when cancelled.

#### 4.2 `getOrdersByStatus` (client-side)

`OrderQueue.vue` filters orders client-side:

- For each status (`pending`, `ready`, `completed`) it filters `orders[]`.
- For `completed`, it also restricts to **today** by comparing `created_at` to local date.
- Then it sorts with `sortOrdersForQueue` (priority rules for display).

Mobile can reuse the same rules:

- Fetch all today’s orders via `get_orders` with `startDate` and `endDate` = today.
- Group them by status with the same filters.

---

### 5. Additional Order RPCs

For completeness (these are not heavily used in the POS screens but may be useful for reporting or user-specific views):

- `rpc('delete_order', { p_id })`
  - Hard-deletes an order; **be careful** with using this on mobile, as it may conflict with inventory logic if you do not also restore stock appropriately.

- `rpc('get_orders_by_user', { p_user_id })`
  - Returns all orders created by the specified user (or current user if `null`).

- `rpc('get_orders_with_items')`
  - Returns orders pre-joined with their items in a single RPC.

- `rpc('get_todays_orders')`
  - Convenience RPC returning all of **today’s** orders; behaviour overlaps with `get_orders` + date filter.

---

### 6. Inventory Interaction (Summary)

See `inventory-and-logs.md` for full details; in short:

- **On order creation** (pending):
  - After creating order + items, the client calls `deductInventoryForOrder(orderItems)` which:
    - Uses recipe maps for each menu item.
    - Aggregates usage per ingredient.
    - Calls `update_inventory_item` via `inventoryService.updateItem`.
    - Logs a **bulk deduction message** via `inventoryChangeLogService.logCustomMessage`.

- **On order cancellation**:
  - `restoreInventoryForOrder(orderItems)` performs the inverse: it adds back usage amounts and logs a restoration message.

The mobile app should:

- Either reuse the same recipe+inventory logic (ported to mobile) or add server-side RPCs that encapsulate this behaviour.
- Always keep **inventory and orders in sync** when status changes.


## Core POS Data Models / DTOs

This document summarizes the **TypeScript models** in `src/models` that drive the POS and expresses them as **JSON-shaped DTOs** for mobile clients.

These models are the contracts for all documented Supabase calls (RPCs and table access).

> Types below are derived from:
> - `src/models/Order.ts`
> - `src/models/OrderItem.ts`
> - `src/models/MenuItem.ts`
> - `src/models/Inventory.ts`
> - `src/models/RecipeMap.ts`
> - `src/models/LiquidBatch.ts`
> - `src/models/Discount.ts`
> - `src/models/Expense.ts`
> - `src/models/User.ts`

---

### Orders

**OrderStatus**

- `pending` | `preparing` | `ready` | `completed` | `cancelled`

**PaymentMethod**

- `cash` | `gcash` | `maya` | `gotyme` | `bpi` | `other`

**OrderFulfillment**

- `dine_in` | `take_out`

**Order**

```json
{
  "id": "string",                      // uuid
  "total_amount": 450.0,               // number, required
  "payment_method": "cash",            // PaymentMethod or null
  "status": "pending",                 // OrderStatus or null
  "order_fulfillment": "dine_in",      // OrderFulfillment or null
  "discount_id": "string-or-null",     // uuid or null
  "created_at": "2025-02-01T12:34:56Z",
  "updated_at": "2025-02-01T12:40:00Z",
  "created_by": "user-uuid-or-null",
  "updated_by": "user-uuid-or-null"
}
```

**CreateOrderInput**

```json
{
  "total_amount": 450.0,               // required
  "payment_method": "cash",            // optional, PaymentMethod or null
  "status": "pending",                 // optional, OrderStatus or null
  "order_fulfillment": "dine_in",      // optional, OrderFulfillment or null
  "discount_id": "string-or-null"      // optional, uuid or null
}
```

**UpdateOrderInput**

```json
{
  "total_amount": 500.0,               // optional
  "payment_method": "gcash",           // optional
  "status": "completed",               // optional
  "order_fulfillment": "take_out",     // optional
  "discount_id": "string-or-null"      // optional
}
```

---

### Order Items

Order items link an order to a menu item and capture quantity, price, and variations.

**OrderItem**

```json
{
  "id": "string",                      // uuid
  "order_id": "string-or-null",        // uuid
  "menu_id": "string-or-null",         // uuid of MenuItem
  "quantity": 2,
  "subtotal": 300.0,
  "created_at": "2025-02-01T12:34:56Z",
  "created_by": "user-uuid-or-null",
  "fries_option": "cheese",            // optional, see FriesOption
  "is_spicy": true,                    // optional
  "drink_option": "cucumber"           // optional, see DrinkOption
}
```

**CreateOrderItemInput** (used in some RPCs)

```json
{
  "order_id": "string",                // required
  "menu_id": "string",                 // required
  "quantity": 2,                       // required, > 0
  "subtotal": 300.0,                   // required
  "created_by": "user-uuid-or-null",   // optional
  "fries_option": "plain|cheese|sour_cream|bbq",
  "is_spicy": true,
  "drink_option": "cucumber|iced_tea"
}
```

---

### Menu Items

From `src/models/MenuItem.ts`.

**MenuCategory**

- `Snack` | `Drink` | `Combo` | `Side`

**FriesOption**

- `cheese` | `sour_cream` | `bbq` | `plain`

**DrinkOption**

- `cucumber` | `iced_tea`

**MenuItem**

```json
{
  "id": "string",                      // uuid
  "name": "Cheese Fries",
  "price": 150.0,
  "category": "Snack",
  "item_code": "FRIES001",
  "is_active": true,
  "has_fries": true,
  "has_spicy": true,
  "has_drink": false,
  "rank": 1,
  "created_at": "2025-02-01T00:00:00Z",
  "updated_at": "2025-02-02T00:00:00Z"
}
```

**CreateMenuItemInput**

```json
{
  "name": "Cheese Fries",              // required
  "price": 150.0,                      // required
  "category": "Snack",                 // required
  "item_code": "FRIES001",             // required, used for identification
  "is_active": true,                   // optional (default true)
  "has_fries": true,                   // optional
  "has_spicy": true,                   // optional
  "has_drink": false                   // optional
}
```

---

### Inventory

The app currently uses two slightly different shapes (see `inventoryService` vs `inventoryDeduction`). For mobile, focus on the canonical table-level model: **an inventory item with id, name, quantity/stock, unit, reorder level, and supplier**.

You will see fields like:

```json
{
  "id": "string",
  "name": "Cooking Oil",
  "unit": "L",
  "quantity": 12.5,
  "reorder_level": 5,
  "supplier_id": "string-or-null"
}
```

and also in some RPCs / utilities:

```json
{
  "id": "string",
  "item_name": "Cooking Oil",
  "unit": "L",
  "current_stock": 12.5,
  "reorder_level": 5,
  "type": "solid|liquid"
}
```

For the mobile client:

- Treat **`quantity` / `current_stock`** as the numeric stock value.
- Use **`unit`** for display (e.g. `"pcs"`, `"kg"`, `"L"`).
- Use **`reorder_level`** to flag low stock.

Exact inventory interface definition is in `src/models/Inventory.ts`; mirror all fields you need from that file.

---

### Recipe Maps

From `src/models/RecipeMap.ts`. A recipe map links a menu item to an inventory ingredient and describes how much is used per order.

```json
{
  "id": "string",
  "menu_item_id": "string",            // uuid of MenuItem
  "ingredient_id": "string",           // uuid of Inventory item
  "usage_per_order": 0.05,             // e.g. liters or units per ordered item
  "usage_type": "per_order",           // currently used type in deduction logic
  "purchase_price": 500.0,             // optional, for cost tracking
  "purchase_quantity": 5.0,
  "purchase_unit": "L"
}
```

The mobile app should not need to create or edit recipe maps frequently, but it must respect them when reasoning about inventory impact (see `inventoryDeduction.ts`).

---

### Liquid Batches

From `src/models/LiquidBatch.ts`. Used for more advanced tracking of liquid efficiency (e.g. fryer oil).

```json
{
  "id": "string",
  "ingredient_id": "string",           // inventory id
  "batch_volume": 5.0,                 // e.g. liters
  "expected_servings": 100,            // expected number of orders this batch can serve
  "servings_used": 40,                 // how many servings actually used
  "start_date": "2025-02-01",
  "status": "active"                   // or "replaced"
}
```

Helper functions in `inventoryUtils.ts` compute:

- Batch progress and when to replace a batch.
- Estimated remaining servings.
- Liquid efficiency (expected vs actual usage).

The mobile app can either call the existing helpers via RPCs (if exposed later) or reimplement the same basic math.

---

### Discounts

From `src/models/Discount.ts`.

```json
{
  "id": "string",
  "name": "Senior Citizen",
  "description": "20% off for seniors",
  "amount": 20.0,                      // flat pesos or percentage value
  "discount_type": "flat|percentage",
  "is_active": true,
  "created_at": "2025-02-01T00:00:00Z",
  "updated_at": "2025-02-01T00:00:00Z"
}
```

When attached to an order:

- `order.discount_id` points to a `Discount`.
- Frontend uses `discountUtils` to compute the **discounted total**:
  - `flat` → subtract `amount` pesos.
  - `percentage` → subtract `amount%` of total.

---

### Expenses

From `src/models/Expense.ts`.

```json
{
  "id": "string",
  "expense_date": "2025-02-01",
  "category": "Supplies",              // ExpenseCategory enum
  "description": "Cooking oil refill",
  "amount": 500.0,
  "supplier_id": "string-or-null",
  "paid_by": "string-or-null",
  "reimburse_status": 0,               // numeric flag
  "created_at": "2025-02-01T00:00:00Z",
  "updated_at": "2025-02-01T00:00:00Z"
}
```

These feed into dashboard profit calculations together with daily sales.

---

### Users / Profiles

From `src/models/User.ts` and `src/services/authService.ts`.

**User (client-side view)**

```json
{
  "id": "string",                      // Supabase auth user id (uuid)
  "username": "staff1",
  "roleId": 1                          // 0 = admin, 1 = staff
}
```

Supabase also has a `profiles` table with (at least):

```json
{
  "id": "string",                      // auth user id
  "email": "staff1@snackisland.com",
  "roleId": 1,
  "created_at": "2025-02-01T00:00:00Z"
}
```

The mobile app should:

- Use `username@snackisland.com` as the email when interacting with Supabase Auth.
- Store the minimal `User` shape locally (id, username, roleId) to mirror the web app’s behaviour.

---

### Sales Summary (optional)

For completeness: `src/models/SalesSummary.ts` is used for reporting/analytics (not directly by the POS order flow) but may be useful for mobile dashboards.

Example shape:

```json
{
  "date": "2025-02-01",
  "total_sales": 4850.0,
  "total_orders": 52,
  "total_expenses": 1100.0,
  "total_profit": 3750.0
}
```

Use this as a guide when aggregating daily numbers on the mobile side.


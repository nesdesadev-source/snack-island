## Discounts & Expenses – Supabase Operations

This document describes how **discounts** are applied to orders and how **expenses** are stored and aggregated for profit calculations.

Based on:

- `src/services/discountService.ts`
- `src/services/expenseService.ts`
- `src/modules/discounts/discountUtils.ts`
- `src/modules/expenses/expenseUtils.ts`
- `src/components/OrderForm.vue`
- `src/components/OrderPage.vue`

---

### 1. Discounts

Discounts are separate records that can be attached to orders via `discount_id`. The actual discounted total is computed on the client using `discountUtils`.

See `data-models.md` for the `Discount` shape.

#### 1.1 `rpc('add_discount')`

- **Used in**: `discountService.addDiscount`

**Request**

```json
{
  "p_name": "Senior Citizen",
  "p_amount": 20.0,                     // flat pesos or percentage
  "p_discount_type": "flat",            // "flat" | "percentage"
  "p_description": "20 pesos off",      // or null
  "p_is_active": true                   // defaults to true if omitted
}
```

**Response**

- Newly created discount row or its id.

#### 1.2 `rpc('get_discounts')`

- **Used in**:
  - `discountService.getAll`
  - `OrderForm.vue` (to populate available discounts)

**Request**

```json
{}
```

**Response**

- Array of `Discount`.

**Fallback**

- If RPC fails, the client falls back to:

```ts
supabase
  .from('discounts')
  .select('*')
  .order('created_at', { ascending: false })
```

#### 1.3 `rpc('update_discount')`

- **Used in**: `discountService.updateDiscount`

**Request**

```json
{
  "p_id": "discount-uuid",
  "p_name": "Senior Citizen",
  "p_description": "20% off",           // null to clear, or null when unchanged
  "p_amount": 20.0,                     // null to leave unchanged
  "p_discount_type": "percentage",      // null to leave unchanged
  "p_is_active": true                   // null to leave unchanged
}
```

**Response**

- `true` if successful.

#### 1.4 `rpc('delete_discount')`

- **Used in**: `discountService.deleteDiscount`

**Request**

```json
{ "p_id": "discount-uuid" }
```

**Response**

- `true` if successful.

---

### 2. Discounts in Orders (Client Logic)

`OrderForm.vue` loads discounts on mount:

```ts
discounts.value = await discountService.getAll()
```

Discounts are then filtered and applied using:

- `filterActiveDiscounts(discounts)` – returns only active discounts.
- `calculateDiscountedPrice(discount, orderTotal)` – computes the discounted total.

**Client-side flow when submitting an order**

1. Compute `orderTotal` as the sum of item subtotals.
2. If a discount is selected:
   - Compute `discountedTotal = calculateDiscountedPrice(selectedDiscount, orderTotal)`.
3. Build `orderData`:

```json
{
  "total_amount": discountedTotal,
  "payment_method": "cash|gcash|...",
  "status": "pending",
  "order_fulfillment": "dine_in|take_out",
  "discount_id": "discount-uuid-or-null"
}
```

4. Pass this into `OrderService.createOrderWithInventoryCheck` (see `orders-and-queue.md`).

**Important**

- The **final total saved** in `orders.total_amount` is **already discounted**.
- The discount record is still attached via `discount_id` for reporting/auditing.

Mobile should mirror this:

- Use the same logic to compute discounted totals.
- Always send the **discounted** total as `total_amount` along with `discount_id`.

---

### 3. Expenses

Expenses represent operational costs and are used to compute daily profit.

See `data-models.md` for the `Expense` shape.

#### 3.1 `rpc('add_expense')`

- **Used in**: `expenseService.addExpense`

**Request**

```json
{
  "p_date": "2025-02-01",
  "p_category": "Supplies",           // ExpenseCategory enum
  "p_description": "Cooking oil",
  "p_amount": 500.0,
  "p_supplier_id": "supplier-uuid-or-null",
  "p_paid_by": "Cashbox|null",
  "p_reimburse_status": 0             // numeric flag
}
```

**Response**

- Newly created expense row or id.

#### 3.2 `rpc('get_expenses')`

- **Used in**: `expenseService.getAll`
- **Purpose**: Fetch all expenses.

**Request**

```json
{}
```

**Response**

- Array of `Expense`.

**Fallback**

- If the RPC errors, the client falls back to:

```ts
supabase
  .from('expenses')
  .select('*')
  .order('expense_date', { ascending: false })
  .order('created_at', { ascending: false })
```

#### 3.3 `rpc('update_expense')`

- **Used in**: `expenseService.updateExpense`

**Request**

```json
{
  "p_id": "expense-uuid",
  "p_date": "2025-02-01",
  "p_category": "Supplies",
  "p_description": "Cooking oil (refill)",
  "p_amount": 550.0,
  "p_supplier_id": "supplier-uuid-or-null",
  "p_paid_by": "Cashbox|null",
  "p_reimburse_status": 0
}
```

**Response**

- `true` if successful.

#### 3.4 `rpc('delete_expense')`

- **Used in**: `expenseService.deleteExpense`

**Request**

```json
{ "p_id": "expense-uuid" }
```

**Response**

- `true` if successful.

---

### 4. Expense Utilities (Dashboards & Profit)

`expenseUtils.ts` defines helper functions that power dashboards and profit metrics.

The key ones:

- `filterOperationalExpenses(expenses)`
  - Excludes non-operational categories: `'Machinery'`, `'Government Fees'`, `'Equipment'`.
- `calculateTotalExpenses(expenses)`
  - Returns sum of `amount`.
- `calculateExpensesByCategory(expenses)`
  - Returns `{ [category]: totalAmount }`.
- `calculateAverageExpense(expenses)`
  - Mean of expense amounts.
- `calculateCategoryPercentage(expenses, category)`
  - Percentage of total expenses for a given category.
- `calculateDailyExpenseRate(expenses, startDate, endDate)`
- `calculateMonthlyExpenseRate(expenses, startDate, endDate)`
- `calculateExpenseTrend(currentPeriodTotal, previousPeriodTotal)`
- `calculateYearToDateExpenses(expenses, year)`
- `filterExpensesByDateRange(expenses, startDate, endDate)`
- `calculateExpenseGrowth(currentExpenses, previousExpenses)`
- `isWithinBudget(totalExpenses, budget)`
- `calculateBudgetRemaining(totalExpenses, budget)`

These are **pure functions**; on mobile you can:

- Copy the logic conceptually.
- Use them to produce the same charts and KPIs.

---

### 5. How Expenses & Discounts Feed Into Profit

`OrderPage.vue` computes:

- **Total completed sales today** (from orders).
- **Total operational expenses today** (from expenses).
- **Today’s profit** as `sales - expenses`.

#### 5.1 Sales side

- `OrderPage.vue`:
  - Loads all orders via `OrderService.getOrders` (with today’s date range).
  - Filters to `status === 'completed'` and `created_at === today`.
  - Sums `total_amount` from these completed orders.
  - Separately sums by `payment_method` to show cash vs GCash.
- Remember: `total_amount` is **already discounted** when the order is created.

#### 5.2 Expense side

- `OrderPage.vue`:
  - Loads all expenses via `expenseService.getAll`.
  - Filters to today’s expenses by `expense_date`.
  - Uses `calculateTotalExpenses(todayExpenses)` to get the total.

#### 5.3 Profit

```ts
todayProfit = totalCompletedSales - todayExpenses
```

The progress circle in the UI is purely visual; the underlying number is this difference.

**For mobile**

- Use the same daily filters:
  - Orders: `completed` and created today.
  - Expenses: `expense_date` is today.
- Compute profit exactly the same way to keep dashboard numbers consistent between mobile and web.

---

### 6. Recommended Mobile Patterns

- **Discount selection**
  - Load all discounts on app start or when opening the order form.
  - Filter using the same “active only” rule.
  - Show a clear label like `"Senior Citizen (20%)"` or `"Promo (₱50.00)"`.
- **Discount application**
  - Always calculate the discounted total **before** sending the order to Supabase.
  - Save both `total_amount` (discounted) and `discount_id`.
- **Expense entry**
  - Provide a simple form for logging daily expenses by category.
  - Default `expense_date` to **today**.
- **Profit view**
  - Reuse the same formulas to avoid discrepancies between mobile and web dashboards.


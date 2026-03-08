## Menu, Recipes, and Ranks – Supabase Operations

This document explains how **menu items** are managed and how they map to **inventory ingredients** via recipes, plus how menu ranks are stored.

Based on:

- `src/services/menuItemService.ts`
- `src/services/recipeMapService.ts`
- `src/services/menuRankService.ts`
- `src/modules/orders/inventoryDeduction.ts`

---

### 1. Menu Items

Menu items define what can be ordered and which variations are available (fries, spicy, drink).

Model details are in `data-models.md` (`MenuItem`, `CreateMenuItemInput`).

#### 1.1 `rpc('create_menu_item')`

- **Used in**: `menuItemService.createMenuItem`
- **Purpose**: Create a new menu item.

**Request**

```json
{
  "_name": "Cheese Fries",
  "_price": 150.0,
  "_category": "Snack",          // MenuCategory
  "_item_code": "FRIES001",
  "_has_fries": true,
  "_has_spicy": true,
  "_has_drink": false
}
```

**Response**

- Newly created menu item id (string).

#### 1.2 `rpc('get_menu_items')`

- **Used in**:
  - `menuItemService.getMenuItems`
  - `OrderForm.vue` (selectable menu list)
  - `OrderQueue.vue` (to show item names in cards)

**Request**

```json
{}
```

**Response**

- Array of `MenuItem`.

**Notes for mobile**

- `OrderForm.vue` filters on:
  - `is_active === true`
  - `category` (optional filter)
  - `searchQuery` (by `name`)
- Variations:
  - `has_fries` → show fries options (plain, cheese, sour_cream, bbq).
  - `has_spicy` → allow spicy toggle.
  - `has_drink` → show drink options (cucumber, iced_tea).

Mirror these conditions to get the same UX.

#### 1.3 `rpc('update_menu_item')`

- **Used in**: `menuItemService.updateMenuItem`

**Request**

```json
{
  "_id": "menu-uuid",
  "_name": "Cheese Fries (Large)",
  "_price": 180.0,
  "_category": "Snack",
  "_item_code": "FRIES001-L",
  "_has_fries": true,
  "_has_spicy": true,
  "_has_drink": false
}
```

**Response**

- `true` if successful; error thrown otherwise.

#### 1.4 `rpc('delete_menu_item')`

- **Used in**: `menuItemService.deleteMenuItem`

**Request**

```json
{ "_id": "menu-uuid" }
```

**Response**

- `true` if successful.

**Considerations**

- Deleting a menu item that is still referenced by orders/recipes should be handled carefully at the DB/RPC level (not enforced in the client).

---

### 2. Recipe Maps (Menu → Inventory)

Recipe maps connect menu items to inventory ingredients and define **how much of each ingredient** is used per order.

Model: `RecipeMap` in `data-models.md`.

#### 2.1 `rpc('create_recipe_map')`

- **Used in**: `recipeMapService.createRecipeMap`
- **Purpose**: Create a mapping between a menu item and an ingredient.

**Request**

```json
{
  "_menu_item_id": "menu-uuid",
  "_ingredient_id": "inventory-uuid",
  "_usage_per_order": 0.05,        // e.g. liters per order
  "_usage_type": "per_order",      // currently what inventoryDeduction.ts expects
  "_purchase_price": 500.0,        // optional, for cost tracking
  "_purchase_quantity": 5.0,
  "_purchase_unit": "L"
}
```

**Response**

- New recipe map id (string).

#### 2.2 `rpc('get_recipe_maps')`

- **Used in**: `recipeMapService.getRecipeMaps`
- **Purpose**: Fetch all recipe mappings (used in `deductInventoryForOrder` / `restoreInventoryForOrder`).

**Request**

```json
{}
```

**Response**

- Array of `RecipeMap`.

**Usage in inventory deduction**

- `deductInventoryForOrder` loads **all recipe maps**, groups them by `menu_item_id`, then:
  - For each order item, finds its recipe maps.
  - For each mapping: `totalUsage = usage_per_order * quantity`.
  - Aggregates usage per `ingredient_id`.
  - Calls `update_inventory_item` RPCs for each ingredient.

#### 2.3 `rpc('update_recipe_map')`

- **Used in**: `recipeMapService.updateRecipeMap`

**Request**

```json
{
  "_id": "recipe-map-uuid",
  "_menu_item_id": "menu-uuid",
  "_ingredient_id": "inventory-uuid",
  "_usage_per_order": 0.06,
  "_usage_type": "per_order",
  "_purchase_price": 520.0,
  "_purchase_quantity": 5.0,
  "_purchase_unit": "L"
}
```

**Response**

- `true` if successful.

#### 2.4 `rpc('delete_recipe_map')`

- **Used in**: `recipeMapService.deleteRecipeMap`

**Request**

```json
{ "_id": "recipe-map-uuid" }
```

**Response**

- `true` if successful.

#### 2.5 `rpc('get_recipe_mappings_by_menu_items')`

- **Used in**:
  - `inventoryDeduction.ts` → `getInventoryImpactSummary` and `checkInventoryAvailability`
  - `checkInventoryAvailability` in particular uses this for a **targeted fetch** by menu ids.

**Request**

```json
{
  "menu_item_ids": ["menu-uuid-1", "menu-uuid-2"]
}
```

**Response**

- Array of `RecipeMap` for the requested menu items.

**Usage in availability check (client-side logic)**

- For each `OrderItem`:
  - Find recipe maps where `menu_item_id === orderItem.menu_id`.
  - For mappings where `usage_type === 'per_order'`:
    - Compute `required = usage_per_order * quantity`.
    - Fetch inventory via `inventoryService.getInventoryItem(ingredient_id)`.
    - If `inventory.current_stock < required`, add to `insufficientItems` list.
- Return:

```json
{
  "isAvailable": true,
  "insufficientItems": []
}
```

The mobile app can either reuse this algorithm or introduce server-side RPCs to encapsulate it.

---

### 3. Menu Ranks

Menu ranks define the ordering / priority of menu items (e.g. for highlighting best-sellers or consistent ordering in the POS).

Model (from `menuRankService.ts`):

```json
{
  "id": "string",
  "menu_id": "menu-uuid",
  "rank": 1,
  "created_at": "2025-02-01T00:00:00Z",
  "updated_at": "2025-02-02T00:00:00Z"
}
```

#### 3.1 `rpc('get_menu_ranks')`

- **Used in**: `menuRankService.getMenuRanks`

**Request**

```json
{}
```

**Response**

- Array of `{ id, menu_id, rank, created_at?, updated_at? }`.

#### 3.2 `rpc('update_menu_rank')`

- **Used in**: `menuRankService.updateMenuRank`

**Request**

```json
{
  "p_menu_id": "menu-uuid",
  "p_rank": 3
}
```

**Response**

- `true` if successful.

#### 3.3 `rpc('swap_menu_ranks')`

- **Used in**: `menuRankService.swapRanks`, `moveRankUp`, `moveRankDown`

**Request**

```json
{
  "p_menu_id_1": "menu-uuid-1",
  "p_menu_id_2": "menu-uuid-2"
}
```

**Response**

- `true` if successful.

Client-side helper logic:

- `moveRankUp(menuId, ranks[])`:
  - Find current rank.
  - Find `rank - 1`.
  - Call `swap_menu_ranks` between those two `menu_id`s.
- `moveRankDown(menuId, ranks[])`:
  - Same but with `rank + 1`.

#### 3.4 `rpc('initialize_menu_ranks')`

- **Used in**: `menuRankService.initializeRanks`
- **Purpose**: Initialize rank values if missing.

**Request**

```json
{}
```

**Response**

- A number (e.g. count of initialized records).

---

### 4. How Menu & Recipes Affect Inventory

Putting it together (see also `inventory-and-logs.md`):

1. User selects a **MenuItem** in the POS.
2. The order contains **OrderItems** referencing `menu_id`.
3. When the order is created / status updated:
   - Client loads **RecipeMaps** for the involved menu items.
   - For each mapping, it calculates total usage per ingredient.
   - Client calls inventory RPCs (`get_inventory`, `get_inventory_item`, `update_inventory_item`) to:
     - Check availability before order (optional).
     - Deduct or restore stock after order creation / cancellation.
4. Any inventory changes get logged in `inventory_change_logs`.

For the mobile app, this means:

- Menu and recipe data must be loaded early (e.g. once on app start) or on-demand.
- When you build an order:
  - Use the same menu fields (`has_fries`, `has_spicy`, `has_drink`) to show variations.
  - Use recipe maps to understand ingredient impact if you want to show inventory warnings or summaries.


-- Migration: Add variation columns to menu_items and order_items tables
-- Date: 2026-01-24

-- Add variation boolean columns to menu_items table
ALTER TABLE menu_items
ADD COLUMN IF NOT EXISTS has_fries BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_spicy BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_drink BOOLEAN DEFAULT false;

-- Add variation columns to order_items table
ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS fries_option TEXT CHECK (fries_option IN ('plain', 'cheese', 'sour_cream', 'bbq')),
ADD COLUMN IF NOT EXISTS is_spicy BOOLEAN,
ADD COLUMN IF NOT EXISTS drink_option TEXT CHECK (drink_option IN ('cucumber', 'iced_tea'));

-- Optional: Add comments to document the columns
COMMENT ON COLUMN menu_items.has_fries IS 'Whether this menu item has fries variation options (cheese, sour_cream, bbq)';
COMMENT ON COLUMN menu_items.has_spicy IS 'Whether this menu item has a spicy option';
COMMENT ON COLUMN menu_items.has_drink IS 'Whether this menu item has drink variation options (cucumber, iced_tea)';
COMMENT ON COLUMN order_items.fries_option IS 'Selected fries variation: cheese, sour_cream, or bbq';
COMMENT ON COLUMN order_items.is_spicy IS 'Whether the customer selected spicy option';
COMMENT ON COLUMN order_items.drink_option IS 'Selected drink variation: cucumber or iced_tea';

-- ============================================================================
-- Update RPC Functions
-- ============================================================================
-- Note: You'll need to update your existing RPC functions to include the new parameters
-- Below are example updates. Adjust based on your current function implementations.

-- Update create_menu_item function to include variation fields
-- Replace your existing create_menu_item function with this:
CREATE OR REPLACE FUNCTION create_menu_item(
  _name TEXT,
  _price NUMERIC,
  _category TEXT,
  _item_code TEXT,
  _has_fries BOOLEAN DEFAULT false,
  _has_spicy BOOLEAN DEFAULT false,
  _has_drink BOOLEAN DEFAULT false
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO menu_items (name, price, category, item_code, has_fries, has_spicy, has_drink, is_active)
  VALUES (_name, _price, _category, _item_code, _has_fries, _has_spicy, _has_drink, true)
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;

-- Update update_menu_item function to include variation fields
-- Replace your existing update_menu_item function with this:
CREATE OR REPLACE FUNCTION update_menu_item(
  _id UUID,
  _name TEXT DEFAULT NULL,
  _price NUMERIC DEFAULT NULL,
  _category TEXT DEFAULT NULL,
  _item_code TEXT DEFAULT NULL,
  _has_fries BOOLEAN DEFAULT NULL,
  _has_spicy BOOLEAN DEFAULT NULL,
  _has_drink BOOLEAN DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE menu_items
  SET
    name = COALESCE(_name, name),
    price = COALESCE(_price, price),
    category = COALESCE(_category, category),
    item_code = COALESCE(_item_code, item_code),
    has_fries = COALESCE(_has_fries, has_fries),
    has_spicy = COALESCE(_has_spicy, has_spicy),
    has_drink = COALESCE(_has_drink, has_drink),
    updated_at = NOW()
  WHERE id = _id;
  
  RETURN FOUND;
END;
$$;

-- Update create_order_item function to include variation fields
-- Replace your existing create_order_item function with this:
CREATE OR REPLACE FUNCTION create_order_item(
  p_order_id UUID,
  p_menu_id UUID,
  p_quantity INTEGER,
  p_subtotal NUMERIC,
  p_fries_option TEXT DEFAULT NULL,
  p_is_spicy BOOLEAN DEFAULT NULL,
  p_drink_option TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  order_id UUID,
  menu_id UUID,
  quantity INTEGER,
  subtotal NUMERIC,
  created_at TIMESTAMPTZ,
  created_by TEXT,
  fries_option TEXT,
  is_spicy BOOLEAN,
  drink_option TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  new_item RECORD;
BEGIN
  INSERT INTO order_items (order_id, menu_id, quantity, subtotal, fries_option, is_spicy, drink_option, created_by)
  VALUES (p_order_id, p_menu_id, p_quantity, p_subtotal, p_fries_option, p_is_spicy, p_drink_option, auth.uid()::TEXT)
  RETURNING * INTO new_item;
  
  RETURN QUERY
  SELECT 
    new_item.id,
    new_item.order_id,
    new_item.menu_id,
    new_item.quantity,
    new_item.subtotal,
    new_item.created_at,
    new_item.created_by,
    new_item.fries_option,
    new_item.is_spicy,
    new_item.drink_option;
END;
$$;

-- Update get_menu_items function to include variation fields
-- Replace your existing get_menu_items function with this:
-- Note: If you get a column count mismatch error, drop and recreate the function
DROP FUNCTION IF EXISTS get_menu_items();

CREATE FUNCTION get_menu_items()
RETURNS TABLE (
  id UUID,
  name TEXT,
  price NUMERIC,
  category TEXT,
  item_code TEXT,
  is_active BOOLEAN,
  has_fries BOOLEAN,
  has_spicy BOOLEAN,
  has_drink BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.name,
    m.price,
    m.category,
    m.item_code,
    COALESCE(m.is_active, true) as is_active,
    COALESCE(m.has_fries, false) as has_fries,
    COALESCE(m.has_spicy, false) as has_spicy,
    COALESCE(m.has_drink, false) as has_drink,
    m.created_at,
    m.updated_at
  FROM menu_items m
  ORDER BY m.name;
END;
$$;

-- Update create_order_items_batch function to handle variation fields
-- Replace your existing create_order_items_batch function with this:
CREATE OR REPLACE FUNCTION create_order_items_batch(
  p_order_id UUID,
  p_items JSONB
)
RETURNS TABLE (
  id UUID,
  order_id UUID,
  quantity NUMERIC(10, 2),
  subtotal NUMERIC(10, 2),
  created_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  menu_id UUID,
  fries_option TEXT,
  is_spicy BOOLEAN,
  drink_option TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO public.order_items (
    order_id,
    menu_id,
    quantity,
    subtotal,
    created_by,
    fries_option,
    is_spicy,
    drink_option
  )
  SELECT
    p_order_id,
    (item->>'menu_id')::UUID,
    (item->>'quantity')::NUMERIC(10, 2),
    (item->>'subtotal')::NUMERIC(10, 2),
    auth.uid(),
    NULLIF(item->>'fries_option', '')::TEXT,
    CASE 
      WHEN item->>'is_spicy' = 'true' THEN true
      WHEN item->>'is_spicy' = 'false' THEN false
      ELSE NULL
    END,
    NULLIF(item->>'drink_option', '')::TEXT
  FROM jsonb_array_elements(p_items) AS item
  RETURNING *;
END;
$$;

-- Update get_order_items function to include variation fields
-- Replace your existing get_order_items function with this:
DROP FUNCTION IF EXISTS get_order_items(UUID);

CREATE FUNCTION get_order_items(p_order_id UUID)
RETURNS TABLE (
  id UUID,
  order_id UUID,
  menu_id UUID,
  quantity NUMERIC(10, 2),
  subtotal NUMERIC(10, 2),
  created_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  fries_option TEXT,
  is_spicy BOOLEAN,
  drink_option TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    oi.id,
    oi.order_id,
    oi.menu_id,
    oi.quantity,
    oi.subtotal,
    oi.created_at,
    oi.created_by,
    oi.fries_option,
    oi.is_spicy,
    oi.drink_option
  FROM order_items oi
  WHERE oi.order_id = p_order_id
  ORDER BY oi.created_at;
END;
$$;

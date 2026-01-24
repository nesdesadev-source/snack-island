-- Quick fix for get_menu_items function column mismatch error
-- Run this in your Supabase SQL Editor

-- Drop the existing function first
DROP FUNCTION IF EXISTS get_menu_items();

-- Recreate with the correct signature including variation fields
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

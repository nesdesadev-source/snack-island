-- Migration: Update get_menu_items function to include rank ordering
-- Date: 2026-01-27

-- Drop the existing function first
DROP FUNCTION IF EXISTS get_menu_items();

-- Recreate with rank support
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
  rank INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
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
    mr.rank,
    m.created_at,
    m.updated_at
  FROM menu_items m
  LEFT JOIN menu_rank mr ON m.id = mr.menu_id
  ORDER BY 
    COALESCE(mr.rank, 999999) ASC,
    m.name ASC;
END;
$$;

-- Quick fix for get_order_items function column mismatch error
-- Run this in your Supabase SQL Editor

-- Drop the existing function first
DROP FUNCTION IF EXISTS get_order_items(UUID);

-- Recreate with the correct signature including variation fields
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

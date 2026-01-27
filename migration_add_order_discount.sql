-- Migration: Add discount support to orders
-- Date: 2026-01-27

-- Add discount_id column to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS discount_id UUID REFERENCES discounts(id);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_discount_id ON orders(discount_id);

-- Add comment to document the column
COMMENT ON COLUMN orders.discount_id IS 'Reference to the discount applied to this order';

-- ============================================================================
-- Update RPC Functions
-- ============================================================================

-- Function: create_order
-- Updates to include discount_id parameter
CREATE OR REPLACE FUNCTION create_order(
  p_total_amount NUMERIC,
  p_payment_method TEXT DEFAULT NULL,
  p_status TEXT DEFAULT 'pending',
  p_discount_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  total_amount NUMERIC,
  payment_method TEXT,
  status TEXT,
  discount_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  created_by UUID,
  updated_by UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_order RECORD;
BEGIN
  INSERT INTO orders (total_amount, payment_method, status, discount_id)
  VALUES (p_total_amount, p_payment_method, p_status, p_discount_id)
  RETURNING * INTO new_order;

  RETURN QUERY
  SELECT 
    new_order.id,
    new_order.total_amount,
    new_order.payment_method,
    new_order.status,
    new_order.discount_id,
    new_order.created_at,
    new_order.updated_at,
    new_order.created_by,
    new_order.updated_by;
END;
$$;

-- Function: get_order
-- Updates to include discount_id in return
CREATE OR REPLACE FUNCTION get_order(p_id UUID)
RETURNS TABLE (
  id UUID,
  total_amount NUMERIC,
  payment_method TEXT,
  status TEXT,
  discount_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  created_by UUID,
  updated_by UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.total_amount,
    o.payment_method,
    o.status,
    o.discount_id,
    o.created_at,
    o.updated_at,
    o.created_by,
    o.updated_by
  FROM orders o
  WHERE o.id = p_id;
END;
$$;

-- Function: get_orders
-- Updates to include discount_id in return
CREATE OR REPLACE FUNCTION get_orders(
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 5000,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  total_amount NUMERIC,
  payment_method TEXT,
  status TEXT,
  discount_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  created_by UUID,
  updated_by UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.total_amount,
    o.payment_method,
    o.status,
    o.discount_id,
    o.created_at,
    o.updated_at,
    o.created_by,
    o.updated_by
  FROM orders o
  WHERE 
    (p_start_date IS NULL OR o.created_at >= p_start_date)
    AND (p_end_date IS NULL OR o.created_at <= p_end_date)
    AND (p_status IS NULL OR o.status = p_status)
  ORDER BY o.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Function: update_order
-- Updates to include discount_id parameter
CREATE OR REPLACE FUNCTION update_order(
  p_id UUID,
  p_total_amount NUMERIC DEFAULT NULL,
  p_payment_method TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_discount_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE orders
  SET
    total_amount = COALESCE(p_total_amount, total_amount),
    payment_method = COALESCE(p_payment_method, payment_method),
    status = COALESCE(p_status, status),
    discount_id = COALESCE(p_discount_id, discount_id),
    updated_at = NOW()
  WHERE id = p_id;

  RETURN FOUND;
END;
$$;

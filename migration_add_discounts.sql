-- Migration: Add discounts table and functions
-- Date: 2026-01-27

-- Create discounts table
CREATE TABLE IF NOT EXISTS discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
  discount_type TEXT NOT NULL CHECK (discount_type IN ('flat', 'percentage')),
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments to document the columns
COMMENT ON TABLE discounts IS 'Stores discount codes and promotions';
COMMENT ON COLUMN discounts.name IS 'Name of the discount';
COMMENT ON COLUMN discounts.description IS 'Optional description of the discount';
COMMENT ON COLUMN discounts.amount IS 'Discount value - interpreted based on discount_type';
COMMENT ON COLUMN discounts.discount_type IS 'Type of discount: flat (fixed amount) or percentage';
COMMENT ON COLUMN discounts.is_active IS 'Whether the discount is currently active';
COMMENT ON COLUMN discounts.created_by IS 'User ID who created this discount';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_discounts_is_active ON discounts(is_active);
CREATE INDEX IF NOT EXISTS idx_discounts_discount_type ON discounts(discount_type);
CREATE INDEX IF NOT EXISTS idx_discounts_created_by ON discounts(created_by);

-- Enable Row Level Security
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Policy: Authenticated users can read all discounts
CREATE POLICY "Allow authenticated users to read discounts"
ON discounts
FOR SELECT
TO authenticated
USING (true);

-- Policy: Authenticated users can create discounts (created_by set automatically)
CREATE POLICY "Allow authenticated users to create discounts"
ON discounts
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Authenticated users can update discounts
CREATE POLICY "Allow authenticated users to update discounts"
ON discounts
FOR UPDATE
TO authenticated
USING (true);

-- Policy: Authenticated users can delete discounts
CREATE POLICY "Allow authenticated users to delete discounts"
ON discounts
FOR DELETE
TO authenticated
USING (true);

-- ============================================================================
-- RPC Functions
-- ============================================================================

-- Function: add_discount
-- Creates a new discount with created_by set to current user
CREATE OR REPLACE FUNCTION add_discount(
  p_name TEXT,
  p_amount NUMERIC,
  p_discount_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_is_active BOOLEAN DEFAULT true
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  amount NUMERIC,
  discount_type TEXT,
  is_active BOOLEAN,
  created_by UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_discount RECORD;
BEGIN
  -- Validate discount_type
  IF p_discount_type NOT IN ('flat', 'percentage') THEN
    RAISE EXCEPTION 'Invalid discount_type. Must be "flat" or "percentage"';
  END IF;

  -- Validate amount based on type
  IF p_discount_type = 'percentage' AND (p_amount < 0 OR p_amount > 100) THEN
    RAISE EXCEPTION 'Percentage discount must be between 0 and 100';
  END IF;

  IF p_discount_type = 'flat' AND p_amount < 0 THEN
    RAISE EXCEPTION 'Flat discount amount must be positive';
  END IF;

  INSERT INTO discounts (name, description, amount, discount_type, is_active, created_by)
  VALUES (p_name, p_description, p_amount, p_discount_type, p_is_active, auth.uid())
  RETURNING * INTO new_discount;

  RETURN QUERY
  SELECT 
    new_discount.id,
    new_discount.name,
    new_discount.description,
    new_discount.amount,
    new_discount.discount_type,
    new_discount.is_active,
    new_discount.created_by,
    new_discount.created_at,
    new_discount.updated_at;
END;
$$;

-- Function: get_discounts
-- Returns all discounts ordered by created_at desc
CREATE OR REPLACE FUNCTION get_discounts()
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  amount NUMERIC,
  discount_type TEXT,
  is_active BOOLEAN,
  created_by UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.name,
    d.description,
    d.amount,
    d.discount_type,
    d.is_active,
    d.created_by,
    d.created_at,
    d.updated_at
  FROM discounts d
  ORDER BY d.created_at DESC;
END;
$$;

-- Function: update_discount
-- Updates an existing discount
CREATE OR REPLACE FUNCTION update_discount(
  p_id UUID,
  p_name TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_amount NUMERIC DEFAULT NULL,
  p_discount_type TEXT DEFAULT NULL,
  p_is_active BOOLEAN DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate discount_type if provided
  IF p_discount_type IS NOT NULL AND p_discount_type NOT IN ('flat', 'percentage') THEN
    RAISE EXCEPTION 'Invalid discount_type. Must be "flat" or "percentage"';
  END IF;

  -- Validate amount if provided
  IF p_amount IS NOT NULL THEN
    IF p_discount_type = 'percentage' AND (p_amount < 0 OR p_amount > 100) THEN
      RAISE EXCEPTION 'Percentage discount must be between 0 and 100';
    END IF;

    IF p_discount_type = 'flat' AND p_amount < 0 THEN
      RAISE EXCEPTION 'Flat discount amount must be positive';
    END IF;
  END IF;

  UPDATE discounts
  SET
    name = COALESCE(p_name, name),
    description = COALESCE(p_description, description),
    amount = COALESCE(p_amount, amount),
    discount_type = COALESCE(p_discount_type, discount_type),
    is_active = COALESCE(p_is_active, is_active),
    updated_at = NOW()
  WHERE id = p_id;

  RETURN FOUND;
END;
$$;

-- Function: delete_discount
-- Deletes a discount
CREATE OR REPLACE FUNCTION delete_discount(p_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM discounts WHERE id = p_id;
  RETURN FOUND;
END;
$$;

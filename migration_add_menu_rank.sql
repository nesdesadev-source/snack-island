-- Migration: Add menu_rank table and functions
-- Date: 2026-01-27

-- Create menu_rank table
CREATE TABLE IF NOT EXISTS menu_rank (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id UUID NOT NULL UNIQUE REFERENCES menu_items(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments to document the columns
COMMENT ON TABLE menu_rank IS 'Stores ranking order for menu items';
COMMENT ON COLUMN menu_rank.menu_id IS 'Reference to the menu item';
COMMENT ON COLUMN menu_rank.rank IS 'Display order rank (lower numbers appear first)';

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_menu_rank_menu_id ON menu_rank(menu_id);
CREATE INDEX IF NOT EXISTS idx_menu_rank_rank ON menu_rank(rank);

-- Enable Row Level Security
ALTER TABLE menu_rank ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Policy: Authenticated users can read all menu ranks
CREATE POLICY "Allow authenticated users to read menu ranks"
ON menu_rank
FOR SELECT
TO authenticated
USING (true);

-- Policy: Authenticated users can create menu ranks
CREATE POLICY "Allow authenticated users to create menu ranks"
ON menu_rank
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Authenticated users can update menu ranks
CREATE POLICY "Allow authenticated users to update menu ranks"
ON menu_rank
FOR UPDATE
TO authenticated
USING (true);

-- Policy: Authenticated users can delete menu ranks
CREATE POLICY "Allow authenticated users to delete menu ranks"
ON menu_rank
FOR DELETE
TO authenticated
USING (true);

-- ============================================================================
-- RPC Functions
-- ============================================================================

-- Function: get_menu_ranks
-- Returns all menu ranks ordered by rank
CREATE OR REPLACE FUNCTION get_menu_ranks()
RETURNS TABLE (
  id UUID,
  menu_id UUID,
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
    mr.id,
    mr.menu_id,
    mr.rank,
    mr.created_at,
    mr.updated_at
  FROM menu_rank mr
  ORDER BY mr.rank ASC;
END;
$$;

-- Function: update_menu_rank
-- Updates rank for a menu item
CREATE OR REPLACE FUNCTION update_menu_rank(
  p_menu_id UUID,
  p_rank INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO menu_rank (menu_id, rank)
  VALUES (p_menu_id, p_rank)
  ON CONFLICT (menu_id) 
  DO UPDATE SET 
    rank = p_rank,
    updated_at = NOW();
  
  RETURN FOUND;
END;
$$;

-- Function: swap_menu_ranks
-- Swaps ranks between two menu items
CREATE OR REPLACE FUNCTION swap_menu_ranks(
  p_menu_id_1 UUID,
  p_menu_id_2 UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rank_1 INTEGER;
  v_rank_2 INTEGER;
  v_temp_rank INTEGER;
BEGIN
  -- Get current ranks
  SELECT rank INTO v_rank_1 FROM menu_rank WHERE menu_id = p_menu_id_1;
  SELECT rank INTO v_rank_2 FROM menu_rank WHERE menu_id = p_menu_id_2;
  
  -- Check if both ranks exist
  IF v_rank_1 IS NULL OR v_rank_2 IS NULL THEN
    RAISE EXCEPTION 'One or both menu items do not have ranks assigned';
  END IF;
  
  -- Use a temporary rank value that's unlikely to conflict (very large negative)
  v_temp_rank := -999999;
  
  -- Step 1: Move first item to temp, second item to first's rank
  UPDATE menu_rank 
  SET rank = CASE 
    WHEN menu_id = p_menu_id_1 THEN v_temp_rank
    WHEN menu_id = p_menu_id_2 THEN v_rank_1
    ELSE rank
  END,
  updated_at = NOW()
  WHERE menu_id IN (p_menu_id_1, p_menu_id_2);
  
  -- Step 2: Move first item to second's original rank
  UPDATE menu_rank 
  SET rank = v_rank_2,
  updated_at = NOW()
  WHERE menu_id = p_menu_id_1;
  
  RETURN TRUE;
END;
$$;

-- Function: initialize_menu_ranks
-- Initializes ranks for all existing menu items based on alphabetical order
CREATE OR REPLACE FUNCTION initialize_menu_ranks()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER := 0;
  v_menu_item RECORD;
BEGIN
  -- Only initialize if no ranks exist
  IF EXISTS (SELECT 1 FROM menu_rank LIMIT 1) THEN
    RAISE EXCEPTION 'Menu ranks already initialized. Use swap_menu_ranks to reorder.';
  END IF;
  
  -- Insert ranks for all active menu items ordered by name
  FOR v_menu_item IN 
    SELECT id FROM menu_items 
    WHERE COALESCE(is_active, true) = true
    ORDER BY name ASC
  LOOP
    v_count := v_count + 1;
    INSERT INTO menu_rank (menu_id, rank)
    VALUES (v_menu_item.id, v_count)
    ON CONFLICT (menu_id) DO NOTHING;
  END LOOP;
  
  RETURN v_count;
END;
$$;

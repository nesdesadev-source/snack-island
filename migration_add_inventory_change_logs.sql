-- Migration: Add inventory_change_logs table
-- Date: 2026-02-26

-- ============================================================================
-- Table: inventory_change_logs
-- ============================================================================

CREATE TABLE IF NOT EXISTS inventory_change_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments for documentation
COMMENT ON TABLE inventory_change_logs IS 'Audit log of inventory changes (quantity and metadata) made by users.';
COMMENT ON COLUMN inventory_change_logs.inventory_id IS 'Reference to the inventory item that was changed.';
COMMENT ON COLUMN inventory_change_logs.user_id IS 'Auth user ID of the person who performed the change.';
COMMENT ON COLUMN inventory_change_logs.message IS 'Human-readable description of the change (e.g. \"Jane Doe added 3 pcs to Fries. (Prev: 5 pcs. New: 8 pcs)\").';
COMMENT ON COLUMN inventory_change_logs.created_at IS 'Timestamp when the change occurred.';

-- Helpful indexes for querying by item, user, and recency
CREATE INDEX IF NOT EXISTS idx_inventory_change_logs_inventory_id 
  ON inventory_change_logs(inventory_id);

CREATE INDEX IF NOT EXISTS idx_inventory_change_logs_user_id 
  ON inventory_change_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_inventory_change_logs_created_at 
  ON inventory_change_logs(created_at DESC);

-- ============================================================================
-- Row Level Security
-- ============================================================================

ALTER TABLE inventory_change_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read all inventory change logs
CREATE POLICY "Allow authenticated users to read inventory change logs"
ON inventory_change_logs
FOR SELECT
TO authenticated
USING (true);

-- Policy: Authenticated users can insert inventory change logs
-- (logs are written by the application on behalf of the current user)
CREATE POLICY "Allow authenticated users to insert inventory change logs"
ON inventory_change_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- We intentionally do NOT allow UPDATE or DELETE from the client to keep logs append-only.

-- ============================================================================
-- Retention Strategy (Manual/Cron-based)
-- ============================================================================
-- For retention, you can periodically prune old logs using a scheduled job
-- or manual SQL such as:
--
--   DELETE FROM inventory_change_logs
--   WHERE created_at < NOW() - INTERVAL '180 days';
--
-- Adjust the retention window as needed for your environment.


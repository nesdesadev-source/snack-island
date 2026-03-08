-- Migration: Add store_sessions table for manual Start Day / End of Day
-- Date: 2026-03-08
-- Purpose: Track store open/close windows so order queue and sales use session
--          boundaries instead of calendar date, preventing midnight resets.

-- ============================================================================
-- Table: store_sessions
-- ============================================================================

CREATE TABLE IF NOT EXISTS store_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  opened_by TEXT,
  closed_by TEXT
);

-- Ensure only one session can be open at a time (closed_at IS NULL)
CREATE UNIQUE INDEX idx_store_sessions_single_open
  ON store_sessions ((true))
  WHERE closed_at IS NULL;

-- Index for querying active session and recent sessions
CREATE INDEX IF NOT EXISTS idx_store_sessions_closed_at
  ON store_sessions (closed_at)
  WHERE closed_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_store_sessions_opened_at
  ON store_sessions (opened_at DESC);

-- Comments for documentation
COMMENT ON TABLE store_sessions IS 'Store open/close sessions for POS. Only one session is open at a time. Orders and sales use the active session window instead of calendar date.';
COMMENT ON COLUMN store_sessions.opened_at IS 'When the store session started (Start Day).';
COMMENT ON COLUMN store_sessions.closed_at IS 'When the store session ended (End of Day). NULL means session is still open.';
COMMENT ON COLUMN store_sessions.opened_by IS 'Optional: identifier of user who started the session.';
COMMENT ON COLUMN store_sessions.closed_by IS 'Optional: identifier of user who closed the session.';

-- ============================================================================
-- Row Level Security
-- ============================================================================

ALTER TABLE store_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow read access (for anon/authenticated - adapt if your app uses auth)
CREATE POLICY "Allow read store sessions"
  ON store_sessions
  FOR SELECT
  USING (true);

-- Policy: Allow insert (open session)
CREATE POLICY "Allow insert store sessions"
  ON store_sessions
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow update (close session - set closed_at)
CREATE POLICY "Allow update store sessions"
  ON store_sessions
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

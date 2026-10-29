-- Migration: Voucher codes become ISB- plus 3 digits (ISB-100 to ISB-999)
-- Date: 2026-10-30
-- Run AFTER migration_add_vouchers.sql.
--
-- There are only 900 numbers, so a number is reused once its last voucher is
-- more than 30 days old. The database picks the number so two admins can't
-- get the same one, and lookups always use the newest voucher for a code.

-- Codes are no longer unique forever, only within the 30-day window
ALTER TABLE vouchers DROP CONSTRAINT IF EXISTS vouchers_code_key;
CREATE INDEX IF NOT EXISTS idx_vouchers_code_created_at ON vouchers(code, created_at DESC);

-- ============================================================================
-- create_voucher: admin only. Picks a random free ISB-### number.
-- Raises VOUCHER_POOL_EXHAUSTED if all 900 were issued in the last 30 days.
-- ============================================================================

CREATE OR REPLACE FUNCTION create_voucher(p_menu_item_id UUID, p_expires_at TIMESTAMPTZ)
RETURNS SETOF vouchers
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND "roleId" = 0) THEN
    RAISE EXCEPTION 'VOUCHER_NOT_ALLOWED';
  END IF;

  -- One voucher at a time, so two admins never get the same number
  PERFORM pg_advisory_xact_lock(hashtext('create_voucher'));

  SELECT 'ISB-' || n::text INTO v_code
  FROM generate_series(100, 999) AS n
  WHERE NOT EXISTS (
    SELECT 1 FROM vouchers v
    WHERE v.code = 'ISB-' || n::text
      AND v.created_at > now() - interval '30 days'
  )
  ORDER BY random()
  LIMIT 1;

  IF v_code IS NULL THEN
    RAISE EXCEPTION 'VOUCHER_POOL_EXHAUSTED';
  END IF;

  RETURN QUERY
  INSERT INTO vouchers (code, menu_item_id, expires_at, created_by)
  VALUES (v_code, p_menu_item_id, p_expires_at, auth.uid())
  RETURNING *;
END;
$$;

GRANT EXECUTE ON FUNCTION create_voucher(UUID, TIMESTAMPTZ) TO authenticated;

-- ============================================================================
-- redeem_vouchers: same as before, but checks the NEWEST voucher for each code
-- ============================================================================

CREATE OR REPLACE FUNCTION redeem_vouchers(p_codes TEXT[], p_order_id UUID)
RETURNS SETOF vouchers
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
  v_row vouchers%ROWTYPE;
  v_ids UUID[] := '{}';
BEGIN
  IF p_codes IS NULL OR array_length(p_codes, 1) IS NULL THEN
    RAISE EXCEPTION 'VOUCHER_NONE';
  END IF;

  IF (SELECT count(DISTINCT c) FROM unnest(p_codes) c) <> array_length(p_codes, 1) THEN
    SELECT c INTO v_code FROM unnest(p_codes) c GROUP BY c HAVING count(*) > 1 LIMIT 1;
    RAISE EXCEPTION 'VOUCHER_DUPLICATE:%', v_code;
  END IF;

  FOREACH v_code IN ARRAY p_codes LOOP
    SELECT * INTO v_row
    FROM vouchers
    WHERE code = v_code
    ORDER BY created_at DESC
    LIMIT 1
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'VOUCHER_NOT_FOUND:%', v_code;
    ELSIF v_row.status = 'redeemed' THEN
      RAISE EXCEPTION 'VOUCHER_REDEEMED:%', v_code;
    ELSIF v_row.status = 'void' THEN
      RAISE EXCEPTION 'VOUCHER_VOID:%', v_code;
    ELSIF v_row.expires_at <= now() THEN
      RAISE EXCEPTION 'VOUCHER_EXPIRED:%', v_code;
    END IF;

    v_ids := v_ids || v_row.id;
  END LOOP;

  RETURN QUERY
  UPDATE vouchers
  SET status = 'redeemed',
      order_id = p_order_id,
      redeemed_at = now(),
      redeemed_by = auth.uid()
  WHERE id = ANY(v_ids)
  RETURNING *;
END;
$$;

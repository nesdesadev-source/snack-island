-- Migration: Add vouchers (free burger for an IG story tag)
-- Date: 2026-10-30
--
-- Flow: admin generates a code on the Dashboard -> customer shows it to staff ->
-- staff creates a "Voucher Order" -> each code becomes 1 free burger (subtotal 0).
-- A code is single use and expires 3 days after it is generated.
-- Cancelling the order puts its codes back to "unused".

CREATE TABLE IF NOT EXISTS vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id),
  status TEXT NOT NULL DEFAULT 'unused' CHECK (status IN ('unused', 'redeemed', 'void')),
  expires_at TIMESTAMPTZ NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  redeemed_at TIMESTAMPTZ,
  redeemed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) DEFAULT auth.uid()
);

CREATE INDEX IF NOT EXISTS idx_vouchers_order_id ON vouchers(order_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_created_at ON vouchers(created_at);

COMMENT ON TABLE vouchers IS 'Single-use codes worth one free menu item, given for IG story tags';
COMMENT ON COLUMN vouchers.order_id IS 'Order the voucher was redeemed on (null while unused)';

-- ============================================================================
-- Row Level Security
-- Everyone signed in can look up codes. Only admins (roleId = 0) can create or
-- void them. Redeeming and releasing go through the functions below.
-- ============================================================================

ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read vouchers" ON vouchers;
CREATE POLICY "Authenticated users can read vouchers"
ON vouchers FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "Admins can create vouchers" ON vouchers;
CREATE POLICY "Admins can create vouchers"
ON vouchers FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND "roleId" = 0));

DROP POLICY IF EXISTS "Admins can update vouchers" ON vouchers;
CREATE POLICY "Admins can update vouchers"
ON vouchers FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND "roleId" = 0));

-- ============================================================================
-- redeem_vouchers: atomically mark codes as redeemed on an order.
-- Fails as a whole if any code can't be used. The error message starts with a
-- reason the app turns into a friendly message:
--   VOUCHER_NOT_FOUND:<code> | VOUCHER_REDEEMED:<code> | VOUCHER_EXPIRED:<code>
--   VOUCHER_VOID:<code>      | VOUCHER_DUPLICATE:<code>
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
BEGIN
  IF p_codes IS NULL OR array_length(p_codes, 1) IS NULL THEN
    RAISE EXCEPTION 'VOUCHER_NONE';
  END IF;

  IF (SELECT count(DISTINCT c) FROM unnest(p_codes) c) <> array_length(p_codes, 1) THEN
    SELECT c INTO v_code FROM unnest(p_codes) c GROUP BY c HAVING count(*) > 1 LIMIT 1;
    RAISE EXCEPTION 'VOUCHER_DUPLICATE:%', v_code;
  END IF;

  FOREACH v_code IN ARRAY p_codes LOOP
    SELECT * INTO v_row FROM vouchers WHERE code = v_code FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'VOUCHER_NOT_FOUND:%', v_code;
    ELSIF v_row.status = 'redeemed' THEN
      RAISE EXCEPTION 'VOUCHER_REDEEMED:%', v_code;
    ELSIF v_row.status = 'void' THEN
      RAISE EXCEPTION 'VOUCHER_VOID:%', v_code;
    ELSIF v_row.expires_at <= now() THEN
      RAISE EXCEPTION 'VOUCHER_EXPIRED:%', v_code;
    END IF;
  END LOOP;

  RETURN QUERY
  UPDATE vouchers
  SET status = 'redeemed',
      order_id = p_order_id,
      redeemed_at = now(),
      redeemed_by = auth.uid()
  WHERE code = ANY(p_codes)
  RETURNING *;
END;
$$;

-- ============================================================================
-- release_vouchers: put an order's codes back to "unused" (order cancelled).
-- ============================================================================

CREATE OR REPLACE FUNCTION release_vouchers(p_order_id UUID)
RETURNS SETOF vouchers
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  UPDATE vouchers
  SET status = 'unused',
      order_id = NULL,
      redeemed_at = NULL,
      redeemed_by = NULL
  WHERE order_id = p_order_id AND status = 'redeemed'
  RETURNING *;
END;
$$;

GRANT EXECUTE ON FUNCTION redeem_vouchers(TEXT[], UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION release_vouchers(UUID) TO authenticated;

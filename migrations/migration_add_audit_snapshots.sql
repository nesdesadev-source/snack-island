CREATE TABLE IF NOT EXISTS audit_cash_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES store_sessions(id) ON DELETE CASCADE,
  name text NOT NULL,
  start_of_day numeric NOT NULL DEFAULT 0,
  end_of_day numeric NOT NULL DEFAULT 0,
  expense_amount numeric,
  saved_at timestamptz DEFAULT now(),
  UNIQUE (session_id, name)
);

CREATE TABLE IF NOT EXISTS audit_ingredient_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES store_sessions(id) ON DELETE CASCADE,
  ingredient text NOT NULL,
  add_ons numeric NOT NULL DEFAULT 0,
  yesterday_eod numeric NOT NULL DEFAULT 0,
  today_eod numeric NOT NULL DEFAULT 0,
  saved_at timestamptz DEFAULT now(),
  UNIQUE (session_id, ingredient)
);

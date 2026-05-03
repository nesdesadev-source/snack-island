CREATE TABLE IF NOT EXISTS audit_ingredient_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE CASCADE,
  ingredient text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS audit_ingredient_mappings_menu_item_ingredient_idx
  ON audit_ingredient_mappings(menu_item_id, ingredient);

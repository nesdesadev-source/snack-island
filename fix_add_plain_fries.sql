-- Quick fix to add 'plain' option to fries_option CHECK constraint
-- Run this in your Supabase SQL Editor

-- First, find the constraint name (it might be different)
-- Common constraint names: order_items_fries_option_check, order_items_fries_option_check1, etc.

-- Drop the existing constraint (try common names)
DO $$ 
BEGIN
    -- Try to drop the constraint if it exists
    ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_fries_option_check;
    ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_fries_option_check1;
    ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_fries_option_check2;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Alternative: Find and drop the constraint dynamically
DO $$
DECLARE
    constraint_name text;
BEGIN
    -- Find the constraint name
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'order_items'::regclass
      AND contype = 'c'
      AND conname LIKE '%fries_option%';
    
    -- Drop it if found
    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE order_items DROP CONSTRAINT IF EXISTS %I', constraint_name);
    END IF;
END $$;

-- Add the new constraint with 'plain' option
ALTER TABLE order_items
ADD CONSTRAINT order_items_fries_option_check 
CHECK (fries_option IS NULL OR fries_option IN ('plain', 'cheese', 'sour_cream', 'bbq'));

-- Simple fix to add 'plain' option to fries_option CHECK constraint
-- Run this in your Supabase SQL Editor

-- Method 1: Drop and recreate (if you know the constraint name)
-- Replace 'order_items_fries_option_check' with your actual constraint name if different
ALTER TABLE order_items 
DROP CONSTRAINT IF EXISTS order_items_fries_option_check;

ALTER TABLE order_items
ADD CONSTRAINT order_items_fries_option_check 
CHECK (fries_option IS NULL OR fries_option IN ('plain', 'cheese', 'sour_cream', 'bbq'));

-- If the above doesn't work, use this to find the constraint name first:
-- SELECT conname 
-- FROM pg_constraint 
-- WHERE conrelid = 'order_items'::regclass 
--   AND contype = 'c' 
--   AND conname LIKE '%fries%';

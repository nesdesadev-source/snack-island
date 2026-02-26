-- Migration: Update expense category constraint to include new categories
-- Date: 2026-02-20
-- Description: Adds Labor, Machinery, and Government Fees to the expense category constraint

-- Drop the existing category constraint
ALTER TABLE expenses
DROP CONSTRAINT IF EXISTS expenses_category_check;

-- Add updated constraint with all categories
ALTER TABLE expenses
ADD CONSTRAINT expenses_category_check CHECK (
  category IN (
    'Supplies',
    'Gas',
    'Misc',
    'Maintenance',
    'Equipment',
    'Ingredients',
    'Utilities',
    'Other',
    'Labor',
    'Machinery',
    'Government Fees'
  )
);

-- Add comment to document the change
COMMENT ON COLUMN expenses.category IS 'Expense category: Supplies, Gas, Misc, Maintenance, Equipment, Ingredients, Utilities, Other, Labor, Machinery, Government Fees';

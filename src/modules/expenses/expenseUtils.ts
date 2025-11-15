import type { Expense } from '../../models';

/**
 * Calculates the total amount of all expenses
 */
export function calculateTotalExpenses(expenses: Expense[]): number {
  if (expenses.length === 0) return 0;
  
  return expenses.reduce((total, expense) => total + expense.amount, 0);
}

/**
 * Calculates total expenses grouped by category
 * Returns an object with category names as keys and total amounts as values
 */
export function calculateExpensesByCategory(expenses: Expense[]): Record<string, number> {
  if (expenses.length === 0) return {};
  
  return expenses.reduce((acc, expense) => {
    const category = expense.category;
    acc[category] = (acc[category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Calculates the average expense amount
 */
export function calculateAverageExpense(expenses: Expense[]): number {
  if (expenses.length === 0) return 0;
  
  const total = calculateTotalExpenses(expenses);
  return total / expenses.length;
}

/**
 * Calculates what percentage of total expenses a specific category represents
 */
export function calculateCategoryPercentage(expenses: Expense[], category: string): number {
  if (expenses.length === 0) return 0;
  
  const total = calculateTotalExpenses(expenses);
  if (total === 0) return 0;
  
  const categoryExpenses = calculateExpensesByCategory(expenses);
  const categoryTotal = categoryExpenses[category] || 0;
  
  return (categoryTotal / total) * 100;
}

/**
 * Calculates the average daily expense rate for a date range
 */
export function calculateDailyExpenseRate(
  expenses: Expense[],
  startDate: string,
  endDate: string
): number {
  if (expenses.length === 0) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysDifference = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  const total = calculateTotalExpenses(expenses);
  return total / daysDifference;
}

/**
 * Calculates the average monthly expense rate for a date range
 */
export function calculateMonthlyExpenseRate(
  expenses: Expense[],
  startDate: string,
  endDate: string
): number {
  if (expenses.length === 0) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const yearDiff = end.getFullYear() - start.getFullYear();
  const monthDiff = end.getMonth() - start.getMonth();
  const totalMonths = yearDiff * 12 + monthDiff + 1;
  
  const total = calculateTotalExpenses(expenses);
  return total / totalMonths;
}

/**
 * Calculates the percentage change between current and previous period expenses
 * Returns positive number for increase, negative for decrease
 */
export function calculateExpenseTrend(currentPeriod: number, previousPeriod: number): number {
  if (previousPeriod === 0) return 0;
  
  return ((currentPeriod - previousPeriod) / previousPeriod) * 100;
}

/**
 * Checks if total expenses are within or equal to budget
 */
export function isWithinBudget(totalExpenses: number, budget: number): boolean {
  return totalExpenses <= budget;
}

/**
 * Calculates how much budget remains
 * Returns negative value if over budget
 */
export function calculateBudgetRemaining(totalExpenses: number, budget: number): number {
  return budget - totalExpenses;
}

/**
 * Calculates total expenses for a specific year (Year-to-Date)
 */
export function calculateYearToDateExpenses(expenses: Expense[], year: number): number {
  const yearExpenses = expenses.filter(expense => {
    const expenseYear = new Date(expense.expense_date).getFullYear();
    return expenseYear === year;
  });
  
  return calculateTotalExpenses(yearExpenses);
}

/**
 * Filters expenses within a specific date range (inclusive)
 * Normalizes all dates to local timezone midnight to avoid timezone issues
 */
export function filterExpensesByDateRange(
  expenses: Expense[],
  startDate: string,
  endDate: string
): Expense[] {
  // Normalize start date to beginning of day (00:00:00) in local timezone
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  // Normalize end date to end of day (23:59:59.999) in local timezone
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  
  return expenses.filter(expense => {
    // Normalize expense date to beginning of day in local timezone
    const expenseDate = new Date(expense.expense_date);
    expenseDate.setHours(0, 0, 0, 0);
    
    // Check if expense date is within range (both inclusive)
    return expenseDate >= start && expenseDate <= end;
  });
}

/**
 * Calculates the growth rate between two expense periods
 * Compares total expenses from current period vs previous period
 */
export function calculateExpenseGrowth(
  currentExpenses: Expense[],
  previousExpenses: Expense[]
): number {
  const currentTotal = calculateTotalExpenses(currentExpenses);
  const previousTotal = calculateTotalExpenses(previousExpenses);
  
  return calculateExpenseTrend(currentTotal, previousTotal);
}


import { describe, it, expect } from 'vitest';
import {
  calculateTotalExpenses,
  calculateExpensesByCategory,
  calculateAverageExpense,
  calculateCategoryPercentage,
  calculateDailyExpenseRate,
  calculateMonthlyExpenseRate,
  calculateExpenseTrend,
  isWithinBudget,
  calculateBudgetRemaining,
  calculateYearToDateExpenses,
  filterExpensesByDateRange,
  calculateExpenseGrowth
} from '../../src/modules/expenses/expenseUtils';
import type { Expense } from '../../src/models';

describe('Expense Utils - Calculations', () => {
  const mockExpenses: Expense[] = [
    {
      id: '1',
      expense_date: '2025-10-01',
      category: 'Ingredients',
      description: 'Ingredients',
      amount: 500,
      paid_by: 'John Doe',
      reimburse_status: 1
    },
    {
      id: '2',
      expense_date: '2025-10-02',
      category: 'Gas',
      description: 'Fuel',
      amount: 200,
      paid_by: 'Jane Smith',
      reimburse_status: 0
    },
    {
      id: '3',
      expense_date: '2025-10-03',
      category: 'Ingredients',
      description: 'More ingredients',
      amount: 300,
      paid_by: 'Bob Wilson',
      reimburse_status: 1
    },
    {
      id: '4',
      expense_date: '2025-10-05',
      category: 'Utilities',
      description: 'Electricity',
      amount: 150,
      paid_by: 'Alice Johnson',
      reimburse_status: 0
    }
  ];

  describe('calculateTotalExpenses', () => {
    it('should calculate total of all expenses', () => {
      const result = calculateTotalExpenses(mockExpenses);
      
      expect(result).toBe(1150);
    });

    it('should return 0 for empty array', () => {
      const result = calculateTotalExpenses([]);
      
      expect(result).toBe(0);
    });

    it('should handle single expense', () => {
      const singleExpense: Expense[] = [{
        id: '1',
        expense_date: '2025-10-01',
        category: 'Ingredients',
        description: 'Test',
        amount: 100,
        paid_by: 'Test User',
        reimburse_status: 0
      }];
      
      const result = calculateTotalExpenses(singleExpense);
      
      expect(result).toBe(100);
    });

    it('should handle decimal amounts', () => {
      const expensesWithDecimals: Expense[] = [
        {
          id: '1',
          expense_date: '2025-10-01',
          category: 'Supplies',
          description: 'Test',
          amount: 10.50,
          paid_by: 'Test User',
          reimburse_status: 0
        },
        {
          id: '2',
          expense_date: '2025-10-02',
          category: 'Gas',
          description: 'Test',
          amount: 20.75,
          paid_by: 'Test User',
          reimburse_status: 0
        }
      ];
      
      const result = calculateTotalExpenses(expensesWithDecimals);
      
      expect(result).toBeCloseTo(31.25, 2);
    });
  });

  describe('calculateExpensesByCategory', () => {
    it('should calculate total expenses for each category', () => {
      const result = calculateExpensesByCategory(mockExpenses);
      
      expect(result).toEqual({
        Ingredients: 800,
        Gas: 200,
        Utilities: 150
      });
    });

    it('should return empty object for empty array', () => {
      const result = calculateExpensesByCategory([]);
      
      expect(result).toEqual({});
    });

    it('should handle single category', () => {
      const singleCategory: Expense[] = [{
        id: '1',
        expense_date: '2025-10-01',
        category: 'Ingredients',
        description: 'Test',
        amount: 100,
        paid_by: 'Test User',
        reimburse_status: 0
      }];
      
      const result = calculateExpensesByCategory(singleCategory);
      
      expect(result).toEqual({ Ingredients: 100 });
    });

    it('should aggregate multiple expenses in same category', () => {
      const duplicateCategories: Expense[] = [
        {
          id: '1',
          expense_date: '2025-10-01',
          category: 'Gas',
          description: 'Test 1',
          amount: 100
        },
        {
          id: '2',
          expense_date: '2025-10-02',
          category: 'Gas',
          description: 'Test 2',
          amount: 150
        },
        {
          id: '3',
          expense_date: '2025-10-03',
          category: 'Gas',
          description: 'Test 3',
          amount: 50
        }
      ];
      
      const result = calculateExpensesByCategory(duplicateCategories);
      
      expect(result).toEqual({ Gas: 300 });
    });
  });

  describe('calculateAverageExpense', () => {
    it('should calculate average expense amount', () => {
      const result = calculateAverageExpense(mockExpenses);
      
      expect(result).toBe(287.5);
    });

    it('should return 0 for empty array', () => {
      const result = calculateAverageExpense([]);
      
      expect(result).toBe(0);
    });

    it('should handle single expense', () => {
      const singleExpense: Expense[] = [{
        id: '1',
        expense_date: '2025-10-01',
        category: 'Ingredients',
        description: 'Test',
        amount: 100,
        paid_by: 'Test User',
        reimburse_status: 0
      }];
      
      const result = calculateAverageExpense(singleExpense);
      
      expect(result).toBe(100);
    });

    it('should handle decimal results', () => {
      const expenses: Expense[] = [
        {
          id: '1',
          expense_date: '2025-10-01',
          category: 'Ingredients',
          description: 'Test',
          amount: 100,
          paid_by: 'Test User',
          reimburse_status: 0
        },
        {
          id: '2',
          expense_date: '2025-10-02',
          category: 'Gas',
          description: 'Test',
          amount: 150,
          paid_by: 'Test User',
          reimburse_status: 0
        },
        {
          id: '3',
          expense_date: '2025-10-03',
          category: 'Supplies',
          description: 'Test',
          amount: 175,
          paid_by: 'Test User',
          reimburse_status: 0
        }
      ];
      
      const result = calculateAverageExpense(expenses);
      
      expect(result).toBeCloseTo(141.67, 2);
    });
  });

  describe('calculateCategoryPercentage', () => {
    it('should calculate percentage of total for a category', () => {
      const result = calculateCategoryPercentage(mockExpenses, 'Ingredients');
      
      expect(result).toBeCloseTo(69.57, 2);
    });

    it('should return 0 for non-existent category', () => {
      const result = calculateCategoryPercentage(mockExpenses, 'Equipment');
      
      expect(result).toBe(0);
    });

    it('should return 0 for empty expenses array', () => {
      const result = calculateCategoryPercentage([], 'Ingredients');
      
      expect(result).toBe(0);
    });

    it('should return 100 when only one category exists', () => {
      const singleCategory: Expense[] = [
        {
          id: '1',
          expense_date: '2025-10-01',
          category: 'Gas',
          description: 'Test 1',
          amount: 100,
          paid_by: 'Test User',
          reimburse_status: 0
        },
        {
          id: '2',
          expense_date: '2025-10-02',
          category: 'Gas',
          description: 'Test 2',
          amount: 50,
          paid_by: 'Test User',
          reimburse_status: 0
        }
      ];
      
      const result = calculateCategoryPercentage(singleCategory, 'Gas');
      
      expect(result).toBe(100);
    });

    it('should handle decimal percentages', () => {
      const result = calculateCategoryPercentage(mockExpenses, 'Utilities');
      
      expect(result).toBeCloseTo(13.04, 2);
    });
  });

  describe('calculateDailyExpenseRate', () => {
    it('should calculate average daily expense rate', () => {
      const startDate = '2025-10-01';
      const endDate = '2025-10-05';
      
      const result = calculateDailyExpenseRate(mockExpenses, startDate, endDate);
      
      expect(result).toBeCloseTo(230, 2);
    });

    it('should return 0 for empty expenses', () => {
      const result = calculateDailyExpenseRate([], '2025-10-01', '2025-10-05');
      
      expect(result).toBe(0);
    });

    it('should handle single day period', () => {
      const singleDayExpenses: Expense[] = [{
        id: '1',
        expense_date: '2025-10-01',
        category: 'Ingredients',
        description: 'Test',
        amount: 500,
        paid_by: 'Test User',
        reimburse_status: 0
      }];
      
      const result = calculateDailyExpenseRate(singleDayExpenses, '2025-10-01', '2025-10-01');
      
      expect(result).toBe(500);
    });

    it('should handle decimal amounts', () => {
      const expenses: Expense[] = [
        {
          id: '1',
          expense_date: '2025-10-01',
          category: 'Ingredients',
          description: 'Test',
          amount: 33.33,
          paid_by: 'Test User',
          reimburse_status: 0
        },
        {
          id: '2',
          expense_date: '2025-10-02',
          category: 'Gas',
          description: 'Test',
          amount: 66.67,
          paid_by: 'Test User',
          reimburse_status: 0
        }
      ];
      
      const result = calculateDailyExpenseRate(expenses, '2025-10-01', '2025-10-02');
      
      expect(result).toBeCloseTo(50, 2);
    });
  });

  describe('calculateMonthlyExpenseRate', () => {
    it('should calculate average monthly expense rate', () => {
      const expenses: Expense[] = [
        {
          id: '1',
          expense_date: '2025-01-15',
          category: 'Ingredients',
          description: 'Test',
          amount: 3000,
          paid_by: 'Test User',
          reimburse_status: 0
        },
        {
          id: '2',
          expense_date: '2025-02-15',
          category: 'Gas',
          description: 'Test',
          amount: 3000,
          paid_by: 'Test User',
          reimburse_status: 0
        },
        {
          id: '3',
          expense_date: '2025-03-15',
          category: 'Supplies',
          description: 'Test',
          amount: 3000,
          paid_by: 'Test User',
          reimburse_status: 0
        }
      ];
      
      const result = calculateMonthlyExpenseRate(expenses, '2025-01-01', '2025-03-31');
      
      expect(result).toBeCloseTo(3000, 2);
    });

    it('should return 0 for empty expenses', () => {
      const result = calculateMonthlyExpenseRate([], '2025-01-01', '2025-12-31');
      
      expect(result).toBe(0);
    });

    it('should handle single month period', () => {
      const singleMonth: Expense[] = [{
        id: '1',
        expense_date: '2025-10-15',
        category: 'Ingredients',
        description: 'Test',
        amount: 5000,
        paid_by: 'Test User',
        reimburse_status: 0
      }];
      
      const result = calculateMonthlyExpenseRate(singleMonth, '2025-10-01', '2025-10-31');
      
      expect(result).toBe(5000);
    });
  });

  describe('calculateExpenseTrend', () => {
    it('should calculate positive trend when expenses increase', () => {
      const currentPeriod = 1500;
      const previousPeriod = 1000;
      
      const result = calculateExpenseTrend(currentPeriod, previousPeriod);
      
      expect(result).toBe(50);
    });

    it('should calculate negative trend when expenses decrease', () => {
      const currentPeriod = 800;
      const previousPeriod = 1000;
      
      const result = calculateExpenseTrend(currentPeriod, previousPeriod);
      
      expect(result).toBe(-20);
    });

    it('should return 0 when expenses are unchanged', () => {
      const currentPeriod = 1000;
      const previousPeriod = 1000;
      
      const result = calculateExpenseTrend(currentPeriod, previousPeriod);
      
      expect(result).toBe(0);
    });

    it('should return 0 when previous period is 0', () => {
      const currentPeriod = 1000;
      const previousPeriod = 0;
      
      const result = calculateExpenseTrend(currentPeriod, previousPeriod);
      
      expect(result).toBe(0);
    });

    it('should handle decimal percentages', () => {
      const currentPeriod = 1337.50;
      const previousPeriod = 1200;
      
      const result = calculateExpenseTrend(currentPeriod, previousPeriod);
      
      expect(result).toBeCloseTo(11.46, 2);
    });
  });

  describe('isWithinBudget', () => {
    it('should return true when total is within budget', () => {
      const totalExpenses = 800;
      const budget = 1000;
      
      const result = isWithinBudget(totalExpenses, budget);
      
      expect(result).toBe(true);
    });

    it('should return true when total equals budget', () => {
      const totalExpenses = 1000;
      const budget = 1000;
      
      const result = isWithinBudget(totalExpenses, budget);
      
      expect(result).toBe(true);
    });

    it('should return false when total exceeds budget', () => {
      const totalExpenses = 1200;
      const budget = 1000;
      
      const result = isWithinBudget(totalExpenses, budget);
      
      expect(result).toBe(false);
    });

    it('should handle decimal amounts', () => {
      const totalExpenses = 999.99;
      const budget = 1000;
      
      const result = isWithinBudget(totalExpenses, budget);
      
      expect(result).toBe(true);
    });
  });

  describe('calculateBudgetRemaining', () => {
    it('should calculate remaining budget correctly', () => {
      const totalExpenses = 650;
      const budget = 1000;
      
      const result = calculateBudgetRemaining(totalExpenses, budget);
      
      expect(result).toBe(350);
    });

    it('should return 0 when budget is fully used', () => {
      const totalExpenses = 1000;
      const budget = 1000;
      
      const result = calculateBudgetRemaining(totalExpenses, budget);
      
      expect(result).toBe(0);
    });

    it('should return negative when over budget', () => {
      const totalExpenses = 1200;
      const budget = 1000;
      
      const result = calculateBudgetRemaining(totalExpenses, budget);
      
      expect(result).toBe(-200);
    });

    it('should handle decimal amounts', () => {
      const totalExpenses = 567.89;
      const budget = 1000;
      
      const result = calculateBudgetRemaining(totalExpenses, budget);
      
      expect(result).toBeCloseTo(432.11, 2);
    });
  });

  describe('calculateYearToDateExpenses', () => {
    it('should calculate YTD expenses from beginning of year', () => {
      const expenses: Expense[] = [
        {
          id: '1',
          expense_date: '2025-01-15',
          category: 'Ingredients',
          description: 'Test',
          amount: 500,
          paid_by: 'Test User',
          reimburse_status: 0
        },
        {
          id: '2',
          expense_date: '2025-05-20',
          category: 'Gas',
          description: 'Test',
          amount: 300,
          paid_by: 'Test User',
          reimburse_status: 0
        },
        {
          id: '3',
          expense_date: '2025-10-10',
          category: 'Supplies',
          description: 'Test',
          amount: 200,
          paid_by: 'Test User',
          reimburse_status: 0
        },
        {
          id: '4',
          expense_date: '2024-12-31',
          category: 'Ingredients',
          description: 'Previous year',
          amount: 1000,
          paid_by: 'Test User',
          reimburse_status: 0
        }
      ];
      const year = 2025;
      
      const result = calculateYearToDateExpenses(expenses, year);
      
      expect(result).toBe(1000);
    });

    it('should return 0 for year with no expenses', () => {
      const result = calculateYearToDateExpenses(mockExpenses, 2024);
      
      expect(result).toBe(0);
    });

    it('should handle single expense in year', () => {
      const expenses: Expense[] = [{
        id: '1',
        expense_date: '2025-06-15',
        category: 'Ingredients',
        description: 'Test',
        amount: 750,
        paid_by: 'Test User',
        reimburse_status: 0
      }];
      
      const result = calculateYearToDateExpenses(expenses, 2025);
      
      expect(result).toBe(750);
    });
  });

  describe('filterExpensesByDateRange', () => {
    it('should filter expenses within date range', () => {
      const startDate = '2025-10-02';
      const endDate = '2025-10-04';
      
      const result = filterExpensesByDateRange(mockExpenses, startDate, endDate);
      
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('2');
      expect(result[1].id).toBe('3');
    });

    it('should include expenses on boundary dates', () => {
      const startDate = '2025-10-01';
      const endDate = '2025-10-03';
      
      const result = filterExpensesByDateRange(mockExpenses, startDate, endDate);
      
      expect(result).toHaveLength(3);
    });

    it('should return empty array when no expenses in range', () => {
      const startDate = '2025-10-10';
      const endDate = '2025-10-20';
      
      const result = filterExpensesByDateRange(mockExpenses, startDate, endDate);
      
      expect(result).toHaveLength(0);
    });

    it('should handle single day range', () => {
      const startDate = '2025-10-01';
      const endDate = '2025-10-01';
      
      const result = filterExpensesByDateRange(mockExpenses, startDate, endDate);
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });
  });

  describe('calculateExpenseGrowth', () => {
    it('should calculate growth rate between two periods', () => {
      const currentExpenses: Expense[] = [
        {
          id: '1',
          expense_date: '2025-10-01',
          category: 'Ingredients',
          description: 'Test',
          amount: 600,
          paid_by: 'Test User',
          reimburse_status: 0
        }
      ];
      const previousExpenses: Expense[] = [
        {
          id: '2',
          expense_date: '2025-09-01',
          category: 'Ingredients',
          description: 'Test',
          amount: 500,
          paid_by: 'Test User',
          reimburse_status: 0
        }
      ];
      
      const result = calculateExpenseGrowth(currentExpenses, previousExpenses);
      
      expect(result).toBe(20);
    });

    it('should return 0 when no previous expenses', () => {
      const currentExpenses: Expense[] = [{
        id: '1',
        expense_date: '2025-10-01',
        category: 'Ingredients',
        description: 'Test',
        amount: 500,
        paid_by: 'Test User',
        reimburse_status: 0
      }];
      
      const result = calculateExpenseGrowth(currentExpenses, []);
      
      expect(result).toBe(0);
    });

    it('should calculate negative growth when expenses decrease', () => {
      const currentExpenses: Expense[] = [{
        id: '1',
        expense_date: '2025-10-01',
        category: 'Ingredients',
        description: 'Test',
        amount: 400,
        paid_by: 'Test User',
        reimburse_status: 0
      }];
      const previousExpenses: Expense[] = [{
        id: '2',
        expense_date: '2025-09-01',
        category: 'Ingredients',
        description: 'Test',
        amount: 500,
        paid_by: 'Test User',
        reimburse_status: 0
      }];
      
      const result = calculateExpenseGrowth(currentExpenses, previousExpenses);
      
      expect(result).toBe(-20);
    });

    it('should return 0 when both periods have same expenses', () => {
      const currentExpenses: Expense[] = [{
        id: '1',
        expense_date: '2025-10-01',
        category: 'Ingredients',
        description: 'Test',
        amount: 500,
        paid_by: 'Test User',
        reimburse_status: 0
      }];
      const previousExpenses: Expense[] = [{
        id: '2',
        expense_date: '2025-09-01',
        category: 'Ingredients',
        description: 'Test',
        amount: 500,
        paid_by: 'Test User',
        reimburse_status: 0
      }];
      
      const result = calculateExpenseGrowth(currentExpenses, previousExpenses);
      
      expect(result).toBe(0);
    });
  });
});


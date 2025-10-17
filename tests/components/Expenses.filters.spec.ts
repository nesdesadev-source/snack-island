import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createApp, nextTick } from 'vue'
import Expenses from '../../src/components/Expenses.vue'

// Mock expenseService used inside Expenses.vue
vi.mock('../../src/services/expenseService', () => {
  return {
    expenseService: {
      getAll: vi.fn(async () => [
        {
          id: 1,
          expense_date: '2025-10-10',
          category: 'Supplies',
          description: 'Paper cups',
          amount: 150,
          supplier_id: 'S-001',
          paid_by: 'John',
          reimburse_status: 1,
        },
        {
          id: 2,
          expense_date: '2025-10-11',
          category: 'Gas',
          description: 'Fuel for delivery',
          amount: 800,
          supplier_id: 'S-002',
          paid_by: 'Maria',
          reimburse_status: 2,
        },
        {
          id: 3,
          expense_date: '2025-10-12',
          category: 'Misc',
          description: 'Parking',
          amount: 50,
          supplier_id: 'S-003',
          paid_by: 'Alex',
          reimburse_status: 0,
        },
      ]),
      addExpense: vi.fn(),
      updateExpense: vi.fn(),
      deleteExpense: vi.fn(),
    },
  }
})

describe('Expenses.vue filters', () => {
  let el: HTMLDivElement

  beforeEach(() => {
    el = document.createElement('div')
    document.body.innerHTML = ''
    document.body.appendChild(el)
  })

  it('filters by paid_by using the search input', async () => {
    const app = createApp(Expenses)
    app.mount(el)

    // Wait for initial load
    await nextTick()
    await nextTick()

    // Initially should render 3 rows
    expect(el.querySelectorAll('.table-row').length).toBe(3)

    const searchInput = el.querySelector<HTMLInputElement>('input.search-input')!
    searchInput.value = 'maria'
    searchInput.dispatchEvent(new Event('input'))
    await nextTick()

    // Should filter to the row where paid_by includes 'Maria'
    expect(el.querySelectorAll('.table-row').length).toBe(1)
    const rowHtml = el.querySelector('.table-row')!.innerHTML.toLowerCase()
    expect(rowHtml.includes('maria')).toBe(true)

    app.unmount()
  })

  it('filters by reimbursement status via dropdown', async () => {
    const app = createApp(Expenses)
    app.mount(el)

    await nextTick()
    await nextTick()

    // Sanity: 3 rows initially
    expect(el.querySelectorAll('.table-row').length).toBe(3)

    const reimburseSelect = el.querySelector<HTMLSelectElement>('select[data-testid="reimburse-select"]')!

    // Needs Reimbursement (1)
    reimburseSelect.value = '1'
    reimburseSelect.dispatchEvent(new Event('change'))
    await nextTick()
    expect(el.querySelectorAll('.table-row').length).toBe(1)

    // Reimbursed (2)
    reimburseSelect.value = '2'
    reimburseSelect.dispatchEvent(new Event('change'))
    await nextTick()
    expect(el.querySelectorAll('.table-row').length).toBe(1)

    // No Reimbursement (0)
    reimburseSelect.value = '0'
    reimburseSelect.dispatchEvent(new Event('change'))
    await nextTick()
    expect(el.querySelectorAll('.table-row').length).toBe(1)

    // All
    reimburseSelect.value = ''
    reimburseSelect.dispatchEvent(new Event('change'))
    await nextTick()
    expect(el.querySelectorAll('.table-row').length).toBe(3)

    app.unmount()
  })
})



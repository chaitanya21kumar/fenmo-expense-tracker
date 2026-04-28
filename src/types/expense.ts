export interface Expense {
  id: string
  amount: string       // decimal string, e.g. "150.00"
  category: string
  description: string
  date: string         // YYYY-MM-DD
  createdAt: string    // ISO string
}

export interface ExpensesResponse {
  expenses: Expense[]
  total: string
  count: number
}
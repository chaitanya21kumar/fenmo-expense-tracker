'use client'

import { Expense } from '@/types/expense'

interface ExpenseListProps {
  expenses: Expense[]
  total: string
  isLoading: boolean
  isError: boolean
}

export default function ExpenseList({ expenses, total, isLoading, isError }: ExpenseListProps) {
  if (isError) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="text-center py-8">
          <p className="text-red-500 text-sm">Failed to load expenses. Please refresh the page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Expenses</h2>
        <div className="text-right">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
          <p className="text-xl font-bold text-blue-600">₹{total}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse h-16 bg-gray-100 rounded-lg" />
          ))}
        </div>
      ) : expenses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-sm">No expenses yet. Add one above.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
                <th className="pb-2 text-left font-medium">Date</th>
                <th className="pb-2 text-left font-medium">Category</th>
                <th className="pb-2 text-left font-medium">Description</th>
                <th className="pb-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">
                    {new Date(expense.date + 'T00:00:00').toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-3 pr-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {expense.category}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-gray-700 max-w-xs truncate">
                    {expense.description}
                  </td>
                  <td className="py-3 text-right font-medium text-gray-900">
                    ₹{expense.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
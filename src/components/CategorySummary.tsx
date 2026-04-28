'use client'

import { Expense } from '@/types/expense'

// Note: This runs client-side, so we import pure functions only

interface CategorySummaryProps {
  expenses: Expense[]
}

export default function CategorySummary({ expenses }: CategorySummaryProps) {
  if (expenses.length === 0) return null

  // Group and sum by category (client-side from the already-fetched data)
  const byCategory: Record<string, number> = {}
  for (const exp of expenses) {
    const paise = Math.round(parseFloat(exp.amount) * 100)
    byCategory[exp.category] = (byCategory[exp.category] ?? 0) + paise
  }

  const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1])

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">By Category</h2>
      <div className="space-y-2">
        {sorted.map(([cat, totalPaise]) => {
          const rupees = (totalPaise / 100).toFixed(2)
          const total = expenses.reduce((s, e) => s + Math.round(parseFloat(e.amount) * 100), 0)
          const pct = total > 0 ? Math.round((totalPaise / total) * 100) : 0
          return (
            <div key={cat} className="flex items-center gap-3">
              <span className="text-sm text-gray-700 w-28 truncate">{cat}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900 w-24 text-right">
                ₹{rupees}
              </span>
              <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
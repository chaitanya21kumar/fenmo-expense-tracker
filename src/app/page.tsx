'use client'

import { useState, useCallback, useEffect } from 'react'
import ExpenseForm from '@/components/ExpenseForm'
import ExpenseList from '@/components/ExpenseList'
import FilterBar from '@/components/FilterBar'
import CategorySummary from '@/components/CategorySummary'
import { useExpenses } from '@/hooks/useExpenses'

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortOrder, setSortOrder] = useState('date_desc')
  const [allCategories, setAllCategories] = useState<string[]>([])

  const { expenses, total, isLoading, isError, mutate } = useExpenses(
    selectedCategory || undefined,
    sortOrder || undefined
  )

  // Keep a list of all known categories (from unfiltered data)
  const { expenses: allExpenses } = useExpenses()
  useEffect(() => {
    const cats = Array.from(new Set(allExpenses.map((e) => e.category))).sort()
    setAllCategories(cats)
  }, [allExpenses])

  const handleSuccess = useCallback(() => {
    mutate()
  }, [mutate])

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">
            💰 Expense Tracker
          </h1>
          <p className="text-sm text-gray-500">Track where your money goes</p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left column: form */}
          <div className="lg:col-span-1">
            <ExpenseForm onSuccess={handleSuccess} categories={allCategories} />
          </div>

          {/* Right column: list + filters */}
          <div className="lg:col-span-2 space-y-4">
            <FilterBar
              categories={allCategories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              sortOrder={sortOrder}
              onSortChange={setSortOrder}
            />
            <ExpenseList
              expenses={expenses}
              total={total}
              isLoading={isLoading}
              isError={isError}
            />
          </div>
        </div>

        {/* Category breakdown — always uses all expenses */}
        <CategorySummary expenses={allExpenses} />
      </div>
    </main>
  )
}
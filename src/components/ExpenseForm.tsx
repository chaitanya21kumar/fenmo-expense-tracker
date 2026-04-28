'use client'

import { useState, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'

interface ExpenseFormProps {
  onSuccess: () => void
  categories: string[]
}

interface FormErrors {
  amount?: string
  category?: string
  description?: string
  date?: string
  general?: string
}

const PRESET_CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Health', 'Shopping', 'Utilities', 'Other']

export default function ExpenseForm({ onSuccess, categories }: ExpenseFormProps) {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [customCategory, setCustomCategory] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Idempotency key is generated once per form "session" and reused on retries
  const idempotencyKeyRef = useRef(uuidv4())

  const allCategories = Array.from(new Set(PRESET_CATEGORIES.concat(categories)))
  const effectiveCategory = category === '__custom__' ? customCategory : category

  function validate(): FormErrors {
    const errs: FormErrors = {}
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      errs.amount = 'Amount must be a positive number'
    }
    if (amount && !/^\d+(\.\d{1,2})?$/.test(amount)) {
      errs.amount = 'At most 2 decimal places allowed'
    }
    if (!effectiveCategory.trim()) {
      errs.category = 'Category is required'
    }
    if (!description.trim()) {
      errs.description = 'Description is required'
    }
    if (!date) {
      errs.date = 'Date is required'
    }
    return errs
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors({})
    setIsSubmitting(true)
    setSuccessMessage('')

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          category: effectiveCategory.trim(),
          description: description.trim(),
          date,
          idempotencyKey: idempotencyKeyRef.current,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        if (res.status === 422 && data.details) {
          const fieldErrors: FormErrors = {}
          for (const [field, msgs] of Object.entries(data.details)) {
            fieldErrors[field as keyof FormErrors] = (msgs as string[])[0]
          }
          setErrors(fieldErrors)
        } else {
          setErrors({ general: data.error || 'Something went wrong. Please try again.' })
        }
        return
      }

      // Success — reset form and generate new idempotency key for next submission
      setAmount('')
      setCategory('')
      setCustomCategory('')
      setDescription('')
      setDate(new Date().toISOString().split('T')[0])
      idempotencyKeyRef.current = uuidv4()
      setSuccessMessage('Expense added successfully!')
      onSuccess()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch {
      setErrors({ general: 'Network error. Please check your connection and try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Expense</h2>

      {errors.general && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {errors.general}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
          {successMessage}
        </div>
      )}

      <div className="space-y-4">
        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount (₹)
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.amount ? 'border-red-400' : 'border-gray-300'
            }`}
          />
          {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
              errors.category ? 'border-red-400' : 'border-gray-300'
            }`}
          >
            <option value="">Select a category</option>
            {allCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
            <option value="__custom__">+ Add custom category</option>
          </select>
          {category === '__custom__' && (
            <input
              type="text"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="Enter category name"
              className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
          {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What was this for?"
            maxLength={500}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.description ? 'border-red-400' : 'border-gray-300'
            }`}
          />
          {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.date ? 'border-red-400' : 'border-gray-300'
            }`}
          />
          {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Adding...' : 'Add Expense'}
        </button>
      </div>
    </div>
  )
}
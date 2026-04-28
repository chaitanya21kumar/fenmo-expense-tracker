import { describe, it, expect } from 'vitest'
import { createExpenseSchema } from '@/lib/validation'

describe('createExpenseSchema', () => {
  const validInput = {
    amount: '100.00',
    category: 'Food',
    description: 'Lunch',
    date: '2024-01-15',
    idempotencyKey: '550e8400-e29b-41d4-a716-446655440000',
  }

  it('accepts valid input', () => {
    expect(createExpenseSchema.safeParse(validInput).success).toBe(true)
  })

  it('rejects negative amounts', () => {
    const result = createExpenseSchema.safeParse({ ...validInput, amount: '-10' })
    expect(result.success).toBe(false)
  })

  it('rejects amounts with more than two decimal places', () => {
    const result = createExpenseSchema.safeParse({ ...validInput, amount: '10.999' })
    expect(result.success).toBe(false)
  })

  it('rejects amounts too large for integer paise storage', () => {
    const result = createExpenseSchema.safeParse({ ...validInput, amount: '21474836.48' })
    expect(result.success).toBe(false)
  })

  it('rejects zero amount', () => {
    const result = createExpenseSchema.safeParse({ ...validInput, amount: '0' })
    expect(result.success).toBe(false)
  })

  it('rejects missing category', () => {
    const result = createExpenseSchema.safeParse({ ...validInput, category: '' })
    expect(result.success).toBe(false)
  })

  it('rejects whitespace-only category and description', () => {
    expect(createExpenseSchema.safeParse({ ...validInput, category: '   ' }).success).toBe(false)
    expect(createExpenseSchema.safeParse({ ...validInput, description: '   ' }).success).toBe(false)
  })

  it('rejects invalid date format', () => {
    const result = createExpenseSchema.safeParse({ ...validInput, date: '15-01-2024' })
    expect(result.success).toBe(false)
  })

  it('rejects impossible calendar dates', () => {
    const result = createExpenseSchema.safeParse({ ...validInput, date: '2024-02-31' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid idempotency key', () => {
    const result = createExpenseSchema.safeParse({ ...validInput, idempotencyKey: 'not-a-uuid' })
    expect(result.success).toBe(false)
  })
})

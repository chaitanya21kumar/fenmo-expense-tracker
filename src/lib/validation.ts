import { z } from 'zod'

export const MAX_AMOUNT_PAISE = 2_147_483_647
const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/

function isValidDateString(date: string): boolean {
  const parsed = new Date(date + 'T00:00:00.000Z')
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(date)
}

function safeAmountToPaise(amount: string): number | null {
  if (!AMOUNT_PATTERN.test(amount)) return null
  return amountToPaise(amount)
}

export const createExpenseSchema = z.object({
  // amount is in INR (decimal string from user), e.g. "150.50"
  amount: z
    .string()
    .regex(AMOUNT_PATTERN, 'Amount must be a positive number with at most 2 decimal places')
    .refine((val) => {
      const paise = safeAmountToPaise(val)
      return paise !== null && paise > 0
    }, 'Amount must be greater than 0')
    .refine((val) => {
      const paise = safeAmountToPaise(val)
      return paise !== null && paise <= MAX_AMOUNT_PAISE
    }, 'Amount is too large'),
  category: z
    .string()
    .trim()
    .min(1, 'Category is required')
    .max(100, 'Category too long')
    .regex(/[A-Za-z0-9]/, 'Category must include at least one letter or number'),
  description: z
    .string()
    .trim()
    .min(1, 'Description is required')
    .max(500, 'Description too long'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine(isValidDateString, 'Date must be a valid calendar date'),
  idempotencyKey: z
    .string()
    .uuid('Invalid idempotency key'),
})

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>

// Convert INR decimal string to integer paise
export function amountToPaise(amount: string): number {
  const [rupees, paise = '0'] = amount.split('.')
  const total = BigInt(rupees) * BigInt(100) + BigInt(paise.padEnd(2, '0'))
  return Number(total)
}

// Convert integer paise to INR decimal string
export function paiseToAmount(paise: number): string {
  const rupees = Math.floor(paise / 100)
  const remainder = paise % 100
  return `${rupees}.${remainder.toString().padStart(2, '0')}`
}

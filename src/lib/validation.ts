import { z } from 'zod'

export const createExpenseSchema = z.object({
  // amount is in INR (decimal string from user), e.g. "150.50"
  amount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Amount must be a positive number with at most 2 decimal places')
    .refine((val) => parseFloat(val) > 0, 'Amount must be greater than 0'),
  category: z
    .string()
    .min(1, 'Category is required')
    .max(100, 'Category too long')
    .trim(),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description too long')
    .trim(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  idempotencyKey: z
    .string()
    .uuid('Invalid idempotency key'),
})

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>

// Convert INR decimal string to integer paise
export function amountToPaise(amount: string): number {
  const [rupees, paise = '0'] = amount.split('.')
  return parseInt(rupees) * 100 + parseInt(paise.padEnd(2, '0'))
}

// Convert integer paise to INR decimal string
export function paiseToAmount(paise: number): string {
  const rupees = Math.floor(paise / 100)
  const remainder = paise % 100
  return `${rupees}.${remainder.toString().padStart(2, '0')}`
}
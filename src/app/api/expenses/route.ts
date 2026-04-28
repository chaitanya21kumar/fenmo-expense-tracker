import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createExpenseSchema, amountToPaise, paiseToAmount } from '@/lib/validation'

// Serialize a DB expense record to the API response shape
function serializeExpense(expense: {
  id: string
  amountPaise: number
  category: string
  description: string
  date: Date
  createdAt: Date
  idempotencyKey: string
}) {
  return {
    id: expense.id,
    amount: paiseToAmount(expense.amountPaise),
    category: expense.category,
    description: expense.description,
    date: expense.date.toISOString().split('T')[0],
    createdAt: expense.createdAt.toISOString(),
  }
}

// POST /api/expenses
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createExpenseSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const { amount, category, description, date, idempotencyKey } = parsed.data

    // IDEMPOTENCY: if this key already exists, return the existing record (201 already processed)
    const existing = await prisma.expense.findUnique({
      where: { idempotencyKey },
    })

    if (existing) {
      return NextResponse.json(serializeExpense(existing), { status: 200 })
    }

    const expense = await prisma.expense.create({
      data: {
        amountPaise: amountToPaise(amount),
        category: category.trim(),
        description: description.trim(),
        date: new Date(date + 'T00:00:00.000Z'),
        idempotencyKey,
      },
    })

    return NextResponse.json(serializeExpense(expense), { status: 201 })
  } catch (error) {
    // Handle race condition: two identical requests at the same millisecond
    if (
      error instanceof Error &&
      error.message.includes('Unique constraint')
    ) {
      // Fetch and return the existing record
      const body = await request.json().catch(() => ({}))
      if (body.idempotencyKey) {
        const existing = await prisma.expense.findUnique({
          where: { idempotencyKey: body.idempotencyKey },
        })
        if (existing) return NextResponse.json(serializeExpense(existing), { status: 200 })
      }
    }
    console.error('POST /api/expenses error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/expenses?category=Food&sort=date_desc
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const sort = searchParams.get('sort')

    const expenses = await prisma.expense.findMany({
      where: category
        ? { category: { equals: category, mode: 'insensitive' } }
        : undefined,
      orderBy:
        sort === 'date_desc'
          ? [{ date: 'desc' }, { createdAt: 'desc' }]
          : { createdAt: 'desc' },
    })

    const serialized = expenses.map(serializeExpense)

    // Compute total in paise then convert
    const totalPaise = expenses.reduce((sum, e) => sum + e.amountPaise, 0)

    return NextResponse.json({
      expenses: serialized,
      total: paiseToAmount(totalPaise),
      count: expenses.length,
    })
  } catch (error) {
    console.error('GET /api/expenses error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
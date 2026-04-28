import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    expense: {
      findUnique: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}))

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

import { GET, POST } from '@/app/api/expenses/route'

const expense = {
  id: 'expense_1',
  amountPaise: 12345,
  category: 'Food',
  description: 'Lunch',
  date: new Date('2026-04-28T00:00:00.000Z'),
  createdAt: new Date('2026-04-28T13:00:00.000Z'),
  idempotencyKey: '550e8400-e29b-41d4-a716-446655440000',
}

function request(url: string, init?: RequestInit): NextRequest {
  return new Request(url, init) as NextRequest
}

describe('expenses API route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns an existing expense when a retry races with the initial create', async () => {
    mockPrisma.expense.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(expense)
    mockPrisma.expense.create.mockRejectedValueOnce(
      new Error('Unique constraint failed on the fields: (`idempotencyKey`)')
    )

    const response = await POST(
      request('https://example.com/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: '123.45',
          category: 'Food',
          description: 'Lunch',
          date: '2026-04-28',
          idempotencyKey: expense.idempotencyKey,
        }),
      })
    )

    await expect(response.json()).resolves.toMatchObject({
      id: expense.id,
      amount: '123.45',
    })
    expect(response.status).toBe(200)
    expect(mockPrisma.expense.findUnique).toHaveBeenCalledTimes(2)
  })

  it('filters, sorts, and totals the returned expense list', async () => {
    mockPrisma.expense.findMany.mockResolvedValueOnce([
      expense,
      { ...expense, id: 'expense_2', amountPaise: 55, description: 'Snack' },
    ])

    const response = await GET(
      request('https://example.com/expenses?category=Food&sort=date_desc')
    )

    await expect(response.json()).resolves.toMatchObject({
      count: 2,
      total: '124.00',
      expenses: [
        { id: 'expense_1', amount: '123.45' },
        { id: 'expense_2', amount: '0.55' },
      ],
    })
    expect(mockPrisma.expense.findMany).toHaveBeenCalledWith({
      where: { category: { equals: 'Food', mode: 'insensitive' } },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    })
  })
})

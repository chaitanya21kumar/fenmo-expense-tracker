# Expense Tracker

A minimal, production-quality personal expense tracking tool built for 
the Fenmo SDE Technical Assessment.

**Live Demo:** https://fenmo-pb7aewgj0-chaitanya-kumars-projects-f0d80eb2.vercel.app  
**Repository:** https://github.com/chaitanya21kumar/fenmo-expense-tracker

## Features
- Add expenses with amount, category, description, and date
- View all expenses sorted by newest first
- Filter expenses by category
- See total amount for the currently visible list
- Category breakdown with percentage summary
- Handles duplicate submissions via idempotency keys
- Graceful error and loading states
- Works correctly after page refresh and on slow networks

## Tech Stack
| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 14 (App Router) | Full-stack, Vercel-native, no separate server needed |
| Language | TypeScript | Type safety reduces bugs in money/data handling |
| Database | Neon Postgres via Prisma | Serverless-compatible, ACID transactions, free tier |
| Validation | Zod | Schema-first validation with good error messages |
| Data Fetching | SWR | Automatic revalidation, deduplication, stale-while-revalidate |
| Styling | Tailwind CSS | Fast, consistent, no CSS file bloat |
| Tests | Vitest | Fast, Jest-compatible, works without config in Next.js |

## Getting Started

```bash
git clone https://github.com/chaitanya21kumar/fenmo-expense-tracker
cd fenmo-expense-tracker
npm install
cp .env.example .env
# Fill in your Neon database URLs in .env
npx prisma migrate deploy
npm run dev
```

## API Reference

### `POST /api/expenses`
Creates a new expense. **Idempotent** — safe to retry on network failure.

```json
{
  "amount": "150.50",
  "category": "Food",
  "description": "Lunch",
  "date": "2026-04-28",
  "idempotencyKey": "uuid-v4-generated-client-side"
}
```

Returns `201` on creation, `200` if the same idempotency key already exists.

### `GET /api/expenses?category=Food&sort=date_desc`
Returns filtered and sorted expense list with total.

```json
{
  "expenses": [...],
  "total": "1250.00",
  "count": 8
}
```

## Key Design Decisions

### Money as Integer Paise
Amounts are stored as `INT` in the database representing paise 
(₹1 = 100 paise). This completely avoids IEEE 754 floating-point 
rounding errors — the same approach used by Stripe and PayPal. 
The API accepts and returns human-readable decimal strings.

### Idempotency
Each form submission generates a UUID before the first network request.
The same key is reused on all retries. The backend enforces a unique 
constraint on `idempotencyKey`, so clicking submit 10 times only creates 
one expense. A new key is generated only after confirmed success.

### Serverless-Compatible Database
SQLite was ruled out because Vercel's serverless functions have no 
writable filesystem. Neon Postgres provides a free serverless Postgres 
instance with connection pooling that is purpose-built for this pattern.

## Trade-offs Made Due to Timebox
- No authentication (all expenses are global — single user assumed)
- No pagination (acceptable for personal use with small datasets)
- No expense editing or deletion
- No optimistic UI updates (correctness prioritized over perceived speed)

## What I Did Not Do (intentionally)
- Multi-user support / auth
- CSV export
- Budget alerts
- Mobile app

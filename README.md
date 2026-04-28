# Expense Tracker — Fenmo SDE Technical Assessment

A minimal, production-quality full-stack expense tracker.

## Live Demo
[https://fenmo-pied.vercel.app](https://fenmo-pied.vercel.app)
[Deployed on Vercel →](https://fenmo-expense-tracker.vercel.app)

## Tech Stack
- **Framework**: Next.js 14 (App Router) with TypeScript
- **Database**: Neon Postgres (serverless) via Prisma ORM
- **Styling**: Tailwind CSS
- **Data Fetching**: SWR (stale-while-revalidate)
- **Validation**: Zod
- **Testing**: Vitest + Testing Library
- **Hosting**: Vercel

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Fill in your Neon database URLs

# 3. Run database migrations
npx prisma migrate dev

# 4. Start the dev server
npm run dev

# 5. Run tests
npm test
```

## API

### `POST /api/expenses`
Creates a new expense. Idempotent — safe to retry.

**Request body:**
```json
{
  "amount": "150.00",
  "category": "Food",
  "description": "Lunch at cafe",
  "date": "2024-01-15",
  "idempotencyKey": "<uuid-v4>"
}
```

### `GET /api/expenses`
Returns expense list with total.

**Query params:**
- `?category=Food` — filter by category
- `?sort=date_desc` — sort newest first

## Key Design Decisions

### Money Handling
Amounts are stored as integer paise (1 INR = 100 paise) in the database to
completely avoid IEEE 754 floating-point rounding issues. The API accepts and
returns decimal strings (e.g., "150.50"). This is the same approach used by
Stripe, PayPal, and most serious financial systems.

### Idempotency
Each form submission generates a UUID `idempotencyKey` before the first attempt.
The same key is reused on retries (page refresh, double-click, network retry).
The backend has a unique constraint on `idempotencyKey`, so duplicate submissions
are silently deduplicated — the existing record is returned without creating a
duplicate. The key is regenerated only after a successful submission.

### Persistence
Neon Postgres was chosen over SQLite because Vercel's serverless functions don't
have a writable filesystem. Neon provides a free serverless Postgres instance with
connection pooling — it fits this use case perfectly and would scale in production.

### Data Fetching
SWR is used for client-side fetching with automatic revalidation on window focus,
meaning the list updates automatically when you switch back to the tab after adding
an expense elsewhere.

## Trade-offs (timebox)

- **No authentication**: Not in scope for this assessment; in production, all routes
  would be behind session-based auth.
- **No pagination**: With small datasets this is fine; would add cursor-based pagination
  for production with large expense histories.
- **No optimistic updates**: Kept the data flow simple and correct; could add optimistic
  UI updates for snappier feel.
- **Category management**: Categories are inferred from existing data; a dedicated
  `Category` table would be cleaner for production.

## Intentionally Not Done
- User authentication / multi-user support
- Expense editing or deletion
- Data export (CSV/PDF)
- Push notifications or budgets
- Pagination

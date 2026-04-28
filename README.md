# Expense Tracker

A production-minded full-stack expense tracker built for the Fenmo SDE Technical Assessment.

**Live Demo:** https://fenmo-pied.vercel.app  
**Repository:** https://github.com/chaitanya21kumar/fenmo-expense-tracker

## What It Does

This app lets a user record personal expenses and review where their money is going. It is intentionally small, but it handles the real-world cases called out in the assignment: retries, duplicate clicks, refreshes, slow requests, validation failures, and persistent storage.

## Assignment Coverage

| Requirement | Status | Implementation |
|---|---:|---|
| Create expense with amount, category, description, date | Done | Add Expense form + `POST /expenses` |
| View expenses | Done | Expense table backed by persisted Neon Postgres data |
| Filter by category | Done | Category dropdown + `category` query parameter |
| Sort by date newest first | Done | Default UI sort + `sort=date_desc` query parameter |
| Show current-list total | Done | API returns total for the filtered list; UI displays `Total: ₹X` |
| Correct retries / duplicate submits | Done | Client idempotency key + unique DB constraint |
| Basic validation | Done | Shared validation rules with Zod and focused UI errors |
| Summary view | Done | Category totals and percentages |
| Loading and error states | Done | Skeleton rows, submit state, network/API error messages |
| Automated tests | Done | Money conversion and validation tests with Vitest |

## Features

- Add expenses with amount, category, description, and date.
- View all expenses in a table sorted newest first.
- Filter the visible list by category.
- See the total amount for the currently visible list.
- Review category totals with percentage breakdowns.
- Use a custom category when the presets do not fit.
- Retry submissions safely without creating duplicates.
- Keep data after refresh because expenses are persisted in Postgres.
- See clear loading, success, validation, and failure states.

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 14 App Router | Full-stack React app with serverless API routes and Vercel-native deployment |
| Language | TypeScript | Safer data handling across UI, API, and persistence |
| Database | Neon Postgres | Durable hosted relational storage that works with serverless deployments |
| ORM | Prisma | Clear schema, typed model access, and unique constraints for correctness |
| Validation | Zod | Schema-first request validation with readable field errors |
| Data fetching | SWR | Stale-while-revalidate behavior, request deduping, and refresh-friendly UX |
| Styling | Tailwind CSS | Small, consistent UI without extra CSS surface area |
| Tests | Vitest | Fast unit tests for money conversion and validation rules |
| Deployment | Vercel | Simple production deployment for a Next.js app |

## API Reference

The assessment asks for `/expenses`. This app supports that path, and also keeps `/api/expenses` as a Next.js-compatible internal alias.

### `POST /expenses`

Creates a new expense. The request is idempotent when the same `idempotencyKey` is reused.

```json
{
  "amount": "150.50",
  "category": "Food",
  "description": "Lunch",
  "date": "2026-04-28",
  "idempotencyKey": "uuid-v4-generated-client-side"
}
```

Responses:

- `201 Created` when a new expense is inserted.
- `200 OK` when the same idempotency key already exists.
- `422 Unprocessable Entity` when validation fails.
- `500 Internal Server Error` for unexpected server failures.

Example response:

```json
{
  "id": "cmoin3cpo0000i704n2vvhbim",
  "amount": "150.50",
  "category": "Food",
  "description": "Lunch",
  "date": "2026-04-28",
  "createdAt": "2026-04-28T13:06:04.957Z"
}
```

### `GET /expenses`

Returns expenses plus the total for the returned list.

Supported query parameters:

| Parameter | Example | Behavior |
|---|---|---|
| `category` | `Food` | Case-insensitive category filter |
| `sort` | `date_desc` | Sorts by expense date newest first, then creation time |

Example:

```http
GET /expenses?category=Food&sort=date_desc
```

```json
{
  "expenses": [
    {
      "id": "cmoin3cpo0000i704n2vvhbim",
      "amount": "150.50",
      "category": "Food",
      "description": "Lunch",
      "date": "2026-04-28",
      "createdAt": "2026-04-28T13:06:04.957Z"
    }
  ],
  "total": "150.50",
  "count": 1
}
```

## Data Model

The Prisma model is deliberately small:

| Field | Purpose |
|---|---|
| `id` | Stable unique identifier |
| `amountPaise` | Integer money storage |
| `category` | Filterable category label |
| `description` | User-entered expense detail |
| `date` | Expense date, stored as a database date |
| `createdAt` | Creation timestamp |
| `idempotencyKey` | Unique retry-safety key |

## Key Design Decisions

### Money Is Stored as Integer Paise

The API accepts human-readable decimal strings like `"150.50"`, but the database stores `15050` paise. This avoids floating-point rounding bugs and keeps totals exact.

### Idempotent Create Requests

The frontend generates a UUID before the first submission attempt and reuses it for retries. The backend checks `idempotencyKey` before creating a row, and the database also enforces uniqueness. If a user double-clicks submit or retries after a network failure, only one expense is created.

### Postgres Instead of Local Files

The live app runs on Vercel serverless functions, where local writable files are not a durable persistence mechanism. Neon Postgres gives the app durable storage, ACID guarantees, unique constraints, and a production-like deployment path.

### Server-Computed Totals

The API returns the total for the current filtered result set. The UI displays that value directly, so the visible list and total stay consistent.

### Small UI, Clear States

The interface stays intentionally simple: form, filters, table, total, and category summary. The extra effort went into correctness and user feedback rather than broad feature scope.

## Reliability and Edge Cases

- Negative, zero, malformed, and over-precision amounts are rejected.
- Empty category, description, and date values are rejected.
- Slow list loads show skeleton rows.
- Failed list loads show a clear refreshable error.
- Failed submissions keep the same idempotency key so retrying remains safe.
- Successful submissions reset the form and generate a new idempotency key.
- Category filtering is case-insensitive.
- Date sorting uses expense date first and creation time second for stable ordering.

## Local Setup

```bash
git clone https://github.com/chaitanya21kumar/fenmo-expense-tracker
cd fenmo-expense-tracker
npm install
cp .env.example .env
# Fill in DATABASE_URL and DIRECT_URL with Neon Postgres URLs.
npx prisma migrate deploy
npm run dev
```

Open http://localhost:3000.

## Environment Variables

```bash
DATABASE_URL="postgresql://USER:PASSWORD@POOLER_HOST/neondb?sslmode=require"
DIRECT_URL="postgresql://USER:PASSWORD@DIRECT_HOST/neondb?sslmode=require"
```

`.env` is intentionally ignored and should never be committed.

## Scripts

```bash
npm run dev      # Start local development server
npm run build    # Production build
npm run start    # Start built app
npm test         # Run Vitest tests
```

## Testing

The current automated tests cover:

- INR decimal string to paise conversion.
- Paise to display amount conversion.
- Valid expense payloads.
- Invalid amount, category, description, date, and idempotency payloads.

These are the highest-value pure functions for this timebox because money conversion and validation mistakes create the most visible correctness issues.

## Trade-offs Made Due to Timebox

- No authentication; the app assumes a single shared user.
- No pagination; acceptable for a small personal tracker.
- No edit/delete flow; creation and review were prioritized.
- No optimistic UI; confirmed persistence is favored over perceived speed.
- No full integration test suite; core validation and money behavior are unit-tested.

## Intentionally Not Included

- Multi-user accounts.
- CSV import/export.
- Budget alerts.
- Recurring expenses.
- Mobile native app.

## Security Note

Secrets are kept out of the repository. Production database credentials are configured through Vercel environment variables, and local credentials belong only in `.env`.

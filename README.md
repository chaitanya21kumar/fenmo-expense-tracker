<div align="center">

# 💸 Expense Tracker

### A production-minded full-stack expense tracker — built for the Fenmo SDE Technical Assessment

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-fenmo--pied.vercel.app-6366f1?style=for-the-badge)](https://fenmo-pied.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-24292e?style=for-the-badge&logo=github)](https://github.com/chaitanya21kumar/fenmo-expense-tracker)

![Next.js](https://img.shields.io/badge/Next.js_14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white)
![Postgres](https://img.shields.io/badge/Neon_Postgres-00e699?style=flat-square&logo=postgresql&logoColor=black)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-black?style=flat-square&logo=vercel)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=flat-square&logo=vitest&logoColor=white)

</div>

---

## ✨ What It Does

This app lets a user record personal expenses and review where their money is going. It is intentionally focused but handles the real-world cases that matter: **retries, duplicate clicks, refreshes, slow requests, validation failures, and persistent storage.**

---

## ✅ Assignment Coverage

| Requirement | Status | Implementation |
|---|:---:|---|
| Create expense with amount, category, description, date | ✅ | Add Expense form + `POST /expenses` |
| View expenses | ✅ | Expense table backed by persisted Neon Postgres data |
| Filter by category | ✅ | Category dropdown + `category` query parameter |
| Sort by date newest first | ✅ | Default UI sort + `sort=date_desc` query parameter |
| Show current-list total | ✅ | API returns total for the filtered list; UI displays `Total: ₹X` |
| Correct retries / duplicate submits | ✅ | Client idempotency key + unique DB constraint |
| Basic validation | ✅ | Shared validation rules with Zod and focused UI errors |
| Summary view | ✅ | Category totals and percentages |
| Loading and error states | ✅ | Skeleton rows, submit state, network/API error messages |
| Automated tests | ✅ | Money, validation, and API route behavior tests with Vitest |

---

## 🏗️ Architecture

```mermaid
graph TD
    User(["👤 User (Browser)"])

    subgraph Frontend ["⚛️ Next.js 14 — App Router"]
        Form["📝 Add Expense Form\n(UUID idempotency key)"]
        Table["📋 Expense Table\n(SWR · skeleton · error states)"]
        Summary["📊 Category Summary\n(totals & percentages)"]
        Filters["🔽 Filters\n(category · sort)"]
    end

    subgraph API ["🔌 API Routes"]
        POST["POST /expenses\n(create · idempotency check)"]
        GET["GET /expenses\n(filter · sort · total)"]
    end

    subgraph Validation ["🛡️ Validation (Zod)"]
        Schema["Shared Schema\n(amount · category · date · description)"]
    end

    subgraph DB ["🗄️ Neon Postgres (Prisma ORM)"]
        Expense["Expense Table\n(amountPaise · idempotencyKey UNIQUE)"]
    end

    User --> Form
    User --> Filters
    Form -->|"POST /expenses"| POST
    Filters --> Table
    Table -->|"GET /expenses?category&sort"| GET
    Summary -->|"GET /expenses"| GET
    POST --> Schema
    GET --> DB
    Schema -->|"valid"| DB
    DB --> Expense
```

---

## 🔄 Request Lifecycle & Idempotency

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant C as ⚛️ Client
    participant A as 🔌 API
    participant D as 🗄️ DB

    U->>C: Click "Add Expense"
    C->>C: Generate UUID (idempotencyKey)
    C->>A: POST /expenses {amount, category, ..., idempotencyKey}
    A->>A: Validate with Zod

    alt Validation fails
        A-->>C: 422 Unprocessable Entity + field errors
        C-->>U: Show focused error messages
    else Valid request
        A->>D: INSERT (check idempotencyKey unique)
        alt New expense
            D-->>A: 201 Created
            A-->>C: Return expense object
            C->>C: Reset form + new UUID
            C-->>U: ✅ Success
        else Duplicate (retry/double-click)
            D-->>A: 200 OK (existing row)
            A-->>C: Return existing expense
            C-->>U: ✅ Safe — no duplicate created
        end
    end

    Note over C,A: Same UUID reused on retry — always safe
```

---

## 🗃️ Data Model

```mermaid
erDiagram
    EXPENSE {
        string  id              PK  "Stable CUID"
        int     amountPaise         "Integer paise (no floats)"
        string  category            "Filterable label"
        string  description         "User detail"
        date    date                "Expense date"
        datetime createdAt          "Creation timestamp"
        string  idempotencyKey  UK  "Retry-safety (UNIQUE)"
    }
```

> **Why paise?** The API accepts `"150.50"` but stores `15050` as an integer — eliminating floating-point rounding bugs and keeping totals exact.

---

## 🚀 Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| **Framework** | Next.js 14 App Router | Full-stack React with serverless API routes and Vercel-native deployment |
| **Language** | TypeScript | Safer data handling across UI, API, and persistence |
| **Database** | Neon Postgres | Durable hosted relational storage compatible with serverless |
| **ORM** | Prisma | Clear schema, typed model access, and unique constraints for correctness |
| **Validation** | Zod | Schema-first validation with readable field errors |
| **Data Fetching** | SWR | Stale-while-revalidate, request deduping, refresh-friendly UX |
| **Styling** | Tailwind CSS | Consistent UI with minimal CSS surface area |
| **Tests** | Vitest | Fast unit tests for money conversion and validation rules |
| **Deployment** | Vercel | Zero-config production deployment for Next.js |

---

## 📡 API Reference

> The assessment asks for `/expenses` — the frontend calls `/expenses` directly. `/api/expenses` is also available as a Next.js-compatible alias.

### `POST /expenses` — Create an expense

```http
POST /expenses
Content-Type: application/json

{
  "amount": "150.50",
  "category": "Food",
  "description": "Lunch",
  "date": "2026-04-28",
  "idempotencyKey": "uuid-v4-generated-client-side"
}
```

| Status | Meaning |
|---|---|
| `201 Created` | New expense inserted |
| `200 OK` | Same idempotency key already exists — safe retry |
| `422 Unprocessable Entity` | Validation failure with field errors |
| `500 Internal Server Error` | Unexpected server failure |

**Example response:**
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

---

### `GET /expenses` — List expenses

| Parameter | Example | Behavior |
|---|---|---|
| `category` | `Food` | Case-insensitive category filter |
| `sort` | `date_desc` | Sort by expense date newest first, then creation time |

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

> **Note:** The total is always server-computed for the filtered result set — the visible list and total are always in sync.

---

## 🧪 Testing

Automated tests cover the highest-risk behavior for the assignment:

```
✓ INR decimal string → paise conversion
✓ Paise → display amount conversion
✓ Valid expense payloads
✓ Invalid amount, category, description, date, idempotency payloads
✓ API idempotency behavior when a retry races with the initial create
✓ API filtering, date sorting, and current-list total calculation
```

```bash
npm test   # Run Vitest suite
```

---

## 🛡️ Reliability & Edge Cases

| Scenario | Handling |
|---|---|
| Negative / zero / malformed amounts | Rejected by Zod validation |
| Over-precision or out-of-range amounts | Rejected before DB insert |
| Empty / whitespace fields | Rejected at schema level |
| Impossible dates (e.g. `2024-02-31`) | Rejected by date validator |
| Slow list loads | Skeleton rows shown |
| Failed list loads | Clear refreshable error state |
| Failed submissions | Idempotency key preserved — retry is safe |
| Successful submissions | Form resets with a new idempotency key |
| Double-click / network retry | Only one expense ever created |
| Category filtering | Case-insensitive match |
| Date sort stability | Expense date first, creation time second |

---

## 🔑 Key Design Decisions

### 💰 Money Stored as Integer Paise
The API accepts human-readable decimal strings like `"150.50"`, but the database stores `15050` as an integer. This eliminates floating-point rounding bugs and keeps totals exact.

### 🔁 Idempotent Create Requests
The frontend generates a UUID before the first submission and reuses it for retries. The backend enforces uniqueness via a DB constraint. Double-clicks and network retries are safe — only one expense is ever created, even under a race condition.

### 🗄️ Postgres over Local Files
The live app runs on Vercel serverless functions where local writable files aren't durable. Neon Postgres provides ACID guarantees, unique constraints, and a production-grade deployment path.

### ⚡ Server-Computed Totals
The API returns the total for the current filtered result set. The UI displays that value directly — the visible list and the total stay consistent by design.

---

## ⚙️ Local Setup

```bash
git clone https://github.com/chaitanya21kumar/fenmo-expense-tracker
cd fenmo-expense-tracker
npm install
cp .env.example .env
# Fill in DATABASE_URL and DIRECT_URL with your Neon Postgres URLs
npx prisma migrate deploy
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

```bash
DATABASE_URL="postgresql://USER:PASSWORD@POOLER_HOST/neondb?sslmode=require"
DIRECT_URL="postgresql://USER:PASSWORD@DIRECT_HOST/neondb?sslmode=require"
```

> `.env` is gitignored and should never be committed. Production credentials are configured through Vercel environment variables.

### Scripts

```bash
npm run dev    # Start local development server
npm run build  # Production build
npm run start  # Start built app
npm test       # Run Vitest tests
```

---

## ⚖️ Trade-offs (Timebox Decisions)

| Trade-off | Reason |
|---|---|
| No authentication | Single shared user assumed for scope |
| No pagination | Acceptable for a personal tracker at this scale |
| No edit / delete | Creation and review were prioritized |
| No optimistic UI | Confirmed persistence favored over perceived speed |
| No browser E2E suite | Highest-risk logic covered with fast unit tests |

---

## 🚫 Intentionally Out of Scope

- Multi-user accounts
- CSV import / export
- Budget alerts
- Recurring expenses
- Mobile native app

---

<div align="center">

Built with precision for the **Fenmo SDE Technical Assessment**

[![Next.js](https://img.shields.io/badge/Next.js-black?style=flat-square&logo=next.js)](https://nextjs.org) [![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com) [![Postgres](https://img.shields.io/badge/Powered_by-Neon_Postgres-00e699?style=flat-square)](https://neon.tech)

</div>

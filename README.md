# nodejs-sql-portfolio

Learning Node.js + SQL with Next.js, Stripe, and Firebase.
This repository is part of my personal portfolio and learning roadmap.

---

## 📌 Week 1 – API Basics

### Implemented Endpoints

* `/api/hello` → Returns a fixed JSON `{ name: "John Doe" }`
* `/api/status` → Returns server status and uptime
* `/api/time` → Returns the current time (ISO + JST)

### Response Format

```json
// success
{ "ok": true, "data": { } }

// error
{ "ok": false, "error": { "code": "...", "message": "..." } }
```

### What I Learned

* How to create API routes in Next.js (`pages/api`)
* How to return JSON with proper status codes (200 / 400 / 500)
* How to use environment variables safely with `.env`
* How to handle basic error responses and debugging

### How to Run

```bash
# install dependencies
npm install

# start development server
npm run dev

# test endpoints
http://localhost:3000/api/hello
http://localhost:3000/api/status
http://localhost:3000/api/time
```

---

## 📌 Week 2 – PostgreSQL + Prisma CRUD

### Implemented Endpoints

* `GET /api/users` → List all users (with paging, limit=100 max)
* `POST /api/users` → Create a new user `{ name, email, ownerId }`
* `GET /api/users/:id` → Get one user by ID
* `PATCH /api/users/:id` → Update user fields `{ name?, email? }`
* `DELETE /api/users/:id` → Delete a user

### What I Learned

* How to connect Next.js API routes with PostgreSQL via Prisma
* How to design RESTful CRUD endpoints with proper RBAC (admin vs user)
* How to validate request bodies with Zod
* How to handle DB errors safely (e.g. Prisma P2002 → 409 Conflict)
* How to unify error responses (400/403/404/409/415/405/500)
* How to structure API folders (`pages/api/users/index.ts`, `[id].ts`)
* Helpers:

    * `lib/result.ts` → ok()/fail()
    * `lib/http.ts` → withJson, error handling
    * `lib/auth.ts` → parse `x-user-id/x-user-role` headers

### Prisma Schema Example

```prisma
model User {
  id      Int    @id @default(autoincrement())
  name    String
  email   String @unique
  ownerId Int
}
```

### Why This Matters

This CRUD demonstrates 7 pillars of practical API development:

* Validation
* RBAC
* Unique constraints
* Unified error format
* Migration & seed
* Logging & error handling
* Manual smoke tests with cURL

---

## 📌 Week 3 – Authentication (NextAuth)

### Implemented Features

* GitHub OAuth login with NextAuth
* Google OAuth login with NextAuth
* Email/Password login with Credentials Provider (bcrypt-hashed password)
* Session management (`/api/auth/session`)
* Protected routes (redirect to `/login` if not authenticated)
* Logout function with `signOut()`

### Example Flows

1. **GitHub/Google Login**

    * User clicks "Sign in with GitHub/Google"
    * NextAuth redirects to provider OAuth
    * On success, NextAuth creates a session with user info
2. **Email/Password Login**

    * User registers with email & password (hashed with bcrypt)
    * On login, credentials are checked and verified
    * Session is issued on success
3. **Protected Route & Logout**

    * `/dashboard` only accessible when authenticated
    * Logout clears the session and redirects to `/login`

### What I Learned

* How to integrate GitHub/Google OAuth with NextAuth
* How to implement secure Email/Password login (bcrypt hashing)
* How NextAuth manages sessions with JWT + httpOnly cookies
* How to protect pages and API routes with `getServerSession`
* How to implement logout securely with `signOut()`

### Why This Matters

Authentication is a must-have for real-world SaaS. With NextAuth + Prisma:

* Users can choose login methods (OAuth or Email/Password)
* Sensitive data stays protected (hashed passwords, secure cookies)
* Sessions and protected routes enable multi-user dashboards
* This sets the foundation for payment integration (Stripe requires authenticated users)

---

## 📌 Week 4 – Stripe One-Time Payment (Checkout + PaymentIntent auto)

### Day22 – Setup & Initial Defense

* **Environment Variables**

    * Split TEST and LIVE keys completely
    * Prevent mistakes with prefix checks (`sk_test_` / `sk_live_`)
* **Library**

    * Created `lib/env.ts` to auto-select correct keys based on APP_ENV
    * Throw error if wrong key prefix is used
* **Ping API**

    * Implemented `/api/stripe/ping` to verify Stripe connectivity
    * Returns `{ ok:true, env:"TEST", account:{id, type} }`
* **Stripe CLI**

    * Installed via `winget install Stripe.StripeCLI`
    * Logged in with `stripe login`
    * Used `stripe listen --forward-to localhost:3000/api/stripe/webhook`
    * Obtained and stored `STRIPE_WEBHOOK_SECRET_TEST=whsec_xxx` in `.env.local`

### What I Learned

* How to safely separate TEST and LIVE Stripe keys
* How to guard against key misuse with startup validation
* How to verify Stripe API connectivity with a test endpoint
* How to use Stripe CLI to forward webhooks locally
* Why webhook signing secrets differ per project and environment

### Why This Matters

* Prevents misusing TEST/LIVE keys during development
* Ensures environment variables are consistent and type-safe
* Provides a reliable way to test webhooks locally before production
* Sets a solid security baseline (Day22 foundation)

---

## 🚀 Tech Stack

* Next.js (App Router + API Routes)
* React + TypeScript
* TailwindCSS
* Prisma ORM
* PostgreSQL (Supabase cloud)
* NextAuth (GitHub, Google, Email/Password)
* Stripe (Checkout, Webhooks, upcoming Subscriptions)
* Firebase (auth + storage, experimental)

---

## 📝 Notes (Japanese Memo)

* Week1: API 基礎 (JSONレスポンス, ステータスコード, .env, エラー処理)
* Week2: PostgreSQL + Prisma CRUD (RBAC, バリデーション, Prismaエラー処理)
* Week3: NextAuth 認証 (OAuth, メール/パスワード, セッション管理)
* Week4: Stripe 一回払い (キー分離, Ping API, CLIでWebhookテスト)

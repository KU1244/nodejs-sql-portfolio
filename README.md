nodejs-sql-portfolio

Learning Node.js + SQL with Next.js, Stripe, and Firebase.
This repository is part of my personal portfolio and learning roadmap.

📌 Week 1 – API Basics
Implemented Endpoints

/api/hello → Returns a fixed JSON { name: "John Doe" }

/api/status → Returns server status and uptime

/api/time → Returns the current time (ISO + JST)

Response Format
// success
{ "ok": true, "data": { ... } }

// error
{ "ok": false, "error": { "code": "...", "message": "..." } }

What I Learned

How to create API routes in Next.js (pages/api)

How to return JSON with proper status codes (200 / 400 / 500)

How to use environment variables safely with .env

How to handle basic error responses and debugging

How to Run
# install dependencies
npm install

# start development server
npm run dev

# test endpoints
http://localhost:3000/api/hello
http://localhost:3000/api/status
http://localhost:3000/api/time

📌 Week 2 – PostgreSQL + Prisma CRUD
Implemented Endpoints

GET /api/users → List all users (with paging, limit=100 max)

POST /api/users → Create a new user { name, email, ownerId }

GET /api/users/:id → Get one user by ID

PATCH /api/users/:id → Update user fields { name?, email? }

DELETE /api/users/:id → Delete a user

Example cURL Requests
# Create (ADMIN with x-user-id header)
curl -X POST http://localhost:3000/api/users \
-H "Content-Type: application/json" \
-H "x-user-id: 1" -H "x-user-role: ADMIN" \
-d '{"name":"Taro","email":"taro@example.com","ownerId":1}'

# List
curl http://localhost:3000/api/users -H "x-user-id: 1" -H "x-user-role: ADMIN"

# Get by ID
curl http://localhost:3000/api/users/1 -H "x-user-id: 1" -H "x-user-role: ADMIN"

# Update
curl -X PATCH http://localhost:3000/api/users/1 \
-H "Content-Type: application/json" \
-H "x-user-id: 1" -H "x-user-role: ADMIN" \
-d '{"name":"Taro Yamada"}'

# Delete (403 if USER tries someone else's record)
curl -X DELETE http://localhost:3000/api/users/1 \
-H "x-user-id: 2" -H "x-user-role: USER"

What I Learned

How to connect Next.js API routes with PostgreSQL via Prisma

How to design RESTful CRUD endpoints with proper RBAC (admin vs user)

How to validate request bodies with Zod (name, email, ownerId)

How to handle DB errors safely (e.g. Prisma P2002 → 409 Conflict)

How to unify error responses (400 Bad Request, 403 Forbidden, 404 Not Found, 409 Conflict, 415 Unsupported, 405 Method Not Allowed, 500 Internal Error)

How to structure API folders (pages/api/users/index.ts, pages/api/users/[id].ts)

How to add common helpers:

lib/result.ts → ok()/fail() response helpers

lib/http.ts → withJson (405/415/500 handling, request-id logging)

lib/auth.ts → parse x-user-id/x-user-role headers

Prisma Schema
model User {
id      Int    @id @default(autoincrement())
name    String
email   String @unique
ownerId Int
}

Why This Matters

This CRUD is not just a demo — it demonstrates 7 pillars of practical API development:

Validation (Zod schemas)

RBAC (admin vs self-only)

Unique constraints (email @unique, handled as 409)

Unified error format (ok:true/false)

Migration & Seed with Prisma

Logging & error handling (try/catch, request-id)

Test coverage (manual curl smoke tests for 200/201/400/403/409)

📌 Next Steps (Week 3+)

Add unit tests (Vitest + Supertest) for CRUD endpoints

Deploy to Vercel with hosted PostgreSQL (Supabase / Neon)

Integrate Stripe checkout for payments

Use Firebase or Auth.js for authentication and sessions

Extend CRUD with relations (e.g. Posts, Subscriptions)
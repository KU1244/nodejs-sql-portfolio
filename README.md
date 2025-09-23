# nodejs-sql-portfolio

Learning **Node.js + SQL** with **Next.js**, **Stripe**, and **Firebase**.  
This repository is part of my personal portfolio and learning roadmap.

---

## 📌 Week 1 – API Basics

### Implemented Endpoints
- **`/api/hello`** → Returns a fixed JSON `{ name: "John Doe" }`
- **`/api/status`** → Returns server status and uptime
- **`/api/time`** → Returns the current time (ISO + JST)

All responses follow a consistent JSON format:
```json
// success
{ "ok": true, "data": { ... } }

// error
{ "ok": false, "error": { "message": "...", "code": "..." } }
What I Learned
How to create API routes in Next.js (pages/api)

How to return JSON with proper status codes (200 / 400 / 500)

How to use environment variables safely with .env

How to handle basic error responses and debugging

How to Run
bash
コードをコピーする
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
GET /api/users → List all users

POST /api/users → Create a new user { name, email }

GET /api/users/:id → Get one user by ID

PUT /api/users/:id → Update user fields { name?, email? }

DELETE /api/users/:id → Delete a user

Example cURL Requests
bash
コードをコピーする
# Create
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Taro","email":"taro@example.com"}'

# List
curl http://localhost:3000/api/users

# Get by ID
curl http://localhost:3000/api/users/1

# Update
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Taro Yamada"}'

# Delete
curl -X DELETE http://localhost:3000/api/users/1
What I Learned
How to connect Next.js API routes with PostgreSQL via Prisma

How to design RESTful endpoints for Create / Read / Update / Delete

How to validate request bodies (name, email) before writing to DB

How to handle errors consistently (400 Bad Request, 404 Not Found, 500 Internal Error)

How to structure API folders (pages/api/users/index.ts, pages/api/users/[id].ts)

Prisma Schema
prisma
コードをコピーする
model User {
  id    Int    @id @default(autoincrement())
  name  String
  email String @unique
}
Next Steps (Week 3+)
Add unit tests (Jest) for CRUD endpoints

Deploy to Vercel with a hosted PostgreSQL (e.g., Supabase / Neon)

Integrate Stripe checkout for payments

Use Firebase for authentication and user sessions
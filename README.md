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
Next Steps (Week 2+)
Connect to PostgreSQL and implement /api/users

Add CRUD operations (Create, Read, Update, Delete)

Integrate with Stripe for payments

Explore Firebase for authentication and storage
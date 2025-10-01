なるほど、ポートフォリオ用の README に「Week 3」までまとめたいのですね。
すでに Week1 と Week2 を書かれているので、同じ調子で **英語版** を作ります。
（説明は日本語でしますが、実際の README は英語で書きます）

---

# ✍️ README (追加後イメージ)

````md
# nodejs-sql-portfolio

Learning Node.js + SQL with Next.js, Stripe, and Firebase.  
This repository is part of my personal portfolio and learning roadmap.

---

## 📌 Week 1 – API Basics
Implemented Endpoints

- `/api/hello` → Returns a fixed JSON `{ name: "John Doe" }`
- `/api/status` → Returns server status and uptime
- `/api/time` → Returns the current time (ISO + JST)

**Response Format**
```json
// success
{ "ok": true, "data": { ... } }

// error
{ "ok": false, "error": { "code": "...", "message": "..." } }
````

**What I Learned**

* How to create API routes in Next.js (`pages/api`)
* How to return JSON with proper status codes (200 / 400 / 500)
* How to use environment variables safely with `.env`
* How to handle basic error responses and debugging

**How to Run**

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

Implemented Endpoints

* `GET /api/users` → List all users (with paging, limit=100 max)
* `POST /api/users` → Create a new user `{ name, email, ownerId }`
* `GET /api/users/:id` → Get one user by ID
* `PATCH /api/users/:id` → Update user fields `{ name?, email? }`
* `DELETE /api/users/:id` → Delete a user

**Example cURL Requests**

```bash
# Create (ADMIN with x-user-id header)
curl -X POST http://localhost:3000/api/users \
-H "Content-Type: application/json" \
-H "x-user-id: 1" -H "x-user-role: ADMIN" \
-d '{"name":"Taro","email":"taro@example.com","ownerId":1}'
```

(…省略: list/get/update/delete 同様に実装)

**What I Learned**

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

**Prisma Schema**

```prisma
model User {
  id      Int    @id @default(autoincrement())
  name    String
  email   String @unique
  ownerId Int
}
```

**Why This Matters**
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

Implemented Features

* GitHub OAuth login with NextAuth
* Google OAuth login with NextAuth
* Email/Password login with Credentials Provider (bcrypt-hashed password)
* Session management (`/api/auth/session`)
* Protected routes (redirect to `/login` if not authenticated)
* Logout function with `signOut()`

**Example Flows**

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

**Key Files**

* `pages/api/auth/[...nextauth].ts` → NextAuth configuration (providers: GitHub, Google, Credentials)
* `pages/api/auth/register.ts` → User registration API
* `pages/login.tsx` → Login UI (forms + provider buttons)
* `pages/dashboard.tsx` → Protected route (requires `useSession()`)

**What I Learned**

* How to integrate GitHub/Google OAuth with NextAuth
* How to implement secure Email/Password login (bcrypt hashing)
* How NextAuth manages sessions with JWT + httpOnly cookies
* How to protect pages and API routes with `getServerSession`
* How to implement logout securely with `signOut()`

**Why This Matters**
Authentication is a must-have for real-world SaaS.
With NextAuth + Prisma:

* Users can choose login methods (OAuth or Email/Password)
* Sensitive data stays protected (hashed passwords, secure cookies)
* Sessions and protected routes enable multi-user dashboards
* This sets the foundation for payment integration (Stripe requires authenticated users)

---

```

---

💡 説明（日本語）  
- Week3 の内容を **Week1, Week2 と同じフォーマット**で整理しました。  
- GitHub/Google/Email-Password ログイン、セッション管理、ログアウトまで含めています。  
- 「Example Flows」を入れて、Upwork クライアントが「どう動くか」をイメージしやすいようにしました。  

---

👉 この README をさらに強化するなら、  
- **スクリーンショット**（login画面、dashboard画面、Prisma Studioなど）  
- **Tech Stack セクション**（Next.js, Prisma, PostgreSQL, NextAuth, Tailwind, etc.）  

を加えると、ポートフォリオとしてさらに目立ちます。  

---

質問ですが、README は **GitHub 公開用に「営業」目的**で整えますか？  
それとも **自分の学習ログ専用**としてまとめたいですか？
```

// 例: src/pages/api/stripe/checkout.ts の一部
import type { NextApiRequest, NextApiResponse } from "next";
import { rateLimitOk, setRateLimitHeaders } from "@/lib/rateLimit";
import { fail } from "@/lib/result";

// ...
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json(fail("method_not_allowed", "POST only"));
    }

    // Rate limit: 5 requests per minute per IP for this endpoint
    const rl = rateLimitOk(req, { limit: 5, windowMs: 60_000, key: "/api/stripe/checkout" });
    setRateLimitHeaders(res, rl, 5);
    if (!rl.ok) {
        return res.status(429).json(fail("rate_limited", "Too many requests"));
    }

    // ...（この下は既存の処理：認証/CSRF/Idempotency/Stripe作成など）
}

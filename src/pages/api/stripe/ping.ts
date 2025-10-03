import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { stripe } from "@/lib/stripeClient";
import { ENV } from "@/lib/env";
import { rateLimitOk, setRateLimitHeaders } from "@/lib/rateLimit";

type PingResponse =
    | { ok: true; env: "LIVE" | "TEST"; account: { id: string; type: string | null } }
    | { ok: false; error: string };

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<PingResponse>
) {
  // ✅ ここでレート制限チェック
  const limitInfo = rateLimitOk(req, { limit: 2, windowMs: 10_000 }); // 10秒で2回まで
  setRateLimitHeaders(res, limitInfo, 2);
  if (!limitInfo.ok) {
    res.status(429).json({ ok: false, error: "Too many requests" });
    return;
  }

  try {
    const account: Stripe.Account = await stripe.accounts.retrieve({ expand: ["settings"] });

    res.status(200).json({
      ok: true,
      env: ENV.isLive ? "LIVE" : "TEST",
      account: { id: account.id, type: account.type },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown error";
    res.status(500).json({ ok: false, error: msg });
  }
}

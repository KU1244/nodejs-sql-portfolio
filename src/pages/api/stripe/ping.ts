import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe"; // ← default import（値として使う）
import { stripe } from "@/lib/stripeClient";
import { isLive } from "@/lib/env";

type PingResponse =
    | { ok: true; env: "LIVE" | "TEST"; account: { id: string; type: string | null } }
    | { ok: false; error: string };

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<PingResponse>
) {
  try {
    const account: Stripe.Account = await stripe.accounts.retrieve({ expand: ["settings"] });

    res.status(200).json({
      ok: true,
      env: isLive ? "LIVE" : "TEST",
      account: { id: account.id, type: account.type },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown error";
    res.status(500).json({ ok: false, error: msg });
  }
}

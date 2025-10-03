// src/pages/api/stripe/ping.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { Stripe } from "stripe";
import { stripe, isLive } from "@/lib/env";

// Define response type for better type safety
type PingResponse =
    | {
  ok: true;
  env: "LIVE" | "TEST";
  account: { id: string; type: string | null };
}
    | {
  ok: false;
  error: string;
};

// API handler for Stripe connectivity check
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<PingResponse>
) {
  try {
    // Retrieve Stripe account details
    const account: Stripe.Account = await stripe.accounts.retrieve({
      expand: ["settings"],
    });

    // Return environment info and account summary
    res.status(200).json({
      ok: true,
      env: isLive ? "LIVE" : "TEST",
      account: { id: account.id, type: account.type },
    });
  } catch (e) {
    // Normalize error handling
    const errorMessage = e instanceof Error ? e.message : "unknown error";
    res.status(500).json({ ok: false, error: errorMessage });
  }
}

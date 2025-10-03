// src/lib/env.ts
import Stripe from "stripe";

type AppEnv = "development" | "production" | "preview";

const APP_ENV = (process.env.APP_ENV as AppEnv) || "development";

// pick TEST or LIVE by environment
const isLive = APP_ENV === "production";
const serverKey = isLive
    ? process.env.STRIPE_LIVE_SECRET_KEY
    : process.env.STRIPE_TEST_SECRET_KEY;

if (!serverKey) {
    throw new Error(
        `[env] Missing Stripe secret key for ${isLive ? "LIVE" : "TEST"} environment.`
    );
}

// Safety: ensure correct prefix
if (isLive && !serverKey.startsWith("sk_live_")) {
    throw new Error("[env] LIVE environment requires sk_live_ key.");
}
if (!isLive && !serverKey.startsWith("sk_test_")) {
    throw new Error("[env] TEST/development requires sk_test_ key.");
}

// Client (publishable) key exposure check will be done where needed.
// We keep both and pick at call site when building the client config.
export const publishableKey = isLive
    ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE
    : process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST;

export const stripe = new Stripe(serverKey, {
    apiVersion: "2025-09-30.clover",
});


export { isLive, APP_ENV };

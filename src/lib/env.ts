// src/lib/env.ts
// Centralized helpers for environment variables (no Stripe client here).

type AppEnv = "development" | "production" | "preview";

// Detect current app environment (default: development)
export const APP_ENV: AppEnv = (process.env.APP_ENV as AppEnv) || "development";

// Choose which secret key to use depending on environment
export const isLive = APP_ENV === "production";
const serverKey = isLive
    ? process.env.STRIPE_LIVE_SECRET_KEY
    : process.env.STRIPE_TEST_SECRET_KEY;

// Ensure server-side secret key exists
if (!serverKey) {
    throw new Error(
        `[env] Missing Stripe secret key for ${isLive ? "LIVE" : "TEST"} environment.`
    );
}

// Safety: validate secret key prefix
if (isLive && !serverKey.startsWith("sk_live_")) {
    throw new Error("[env] LIVE environment requires sk_live_ key.");
}
if (!isLive && !serverKey.startsWith("sk_test_")) {
    throw new Error("[env] TEST/development requires sk_test_ key.");
}

// Publishable (client) key. This may be undefined in server-only contexts.
const publishableKey = isLive
    ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE
    : process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST;

// Export as a single object
export const ENV = {
    APP_ENV,
    isLive,
    STRIPE_SECRET_KEY: serverKey as string, // already validated above
    PUBLISHABLE_KEY: publishableKey ?? null,
};

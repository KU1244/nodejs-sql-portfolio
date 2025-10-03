// src/lib/stripeClient.ts
import Stripe from "stripe";
import { ENV } from "@/lib/env";

// Create a single server-side Stripe client instance.
// NOTE: apiVersion must match what the installed SDK expects.
export const stripe = new Stripe(ENV.STRIPE_SECRET_KEY, {
    apiVersion: "2025-09-30.clover",
});

// lib/stripe.ts
import Stripe from "stripe";

// Permitir build sem STRIPE_SECRET_KEY (será necessário em runtime)
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
    })
  : null;

export const STRIPE_PLANS = {
  PREMIUM_MONTHLY: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || "",
  PREMIUM_ANNUAL: process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID || "",
  FEATURED_MONTHLY: process.env.STRIPE_FEATURED_MONTHLY_PRICE_ID || "",
  FEATURED_ANNUAL: process.env.STRIPE_FEATURED_ANNUAL_PRICE_ID || "",
};

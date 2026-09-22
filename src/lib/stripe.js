export async function createCheckoutSession({ items, customer, currency = "PLN" }) {
  const res = await fetch("/api/create-checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items, customer, currency }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Could not start Stripe checkout.");
  return data;
}

export async function verifyCheckoutSession(sessionId) {
  const res = await fetch(`/api/verify-checkout?session_id=${encodeURIComponent(sessionId)}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Could not verify payment.");
  return data;
}

export function isStripeConfigured() {
  return Boolean(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
}

/**
 * Demo mode renders a local Stripe-style payment screen instead of calling
 * Stripe. No card is charged and no Stripe account is needed. Set
 * VITE_STRIPE_DEMO=false once real keys are in place to use live Checkout.
 */
export function isStripeDemoMode() {
  const flag = import.meta.env.VITE_STRIPE_DEMO;
  return String(flag ?? "true").toLowerCase() !== "false";
}

/** Stripe's published test card, safe to show on a demo screen. */
export const DEMO_CARD = {
  number: "4242 4242 4242 4242",
  expiry: "12 / 34",
  cvc: "123",
  name: "Jan Kowalski",
  postcode: "00-001",
  country: "Poland",
};

/** Stripe's published decline card. Demo pay rejects this and leaves stock untouched. */
export const DEMO_DECLINE_CARD = "4000 0000 0000 0002";

export function demoCardApproved(number) {
  const digits = String(number || "").replace(/\s+/g, "");
  return digits === DEMO_CARD.number.replace(/\s+/g, "");
}

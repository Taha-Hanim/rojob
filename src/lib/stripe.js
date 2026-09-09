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

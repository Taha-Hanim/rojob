/**
 * GET /api/verify-session?session_id=cs_...
 * Confirms a Stripe Checkout Session was paid (used on /order-confirmed).
 */
export async function onRequestGet(context) {
  const { request, env } = context;
  const secret = env.STRIPE_SECRET_KEY;
  if (!secret) {
    return json({ error: "Stripe is not configured." }, 503);
  }

  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id");
  if (!sessionId) {
    return json({ error: "session_id required" }, 400);
  }

  const stripeRes = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
    {
      headers: { Authorization: `Bearer ${secret}` },
    }
  );
  const session = await stripeRes.json();
  if (!stripeRes.ok) {
    return json({ error: session.error?.message || "Session lookup failed" }, 502);
  }

  return json({
    id: session.id,
    payment_status: session.payment_status,
    status: session.status,
    customer_email: session.customer_details?.email || session.customer_email,
    amount_total: session.amount_total,
    currency: session.currency,
    orderId: session.metadata?.orderId || null,
    paid: session.payment_status === "paid",
  });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

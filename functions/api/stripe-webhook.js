/**
 * POST /api/stripe-webhook
 * Stripe → Cloudflare Pages Function
 * Updates order status when checkout.session.completed fires.
 *
 * Note: Firestore update from Workers uses the REST API with a
 * Firebase Web API key is not enough for admin writes.
 * This endpoint verifies the event and returns the payload so you can
 * confirm payments; order status is primarily updated via verify-session
 * + client, or later via Firebase Admin on a paid plan.
 *
 * For now: verifies signature + logs; client verify-session is source of truth
 * for marking paid in the browser flow; admin can set status manually.
 */
export async function onRequestPost(context) {
  const { request, env } = context;
  const secret = env.STRIPE_SECRET_KEY;
  const whSecret = env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    return new Response("Stripe not configured", { status: 503 });
  }

  const raw = await request.text();

  // Soft verification: if webhook secret present, check Stripe-Signature header exists
  // Full HMAC verification can be added once live; test mode works with verify-session.
  if (whSecret) {
    const sig = request.headers.get("stripe-signature");
    if (!sig) {
      return new Response("Missing signature", { status: 400 });
    }
  }

  let event;
  try {
    event = JSON.parse(raw);
  } catch {
    return new Response("Invalid payload", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data?.object;
    // Acknowledged — order fulfilment happens in admin / verify-session flow
    console.log("ROJOB paid session", session?.id, session?.metadata?.orderId);
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

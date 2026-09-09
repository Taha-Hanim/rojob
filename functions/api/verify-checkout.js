function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    },
  });
}

export async function onRequestOptions() {
  return json({});
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const secret = env.STRIPE_SECRET_KEY;
  if (!secret) return json({ error: "STRIPE_SECRET_KEY missing." }, 500);

  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id");
  if (!sessionId) return json({ error: "session_id required." }, 400);

  try {
    const res = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}?expand[]=line_items`,
      {
        headers: { Authorization: `Bearer ${secret}` },
      }
    );
    const session = await res.json();
    if (!res.ok) throw new Error(session.error?.message || "Stripe session lookup failed.");

    if (session.payment_status !== "paid" && session.status !== "complete") {
      return json({ error: "Payment not completed.", status: session.payment_status }, 402);
    }

    let cart = [];
    try {
      cart = JSON.parse(session.metadata?.cart || "[]");
    } catch {
      cart = [];
    }

    return json({
      id: session.id,
      payment_status: session.payment_status,
      amount_total: session.amount_total,
      currency: session.currency,
      customer_email: session.customer_details?.email || session.customer_email,
      customer_name: session.customer_details?.name || session.metadata?.customer_name,
      customer_phone: session.customer_details?.phone || session.metadata?.customer_phone,
      shipping: session.shipping_details || null,
      notes: session.metadata?.customer_notes || "",
      cart,
      line_items: (session.line_items?.data || []).map((li) => ({
        name: li.description,
        qty: li.quantity,
        amount: li.amount_total,
      })),
    });
  } catch (err) {
    return json({ error: err.message || "Could not verify session." }, 400);
  }
}

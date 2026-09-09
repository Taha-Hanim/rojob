export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return res.status(500).json({ error: "STRIPE_SECRET_KEY missing." });

  const sessionId = req.query.session_id;
  if (!sessionId) return res.status(400).json({ error: "session_id required." });

  try {
    const stripeRes = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}?expand[]=line_items`,
      { headers: { Authorization: `Bearer ${secret}` } }
    );
    const session = await stripeRes.json();
    if (!stripeRes.ok) throw new Error(session.error?.message || "Stripe session lookup failed.");

    if (session.payment_status !== "paid" && session.status !== "complete") {
      return res.status(402).json({ error: "Payment not completed.", status: session.payment_status });
    }

    let cart = [];
    try {
      cart = JSON.parse(session.metadata?.cart || "[]");
    } catch {
      cart = [];
    }

    return res.status(200).json({
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
    return res.status(400).json({ error: err.message || "Could not verify session." });
  }
}

/**
 * Vite plugin: local /api/* Stripe endpoints during `npm run dev`
 * so you don't need Wrangler for day-to-day testing.
 * Production uses Cloudflare Pages Functions in /functions.
 */
export function stripeDevApi() {
  return {
    name: "rojob-stripe-dev-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/")) return next();

        const secret = process.env.STRIPE_SECRET_KEY;
        const siteUrl = (process.env.VITE_SITE_URL || "http://127.0.0.1:5173").replace(
          /\/$/,
          ""
        );

        if (req.method === "OPTIONS") {
          res.statusCode = 204;
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
          res.setHeader("Access-Control-Allow-Headers", "Content-Type");
          res.end();
          return;
        }

        const send = (status, data) => {
          res.statusCode = status;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(data));
        };

        try {
          if (req.url.startsWith("/api/create-checkout") && req.method === "POST") {
            if (!secret) return send(503, { error: "STRIPE_SECRET_KEY missing in .env.local" });

            const body = await readJson(req);
            const items = body.items || [];
            if (!items.length) return send(400, { error: "Bag is empty." });

            const currency = String(body.currency || "pln").toLowerCase();
            const params = new URLSearchParams();
            params.set("mode", "payment");
            params.set(
              "success_url",
              `${siteUrl}/order-confirmed?session_id={CHECKOUT_SESSION_ID}`
            );
            params.set("cancel_url", `${siteUrl}/checkout?cancelled=1`);
            params.set("billing_address_collection", "required");
            params.set("payment_method_types[0]", "card");
            params.set("payment_method_types[1]", "blik");
            params.set("locale", "auto");
            if (body.customer?.email) params.set("customer_email", body.customer.email);
            if (body.orderId) params.set("metadata[orderId]", body.orderId);

            let i = 0;
            for (const item of items) {
              const unit = Number(item.price);
              if (!Number.isFinite(unit) || unit <= 0) {
                return send(400, {
                  error: `Product "${item.name}" needs a price in /admin before Stripe checkout.`,
                });
              }
              params.set(`line_items[${i}][quantity]`, String(Math.max(1, item.qty || 1)));
              params.set(`line_items[${i}][price_data][currency]`, currency);
              params.set(
                `line_items[${i}][price_data][unit_amount]`,
                String(Math.round(unit * 100))
              );
              params.set(
                `line_items[${i}][price_data][product_data][name]`,
                `${item.name}${item.color ? ` — ${item.color}` : ""}`
              );
              if (item.size) {
                params.set(
                  `line_items[${i}][price_data][product_data][description]`,
                  `Size ${item.size}`
                );
              }
              i += 1;
            }

            const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${secret}`,
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: params,
            });
            const session = await stripeRes.json();
            if (!stripeRes.ok) {
              return send(502, { error: session.error?.message || "Stripe error" });
            }
            return send(200, { id: session.id, url: session.url });
          }

          if (req.url.startsWith("/api/verify-session") && req.method === "GET") {
            if (!secret) return send(503, { error: "STRIPE_SECRET_KEY missing" });
            const u = new URL(req.url, "http://localhost");
            const sessionId = u.searchParams.get("session_id");
            if (!sessionId) return send(400, { error: "session_id required" });

            const stripeRes = await fetch(
              `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
              { headers: { Authorization: `Bearer ${secret}` } }
            );
            const session = await stripeRes.json();
            if (!stripeRes.ok) {
              return send(502, { error: session.error?.message || "Lookup failed" });
            }
            return send(200, {
              id: session.id,
              payment_status: session.payment_status,
              paid: session.payment_status === "paid",
              customer_email: session.customer_details?.email || session.customer_email,
              amount_total: session.amount_total,
              currency: session.currency,
              orderId: session.metadata?.orderId || null,
            });
          }
        } catch (err) {
          return send(500, { error: err.message || "API error" });
        }

        return next();
      });
    },
  };
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"));
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

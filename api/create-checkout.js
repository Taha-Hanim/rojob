function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

async function stripeForm(secret, path, body) {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Stripe request failed.");
  return data;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const secret = process.env.STRIPE_SECRET_KEY;
  const configuredSite = (
    process.env.SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:5173")
  ).replace(/\/$/, "");

  if (!secret) {
    return res.status(500).json({
      error: "STRIPE_SECRET_KEY is not set in Vercel Environment Variables.",
    });
  }

  try {
    const body = typeof req.body === "object" && req.body ? req.body : await readBody(req);
    const {
      items,
      customer,
      currency = "pln",
      successPath = "/order-confirmed",
      cancelPath = "/checkout",
    } = body || {};

    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({ error: "Cart is empty." });
    }
    if (!customer?.email || !customer?.name) {
      return res.status(400).json({ error: "Customer name and email are required." });
    }

    const params = {
      mode: "payment",
      success_url: `${configuredSite}${successPath}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${configuredSite}${cancelPath}`,
      customer_email: customer.email,
      "phone_number_collection[enabled]": "true",
      "payment_method_types[0]": "card",
      "metadata[customer_name]": customer.name,
      "metadata[customer_phone]": customer.phone || "",
      "metadata[customer_notes]": String(customer.notes || "").slice(0, 450),
      "metadata[cart]": JSON.stringify(
        items.map((i) => ({
          productId: i.productId,
          slug: i.slug,
          name: i.name,
          color: i.color,
          size: i.size,
          qty: i.qty,
          price: i.price,
        }))
      ).slice(0, 450),
    };

    const eu = ["PL", "DE", "FR", "GB", "NL", "BE", "AT", "CZ", "SK", "LT", "LV", "EE", "SE", "DK", "FI", "IT", "ES", "PT", "IE"];
    eu.forEach((c, i) => {
      params[`shipping_address_collection[allowed_countries][${i}]`] = c;
    });

    items.forEach((item, i) => {
      const unit = Number(item.price);
      if (!Number.isFinite(unit) || unit <= 0) {
        throw new Error(`Invalid price for ${item.name || "item"}`);
      }
      params[`line_items[${i}][quantity]`] = String(Math.max(1, Number(item.qty) || 1));
      params[`line_items[${i}][price_data][currency]`] = String(currency).toLowerCase();
      params[`line_items[${i}][price_data][unit_amount]`] = String(Math.round(unit * 100));
      params[`line_items[${i}][price_data][product_data][name]`] = item.name || "ROJOB piece";
      const desc = [item.color, item.size].filter(Boolean).join(" · ");
      if (desc) params[`line_items[${i}][price_data][product_data][description]`] = desc;
      if (item.image?.startsWith("http")) {
        params[`line_items[${i}][price_data][product_data][images][0]`] = item.image;
      }
    });

    const session = await stripeForm(secret, "checkout/sessions", params);
    return res.status(200).json({ id: session.id, url: session.url });
  } catch (err) {
    return res.status(400).json({ error: err.message || "Could not create Stripe session." });
  }
}

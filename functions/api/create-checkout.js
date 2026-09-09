function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
  });
}

async function stripeRequest(secret, path, body) {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || "Stripe request failed.");
  }
  return data;
}

export async function onRequestOptions() {
  return json({});
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const secret = env.STRIPE_SECRET_KEY;
  const siteUrl = (env.SITE_URL || "http://127.0.0.1:5173").replace(/\/$/, "");

  if (!secret) {
    return json(
      {
        error:
          "STRIPE_SECRET_KEY is not set. Add it in Cloudflare Pages → Settings → Environment variables.",
      },
      500
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  const {
    items,
    customer,
    currency = "pln",
    successPath = "/order-confirmed",
    cancelPath = "/checkout",
  } = body || {};

  if (!Array.isArray(items) || !items.length) {
    return json({ error: "Cart is empty." }, 400);
  }
  if (!customer?.email || !customer?.name) {
    return json({ error: "Customer name and email are required." }, 400);
  }

  try {
    const params = {
      mode: "payment",
      success_url: `${siteUrl}${successPath}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}${cancelPath}`,
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
      if (desc) {
        params[`line_items[${i}][price_data][product_data][description]`] = desc;
      }
      if (item.image?.startsWith("http")) {
        params[`line_items[${i}][price_data][product_data][images][0]`] = item.image;
      }
    });

    const session = await stripeRequest(secret, "checkout/sessions", params);
    return json({ id: session.id, url: session.url });
  } catch (err) {
    return json({ error: err.message || "Could not create Stripe session." }, 400);
  }
}

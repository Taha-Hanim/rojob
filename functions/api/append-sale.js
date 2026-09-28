function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    },
  });
}

async function forwardToGoogleSheet(webhook, secret, payload) {
  const res = await fetch(webhook, {
    method: "POST",
    redirect: "follow",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret: secret || "",
      lines: payload.lines || [],
      catalogue: payload.catalogue || [],
      replaceStock: Boolean(payload.replaceStock),
    }),
  });
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    throw new Error(data.error || `Google Sheet returned ${res.status}`);
  }
  return data;
}

export async function onRequestOptions() {
  return json({});
}

export async function onRequestGet(context) {
  return json({ configured: Boolean(context.env.SALES_SHEET_WEBHOOK) });
}

export async function onRequestPost(context) {
  const webhook = context.env.SALES_SHEET_WEBHOOK;
  const secret = context.env.SALES_SHEET_SECRET;
  if (!webhook) return json({ skipped: true, configured: false });

  let body = {};
  try {
    body = await context.request.json();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  try {
    const result = await forwardToGoogleSheet(webhook, secret, body);
    return json({ ok: true, configured: true, ...result });
  } catch (err) {
    return json({ error: err.message || "Could not update Google Sheet." }, 502);
  }
}

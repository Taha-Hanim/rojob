export async function forwardToGoogleSheet(webhook, secret, payload) {
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
    const err = new Error(data.error || `Google Sheet returned ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

import { forwardToGoogleSheet } from "../server/salesSheet.js";

function json(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.end(JSON.stringify(data));
}

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

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const webhook = process.env.SALES_SHEET_WEBHOOK;
  const secret = process.env.SALES_SHEET_SECRET;

  if (req.method === "GET") {
    return json(res, 200, { configured: Boolean(webhook) });
  }
  if (req.method !== "POST") {
    return json(res, 405, { error: "Method not allowed" });
  }

  if (!webhook) {
    return json(res, 200, { skipped: true, configured: false });
  }

  try {
    const body =
      typeof req.body === "object" && req.body && !Buffer.isBuffer(req.body)
        ? req.body
        : await readBody(req);
    const result = await forwardToGoogleSheet(webhook, secret, body);
    return json(res, 200, { ok: true, configured: true, ...result });
  } catch (err) {
    return json(res, 502, { error: err.message || "Could not update Google Sheet." });
  }
}

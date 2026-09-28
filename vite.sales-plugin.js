/**
 * Local /api/append-sale so paid sales can reach a Google Sheet during `npm run dev`.
 */
import { forwardToGoogleSheet } from "./server/salesSheet.js";

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

export function salesSheetDevApi() {
  return {
    name: "rojob-sales-sheet-dev-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/append-sale")) return next();

        const send = (status, data) => {
          res.statusCode = status;
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.end(JSON.stringify(data));
        };

        if (req.method === "OPTIONS") {
          res.statusCode = 204;
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
          res.setHeader("Access-Control-Allow-Headers", "Content-Type");
          res.end();
          return;
        }

        const webhook = process.env.SALES_SHEET_WEBHOOK;
        const secret = process.env.SALES_SHEET_SECRET;

        try {
          if (req.method === "GET") {
            return send(200, { configured: Boolean(webhook) });
          }
          if (req.method !== "POST") return send(405, { error: "Method not allowed" });
          if (!webhook) return send(200, { skipped: true, configured: false });

          const body = await readJson(req);
          const result = await forwardToGoogleSheet(webhook, secret, body);
          return send(200, { ok: true, configured: true, ...result });
        } catch (err) {
          return send(502, { error: err.message || "Could not update Google Sheet." });
        }
      });
    },
  };
}

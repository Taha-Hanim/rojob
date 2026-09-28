import { useEffect, useState } from "react";
import { barcodeFor } from "../lib/barcode";
import {
  downloadSalesWorkbook,
  fetchSalesSheetStatus,
  subscribeSalesLedger,
  syncSalesSheet,
} from "../lib/salesWorkbook";
import BarcodeMark from "./BarcodeMark";

function formatWhen(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
}

export default function SalesLedger({ products }) {
  const [rows, setRows] = useState([]);
  const [sheet, setSheet] = useState({ configured: false });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState("");

  useEffect(() => subscribeSalesLedger(setRows), []);

  useEffect(() => {
    fetchSalesSheetStatus()
      .then(setSheet)
      .catch(() => setSheet({ configured: false }));
  }, []);

  const pushSheet = async (replaceStock) => {
    setBusy(replaceStock ? "sync" : "sheet");
    setMsg("");
    try {
      const result = await syncSalesSheet(products, [], { replaceStock });
      if (result.skipped || result.configured === false) {
        setMsg("The Google Sheet is not connected yet. Use Setup to link it.");
      } else {
        setMsg(replaceStock ? "Cloud sheet refreshed from live stock." : "Cloud sheet updated.");
      }
    } catch (err) {
      setMsg(err.message || "Could not update the cloud sheet.");
    } finally {
      setBusy("");
    }
  };

  const download = async () => {
    setBusy("download");
    setMsg("");
    try {
      await downloadSalesWorkbook(products);
      setMsg("Download started. The cloud copy is already up to date.");
    } catch (err) {
      setMsg(err.message || "Could not build the Excel file.");
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="mt-8 space-y-6">
      <div>
        <h2 className="font-serif text-4xl md:text-5xl">Sales ledger</h2>
        <p className="mt-3 text-sm text-midnight/60 max-w-2xl leading-relaxed">
          Every completed payment adds a Sales row with barcode, product, and the buyer’s
          name, email, phone and address. Declined cards never appear here.
        </p>
        <p className="mt-2 text-sm text-midnight/50">
          Google Sheet:{" "}
          {sheet.configured ? "connected — each sale appends a row with a barcode." : "not connected yet. Link it in Setup if you want the same ledger in Google Drive."}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {sheet.configured && (
            <button
              type="button"
              onClick={() => pushSheet(true)}
              disabled={Boolean(busy)}
              className="text-[10px] tracking-[0.22em] uppercase border border-midnight/20 px-5 py-2 hover:bg-midnight hover:text-porcelain transition-colors disabled:opacity-40"
            >
              {busy === "sync" ? "Updating sheet…" : "Refresh Google Sheet"}
            </button>
          )}
          <button
            type="button"
            onClick={download}
            disabled={Boolean(busy)}
            className="text-[10px] tracking-[0.22em] uppercase border border-midnight/20 px-5 py-2 hover:bg-midnight hover:text-porcelain transition-colors disabled:opacity-40"
          >
            {busy === "download" ? "Building…" : "Download a copy"}
          </button>
        </div>
      </div>
      {msg && <p className="text-sm text-midnight/70">{msg}</p>}

      <div className="overflow-x-auto border border-midnight/10 bg-white/40">
        <table className="w-full text-sm text-left min-w-[52rem]">
          <thead>
            <tr className="border-b border-midnight/15 text-[11px] tracking-[0.15em] uppercase text-midnight/50">
              <th className="py-3 px-3">Sold</th>
              <th className="px-3">Barcode</th>
              <th className="px-3">Product</th>
              <th className="px-3">Size</th>
              <th className="px-3">Qty</th>
              <th className="px-3">PLN</th>
              <th className="px-3">Buyer</th>
              <th className="px-3">Email</th>
              <th className="px-3">Phone</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((line) => {
              const code = line.barcode || barcodeFor(line.sku || line.slug, line.size);
              return (
                <tr key={line.id} className="border-b border-midnight/10 align-middle">
                  <td className="py-3 px-3 whitespace-nowrap text-midnight/60">
                    {formatWhen(line.soldAt)}
                  </td>
                  <td className="px-3">
                    <BarcodeMark value={code} />
                    <p className="text-[10px] font-mono text-midnight/40 mt-1">{code}</p>
                  </td>
                  <td className="px-3">
                    <div>{line.name || "—"}</div>
                    <div className="text-[10px] tracking-[0.14em] uppercase text-midnight/40">
                      {line.color} {line.sku ? `· ${line.sku}` : ""}
                    </div>
                  </td>
                  <td className="px-3">{line.size || "—"}</td>
                  <td className="px-3">{line.qty || 1}</td>
                  <td className="px-3">{line.price == null ? "—" : line.price}</td>
                  <td className="px-3">
                    <div>{line.buyerName || line.customer || "—"}</div>
                    {(line.buyerCity || line.buyerCountry) && (
                      <div className="text-[10px] text-midnight/40">
                        {[line.buyerCity, line.buyerCountry].filter(Boolean).join(", ")}
                      </div>
                    )}
                  </td>
                  <td className="px-3 text-midnight/60">{line.buyerEmail || "—"}</td>
                  <td className="px-3 text-midnight/60">{line.buyerPhone || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!rows.length && (
          <p className="p-6 text-midnight/50">No completed sales yet. The first paid order will appear here on its own.</p>
        )}
      </div>
    </div>
  );
}

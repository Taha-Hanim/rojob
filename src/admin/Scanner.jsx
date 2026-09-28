import { useEffect, useRef, useState } from "react";
import { findByBarcode, normalizeBarcode } from "../lib/barcode";
import { applyStockMove, subscribeStockMoves } from "../lib/store";
import { stockForSize } from "../lib/inventory";
import BarcodeMark from "./BarcodeMark";

const LOCATIONS = [
  { id: "poland", label: "Poland" },
  { id: "bangladesh", label: "Bangladesh" },
];

const DIRECTIONS = [
  { id: "in", label: "In — received" },
  { id: "out", label: "Out — left the warehouse" },
];

export default function Scanner({ products }) {
  const inputRef = useRef(null);
  const [code, setCode] = useState("");
  const [location, setLocation] = useState("poland");
  const [direction, setDirection] = useState("in");
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [moves, setMoves] = useState([]);
  const lastScan = useRef({ code: "", at: 0 });

  useEffect(() => subscribeStockMoves(setMoves), []);

  useEffect(() => {
    const focus = () => inputRef.current?.focus();
    focus();
    window.addEventListener("focus", focus);
    return () => window.removeEventListener("focus", focus);
  }, []);

  const commit = async (raw) => {
    const barcode = normalizeBarcode(raw);
    if (!barcode || busy) return;
    const now = Date.now();
    if (lastScan.current.code === barcode && now - lastScan.current.at < 800) return;
    lastScan.current = { code: barcode, at: now };

    const hit = findByBarcode(products, barcode);
    if (!hit) {
      setErr(`Unknown barcode ${barcode}. Print labels from Inventory — each size has its own code.`);
      setMsg("");
      setCode("");
      return;
    }

    setBusy(true);
    setErr("");
    try {
      const { product } = await applyStockMove({
        product: hit.product,
        size: hit.size,
        qty,
        direction,
        location,
        source: "scan",
      });
      const left = stockForSize(product, hit.size);
      setMsg(
        `${direction === "in" ? "Received" : "Removed"} ${qty} × ${hit.product.name} ${hit.product.color} · ${hit.size} in ${location}. ${left} left.`
      );
      setCode("");
      setQty(1);
    } catch (ex) {
      setErr(ex.message || "Could not save this scan.");
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="mt-8 space-y-8">
      <div>
        <h2 className="font-serif text-4xl md:text-5xl">Scan</h2>
        <p className="mt-3 text-sm text-midnight/60 max-w-2xl leading-relaxed">
          Each piece and size has a barcode. A USB or Bluetooth reader types the code and
          presses Enter — the website saves the movement immediately, in Poland or
          Bangladesh. Website orders also remove stock on their own.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 max-w-xl">
        <label className="block">
          <span className="block text-[10px] tracking-[0.18em] uppercase text-midnight/45 mb-1">
            Warehouse
          </span>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full border border-midnight/20 bg-transparent px-3 py-2"
          >
            {LOCATIONS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="block text-[10px] tracking-[0.18em] uppercase text-midnight/45 mb-1">
            Movement
          </span>
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
            className="w-full border border-midnight/20 bg-transparent px-3 py-2"
          >
            {DIRECTIONS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <form
        className="max-w-xl"
        onSubmit={(e) => {
          e.preventDefault();
          commit(code);
        }}
      >
        <label className="block">
          <span className="block text-[10px] tracking-[0.18em] uppercase text-midnight/45 mb-1">
            Scan barcode
          </span>
          <input
            ref={inputRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            autoComplete="off"
            autoFocus
            placeholder="Click here, then scan"
            className="w-full border border-midnight/20 bg-white/70 px-4 py-4 font-mono text-lg tracking-wide"
          />
        </label>
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <label>
            <span className="block text-[10px] tracking-[0.18em] uppercase text-midnight/45 mb-1">
              Qty
            </span>
            <input
              type="number"
              min="1"
              step="1"
              value={qty}
              onChange={(e) => setQty(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
              className="w-20 border border-midnight/20 bg-transparent px-2 py-2"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="text-[10px] tracking-[0.22em] uppercase border border-midnight/20 px-5 py-2 hover:bg-midnight hover:text-porcelain transition-colors disabled:opacity-40"
          >
            {busy ? "Saving…" : "Save scan"}
          </button>
        </div>
      </form>

      {msg && <p className="text-sm text-midnight/70">{msg}</p>}
      {err && <p className="text-sm text-crimson">{err}</p>}

      <div>
        <h3 className="font-serif text-2xl">Recent scans</h3>
        <div className="mt-4 overflow-x-auto border border-midnight/10 bg-white/40">
          <table className="w-full text-sm text-left min-w-[40rem]">
            <thead>
              <tr className="border-b border-midnight/15 text-[11px] tracking-[0.15em] uppercase text-midnight/50">
                <th className="py-3 px-3">When</th>
                <th className="px-3">Barcode</th>
                <th className="px-3">Piece</th>
                <th className="px-3">Where</th>
                <th className="px-3">Move</th>
              </tr>
            </thead>
            <tbody>
              {moves.slice(0, 40).map((row) => (
                <tr key={row.id} className="border-b border-midnight/10 align-middle">
                  <td className="py-3 px-3 whitespace-nowrap text-midnight/55">
                    {row.createdAt ? new Date(row.createdAt).toLocaleString() : "—"}
                  </td>
                  <td className="px-3">
                    <BarcodeMark value={row.barcode} height={28} />
                  </td>
                  <td className="px-3">
                    {row.qty}× {row.name} {row.color} · {row.size}
                  </td>
                  <td className="px-3 capitalize">{row.location || "—"}</td>
                  <td className="px-3 uppercase tracking-wide text-[11px]">
                    {row.direction} · {row.source}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!moves.length && (
            <p className="p-6 text-midnight/50">No scans yet. Click the field and scan a label.</p>
          )}
        </div>
      </div>
    </div>
  );
}

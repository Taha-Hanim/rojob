import { useEffect, useState } from "react";
import { imgSrc } from "../lib/cloudinary";
import { stockMap, totalStock } from "../lib/inventory";
import { updateProductStock } from "../lib/store";

export default function Inventory({ products }) {
  const [drafts, setDrafts] = useState({});
  const [saving, setSaving] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const next = {};
    for (const p of products) {
      next[p.id || p.slug] = stockMap(p);
    }
    setDrafts(next);
  }, [products]);

  const setQty = (id, size, value) => {
    const n = Math.max(0, Math.floor(Number(value) || 0));
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...prev[id], [size]: n },
    }));
  };

  const save = async (product) => {
    const id = product.id || product.slug;
    setSaving(id);
    setMsg("");
    try {
      await updateProductStock(product, drafts[id] || stockMap(product));
      setMsg(`Saved ${product.name} · ${product.color}`);
    } catch (err) {
      setMsg(err.message || "Could not save inventory.");
    } finally {
      setSaving("");
    }
  };

  if (!products.length) {
    return <p className="mt-10 text-midnight/50">No products in the catalogue yet.</p>;
  }

  return (
    <div className="mt-8 space-y-6">
      <div>
        <h2 className="font-serif text-4xl md:text-5xl">Inventory</h2>
        <p className="mt-3 text-sm text-midnight/60 max-w-2xl leading-relaxed">
          Counts update automatically after a completed payment. Unsuccessful payments leave
          quantities unchanged. Edit a size here and save to correct stock by hand.
        </p>
      </div>
      {msg && <p className="text-sm text-midnight/70">{msg}</p>}

      <ul className="space-y-6">
        {products.map((product) => {
          const id = product.id || product.slug;
          const sizes = product.sizes?.length ? product.sizes : ["One size"];
          const map = drafts[id] || stockMap(product);
          const total = Object.values(map).reduce((n, v) => n + Number(v || 0), 0);
          const liveTotal = totalStock(product);

          return (
            <li
              key={id}
              className="grid md:grid-cols-[7rem_1fr] gap-5 md:gap-8 border border-midnight/10 p-4 md:p-5 bg-white/40"
            >
              <div className="w-28 aspect-[3/4] overflow-hidden bg-white/50">
                {product.images?.front && (
                  <img
                    src={imgSrc(product.images.front)}
                    alt={`${product.name} ${product.color}`}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <div>
                    <p className="font-serif text-2xl">{product.name}</p>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-midnight/45 mt-1">
                      {product.color} · {product.sku || id}
                    </p>
                  </div>
                  <p
                    className={`text-[10px] tracking-[0.2em] uppercase ${
                      total === 0 ? "text-crimson" : "text-midnight/50"
                    }`}
                  >
                    {total === 0 ? "Out of stock" : `${total} in stock`}
                    {total !== liveTotal ? " · unsaved" : ""}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  {sizes.map((size) => (
                    <label key={size} className="block">
                      <span className="block text-[10px] tracking-[0.18em] uppercase text-midnight/45 mb-1">
                        {size}
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={map[size] ?? 0}
                        onChange={(e) => setQty(id, size, e.target.value)}
                        className={`w-20 border bg-transparent px-2 py-2 text-sm tabular-nums ${
                          Number(map[size] || 0) === 0
                            ? "border-crimson/40 text-crimson"
                            : "border-midnight/20"
                        }`}
                      />
                    </label>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => save(product)}
                  disabled={saving === id}
                  className="mt-5 text-[10px] tracking-[0.22em] uppercase border border-midnight/20 px-5 py-2 hover:bg-midnight hover:text-porcelain transition-colors disabled:opacity-40"
                >
                  {saving === id ? "Saving…" : "Save counts"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

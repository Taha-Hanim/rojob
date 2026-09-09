import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const KEY = "rojob_cart";

function normalizeLine(entry) {
  return {
    productId: entry.productId,
    slug: entry.slug,
    name: entry.name,
    color: entry.color ?? entry.colorName ?? "",
    colorId: entry.colorId,
    size: entry.size,
    image: entry.image,
    price: entry.price == null ? null : Number(entry.price),
    qty: entry.qty ?? 1,
    lineId: entry.lineId ?? crypto.randomUUID(),
  };
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]").map(normalizeLine);
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const add = (entry) => {
    const line = normalizeLine(entry);
    setItems((prev) => {
      const i = prev.findIndex(
        (x) =>
          x.productId === line.productId &&
          x.colorId === line.colorId &&
          x.size === line.size
      );
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], qty: next[i].qty + line.qty };
        return next;
      }
      return [...prev, line];
    });
  };

  const setQty = (lineId, qty) => {
    setItems((prev) =>
      qty < 1 ? prev.filter((x) => x.lineId !== lineId) : prev.map((x) => (x.lineId === lineId ? { ...x, qty } : x))
    );
  };

  const remove = (lineId) => setItems((prev) => prev.filter((x) => x.lineId !== lineId));
  const clear = () => setItems([]);

  const count = items.reduce((n, x) => n + x.qty, 0);
  const total = items.reduce((n, x) => n + (x.price ?? 0) * x.qty, 0);
  const hasPricedItems = items.some((x) => x.price != null);

  const value = useMemo(
    () => ({ items, add, setQty, remove, clear, count, total, hasPricedItems }),
    [items, count, total, hasPricedItems]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

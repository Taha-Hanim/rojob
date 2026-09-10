import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "./AuthContext";

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

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]").map(normalizeLine);
  } catch {
    return [];
  }
}

function mergeCarts(a, b) {
  const map = new Map();
  [...a, ...b].forEach((line) => {
    const key = `${line.productId}|${line.colorId}|${line.size}`;
    const prev = map.get(key);
    if (prev) {
      map.set(key, { ...prev, qty: prev.qty + line.qty });
    } else {
      map.set(key, { ...normalizeLine(line), lineId: line.lineId || crypto.randomUUID() });
    }
  });
  return [...map.values()];
}

export function CartProvider({ children }) {
  const { user, profile, saveProfile, configured, ready } = useAuth();
  const [items, setItems] = useState(readLocal);
  const hydrated = useRef(false);
  const skipNextCloud = useRef(false);

  // Hydrate from Firebase profile once signed in
  useEffect(() => {
    if (!ready || !configured) return;
    if (!user) {
      hydrated.current = false;
      return;
    }
    if (!profile || hydrated.current) return;
    const cloud = Array.isArray(profile.cart) ? profile.cart.map(normalizeLine) : [];
    const local = readLocal();
    const merged = mergeCarts(cloud, local);
    skipNextCloud.current = true;
    setItems(merged);
    hydrated.current = true;
  }, [user, profile, ready, configured]);

  // Persist local always
  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  // Sync to Firebase when logged in
  useEffect(() => {
    if (!user || !configured || !hydrated.current) return;
    if (skipNextCloud.current) {
      skipNextCloud.current = false;
      // still push merged cart once
    }
    const t = setTimeout(() => {
      saveProfile({ cart: items }).catch(() => {});
    }, 500);
    return () => clearTimeout(t);
  }, [items, user, configured, saveProfile]);

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
  const replace = (next) => setItems((next || []).map(normalizeLine));

  const count = items.reduce((n, x) => n + x.qty, 0);
  const total = items.reduce((n, x) => n + (x.price ?? 0) * x.qty, 0);
  const hasPricedItems = items.some((x) => x.price != null);

  const value = useMemo(
    () => ({ items, add, setQty, remove, clear, replace, count, total, hasPricedItems }),
    [items, count, total, hasPricedItems]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

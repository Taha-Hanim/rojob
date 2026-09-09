import { createContext, useContext, useEffect, useMemo, useState } from "react";

const WishlistContext = createContext(null);
const STORAGE_KEY = "rojob_wishlist";

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }) {
  const [ids, setIds] = useState(readStorage);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // ignore storage failures
    }
  }, [ids]);

  const toggle = (productId) => {
    setIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const add = (productId) => {
    setIds((prev) => (prev.includes(productId) ? prev : [...prev, productId]));
  };

  const remove = (productId) => {
    setIds((prev) => prev.filter((id) => id !== productId));
  };

  const has = (productId) => ids.includes(productId);

  const value = useMemo(
    () => ({ ids, toggle, add, remove, has, count: ids.length }),
    [ids]
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}

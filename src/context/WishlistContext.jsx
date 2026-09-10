import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "./AuthContext";

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

function uniq(list) {
  return [...new Set(list.filter(Boolean))];
}

export function WishlistProvider({ children }) {
  const { user, profile, saveProfile, configured, ready } = useAuth();
  const [ids, setIds] = useState(readStorage);
  const hydrated = useRef(false);

  useEffect(() => {
    if (!ready || !configured || !user || !profile || hydrated.current) return;
    const cloud = Array.isArray(profile.wishlist) ? profile.wishlist : [];
    const merged = uniq([...cloud, ...readStorage()]);
    setIds(merged);
    hydrated.current = true;
  }, [user, profile, ready, configured]);

  useEffect(() => {
    if (!user) hydrated.current = false;
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      /* ignore */
    }
  }, [ids]);

  useEffect(() => {
    if (!user || !configured || !hydrated.current) return;
    const t = setTimeout(() => {
      saveProfile({ wishlist: ids }).catch(() => {});
    }, 500);
    return () => clearTimeout(t);
  }, [ids, user, configured, saveProfile]);

  const toggle = (productId) => {
    setIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
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

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}

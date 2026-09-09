import { createContext, useCallback, useContext, useMemo, useState } from "react";

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const [cookieConsent, setCookieConsent] = useState(null);

  const closeAll = useCallback(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setBagOpen(false);
  }, []);

  const openMenu = useCallback(() => {
    setSearchOpen(false);
    setBagOpen(false);
    setMenuOpen(true);
  }, []);

  const openSearch = useCallback(() => {
    setMenuOpen(false);
    setBagOpen(false);
    setSearchOpen(true);
  }, []);

  const openBag = useCallback(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setBagOpen(true);
  }, []);

  const value = useMemo(
    () => ({
      menuOpen,
      setMenuOpen,
      searchOpen,
      setSearchOpen,
      bagOpen,
      setBagOpen,
      cookieConsent,
      setCookieConsent,
      openMenu,
      openSearch,
      openBag,
      closeAll,
    }),
    [menuOpen, searchOpen, bagOpen, cookieConsent, openMenu, openSearch, openBag, closeAll]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used within UIProvider");
  return ctx;
}

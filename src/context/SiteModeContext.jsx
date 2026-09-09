import { createContext, useContext, useMemo } from "react";
import { formatMoney } from "../lib/format";

const SiteModeContext = createContext(null);

const mode = import.meta.env.VITE_SITE_MODE || "prelaunch";
const currency = import.meta.env.VITE_CURRENCY || "PLN";

export function SiteModeProvider({ children }) {
  const commerceEnabled = mode === "commerce";

  const formatCurrency = (amount) => formatMoney(amount, currency);

  const value = useMemo(
    () => ({
      mode,
      commerceEnabled,
      isCommerce: commerceEnabled,
      currency,
      formatCurrency,
    }),
    []
  );

  return (
    <SiteModeContext.Provider value={value}>{children}</SiteModeContext.Provider>
  );
}

export function useSiteMode() {
  const ctx = useContext(SiteModeContext);
  if (!ctx) throw new Error("useSiteMode must be used within SiteModeProvider");
  return ctx;
}

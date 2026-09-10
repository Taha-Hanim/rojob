import { createContext, useContext, useMemo } from "react";
import { useCurrency } from "./CurrencyContext";

const SiteModeContext = createContext(null);

const mode = import.meta.env.VITE_SITE_MODE || "commerce";

export function SiteModeProvider({ children }) {
  const { currency, formatPrice, convertFromPln } = useCurrency();
  const commerceEnabled = mode === "commerce";

  const value = useMemo(
    () => ({
      mode,
      commerceEnabled,
      isCommerce: commerceEnabled,
      currency,
      formatCurrency: formatPrice,
      convertFromPln,
    }),
    [commerceEnabled, currency, formatPrice, convertFromPln]
  );

  return <SiteModeContext.Provider value={value}>{children}</SiteModeContext.Provider>;
}

export function useSiteMode() {
  const ctx = useContext(SiteModeContext);
  if (!ctx) throw new Error("useSiteMode must be used within SiteModeProvider");
  return ctx;
}

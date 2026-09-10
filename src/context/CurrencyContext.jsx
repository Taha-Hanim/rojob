import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { formatMoney } from "../lib/format";

const CurrencyContext = createContext(null);

const KEY = "rojob_currency";
/** Approximate display rate; prices in catalogue are stored in PLN */
const PLN_PER_EUR = 4.3;

function detectPolandHeuristic() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (tz === "Europe/Warsaw") return true;
    const langs = [...(navigator.languages || []), navigator.language].filter(Boolean);
    if (langs.some((l) => String(l).toLowerCase().startsWith("pl"))) return true;
  } catch {
    /* ignore */
  }
  return false;
}

async function detectCountryCode() {
  const endpoints = [
    "https://ipapi.co/json/",
    "https://ipwho.is/",
  ];
  for (const url of endpoints) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 3500);
      const res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(t);
      if (!res.ok) continue;
      const data = await res.json();
      const code = (data.country_code || data.countryCode || "").toUpperCase();
      if (code) return code;
    } catch {
      /* try next */
    }
  }
  return detectPolandHeuristic() ? "PL" : null;
}

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === "PLN" || saved === "EUR") return saved;
    } catch {
      /* ignore */
    }
    return detectPolandHeuristic() ? "PLN" : "EUR";
  });
  const [country, setCountry] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const manual = (() => {
        try {
          return localStorage.getItem(`${KEY}_manual`) === "1";
        } catch {
          return false;
        }
      })();

      const code = await detectCountryCode();
      if (cancelled) return;
      setCountry(code);
      if (!manual) {
        const next = code === "PL" ? "PLN" : "EUR";
        setCurrencyState(next);
        try {
          localStorage.setItem(KEY, next);
        } catch {
          /* ignore */
        }
      }
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setCurrency = (code) => {
    if (code !== "PLN" && code !== "EUR") return;
    setCurrencyState(code);
    try {
      localStorage.setItem(KEY, code);
      localStorage.setItem(`${KEY}_manual`, "1");
    } catch {
      /* ignore */
    }
  };

  /** Convert catalogue PLN amount to active display currency */
  const convertFromPln = (amountPln) => {
    if (amountPln == null || Number.isNaN(Number(amountPln))) return null;
    const n = Number(amountPln);
    if (currency === "EUR") return Math.round(n / PLN_PER_EUR);
    return Math.round(n);
  };

  const formatPrice = (amountPln) => {
    const converted = convertFromPln(amountPln);
    return formatMoney(converted, currency);
  };

  const value = useMemo(
    () => ({
      currency,
      setCurrency,
      country,
      ready,
      plnPerEur: PLN_PER_EUR,
      convertFromPln,
      formatPrice,
    }),
    [currency, country, ready]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}

const DEFAULT_CURRENCY = import.meta.env.VITE_CURRENCY || "PLN";

export function formatMoney(amount, currency = DEFAULT_CURRENCY, locale) {
  if (amount == null || Number.isNaN(Number(amount))) return "—";

  const loc =
    locale ||
    (currency === "PLN" ? "pl-PL" : currency === "EUR" ? "de-DE" : "en-EU");

  return new Intl.NumberFormat(loc, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

export function formatPrice(amount, currency = DEFAULT_CURRENCY) {
  return formatMoney(amount, currency);
}

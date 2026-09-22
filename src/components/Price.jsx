import { useCurrency } from "../context/CurrencyContext";

export function compareAtPrice(product) {
  const n = Number(product?.compareAtPrice);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function isOnSale(product) {
  const sale = Number(product?.price);
  const original = compareAtPrice(product);
  return original != null && Number.isFinite(sale) && original > sale;
}

export default function Price({ product, amount, className = "", saleClassName = "text-crimson" }) {
  const { formatPrice } = useCurrency();
  const sale = amount != null ? amount : product?.price;
  const original = amount != null ? null : compareAtPrice(product);
  const discounted = original != null && sale != null && Number(original) > Number(sale);

  return (
    <span className={`tabular-nums ${className}`}>
      {discounted && (
        <span className="line-through text-midnight/40 mr-2">{formatPrice(original)}</span>
      )}
      <span className={discounted ? saleClassName : ""}>{formatPrice(sale)}</span>
    </span>
  );
}

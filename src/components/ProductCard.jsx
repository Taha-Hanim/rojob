import { Link } from "react-router-dom";
import { useLang } from "../context/LangContext";
import { formatPrice } from "../data/seed";
import { imgSrc } from "../lib/cloudinary";

export default function ProductCard({ product, index = 0 }) {
  const { t } = useLang();
  const front = product.images?.front;
  const hover = product.images?.hover;
  const slug = product.slug || product.id;

  const label =
    product.status === "preview"
      ? t("product.preview")
      : product.featured
        ? t("product.new")
        : null;

  return (
    <Link to={`/products/${slug}`} className="group block">
      <div
        className={`relative overflow-hidden bg-white/30 ${
          index % 3 === 1 ? "aspect-[4/5]" : "aspect-[3/4]"
        }`}
      >
        {front && (
          <img
            src={imgSrc(front)}
            alt={`${product.name} — ${product.color}`}
            className={`h-full w-full object-cover transition-opacity duration-[900ms] ease-in-out ${
              hover ? "group-hover:opacity-0" : "group-hover:scale-[1.02] transition-transform duration-[900ms]"
            }`}
          />
        )}
        {hover && (
          <img
            src={imgSrc(hover)}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-[900ms] ease-in-out"
          />
        )}
        {label && (
          <span className="absolute top-3 left-3 text-[9px] tracking-[0.28em] uppercase text-midnight/55 bg-porcelain/85 px-2 py-1 backdrop-blur-sm">
            {label}
          </span>
        )}
      </div>
      <div className="mt-4 flex justify-between gap-4 items-baseline">
        <div className="min-w-0">
          <h3 className="font-serif text-xl md:text-2xl truncate">{product.name}</h3>
          {product.color && (
            <p className="text-[10px] tracking-[0.2em] uppercase text-midnight/45 mt-1 truncate">
              {product.color}
            </p>
          )}
        </div>
        <p className="text-sm shrink-0 tabular-nums">{formatPrice(product.price, product.currency)}</p>
      </div>
    </Link>
  );
}

import { Link } from "react-router-dom";
import { useLang } from "../context/LangContext";
import { useCurrency } from "../context/CurrencyContext";
import { imgSrc } from "../lib/cloudinary";
import { isProductInStock } from "../lib/inventory";

export default function ProductCard({ product, index = 0 }) {
  const { t } = useLang();
  const { formatPrice } = useCurrency();
  const front = product.images?.front;
  const slug = product.slug || product.id;
  const colorOptions = product.colorOptions || [];
  // Hovering reveals the next colourway. Pieces with a single colourway get
  // the subtle zoom instead of an unrelated styling shot.
  const hover = colorOptions.find((c) => c.slug !== slug && c.image)?.image;

  const soldOut =
    colorOptions.length > 0
      ? colorOptions.every((c) => c.inStock === false)
      : !isProductInStock(product);

  const label = soldOut
    ? t("product.outOfStock")
    : product.status === "preview"
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
              soldOut ? "opacity-55" : ""
            } ${
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
          <span
            className={`absolute top-3 left-3 text-[9px] tracking-[0.28em] uppercase px-2 py-1 backdrop-blur-sm ${
              soldOut ? "text-crimson bg-porcelain/90" : "text-midnight/55 bg-porcelain/85"
            }`}
          >
            {label}
          </span>
        )}
      </div>
      <div className="mt-4 flex justify-between gap-4 items-baseline">
        <div className="min-w-0">
          <h3 className="font-serif text-xl md:text-2xl truncate">{product.name}</h3>
          {colorOptions.length > 1 ? (
            <span className="mt-2 flex items-center gap-1.5">
              {colorOptions.map((c) => (
                <span
                  key={c.slug}
                  title={c.inStock === false ? `${c.color} — out of stock` : c.color}
                  className={`w-3 h-3 rounded-full border border-midnight/20 ${
                    c.inStock === false ? "opacity-35" : ""
                  }`}
                  style={{ background: c.colorHex }}
                />
              ))}
            </span>
          ) : product.color ? (
            <p className="text-[10px] tracking-[0.2em] uppercase text-midnight/45 mt-1 truncate">
              {product.color}
            </p>
          ) : null}
        </div>
        <p className="text-sm shrink-0 tabular-nums">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}

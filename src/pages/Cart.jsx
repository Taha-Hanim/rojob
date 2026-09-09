import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useLang } from "../context/LangContext";
import { useSiteMode } from "../context/SiteModeContext";
import { formatPrice } from "../data/seed";
import { imgSrc } from "../lib/cloudinary";
import Reveal from "../components/Reveal";
import Seo from "../components/Seo";

export default function Cart() {
  const { items, setQty, remove, total } = useCart();
  const { t } = useLang();
  const { commerceEnabled } = useSiteMode();

  if (!items.length) {
    return (
      <>
        <Seo title={`${t("cart.title")} — ROJOB`} />
        <div className="max-w-3xl mx-auto px-5 py-28 md:py-36 text-center">
          <Reveal>
            <p className="text-[11px] tracking-[0.3em] uppercase text-crimson">{t("cart.title")}</p>
            <h1 className="font-serif text-5xl md:text-6xl mt-4">{t("cart.empty")}</h1>
            <Link
              to="/shop"
              className="inline-block mt-12 text-[11px] tracking-[0.25em] uppercase border-b border-midnight/30 pb-0.5 hover:border-midnight transition-colors"
            >
              {t("cart.continue")}
            </Link>
          </Reveal>
        </div>
      </>
    );
  }

  return (
    <>
      <Seo title={`${t("cart.title")} — ROJOB`} />

      <div className="max-w-5xl mx-auto px-5 py-14 md:py-20">
        <Reveal>
          <p className="text-[11px] tracking-[0.3em] uppercase text-crimson">{t("cart.title")}</p>
          <h1 className="font-serif text-5xl md:text-6xl mt-3">Your bag</h1>
        </Reveal>

        <ul className="mt-12 md:mt-16 divide-y divide-midnight/8">
          {items.map((line) => (
            <Reveal key={line.lineId} as="li" className="py-8 flex gap-5 md:gap-8">
              <div className="w-24 md:w-28 h-32 md:h-36 shrink-0 overflow-hidden bg-white/30">
                {line.image && (
                  <img src={imgSrc(line.image)} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <p className="font-serif text-2xl md:text-3xl">{line.name}</p>
                  <p className="text-[11px] tracking-[0.15em] uppercase text-midnight/50 mt-2">
                    {line.color || line.colorName} · {line.size}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setQty(line.lineId, line.qty - 1)}
                      className="w-8 h-8 border border-midnight/15 hover:border-midnight/40 transition-colors text-sm"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="text-sm tabular-nums w-6 text-center">{line.qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty(line.lineId, line.qty + 1)}
                      className="w-8 h-8 border border-midnight/15 hover:border-midnight/40 transition-colors text-sm"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className="ml-2 text-[10px] tracking-[0.15em] uppercase text-midnight/45 hover:text-crimson transition-colors"
                      onClick={() => remove(line.lineId)}
                    >
                      {t("cart.remove")}
                    </button>
                  </div>
                  <p className="text-sm tabular-nums shrink-0">
                    {formatPrice(line.price != null ? line.price * line.qty : null)}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </ul>

        <Reveal className="mt-12 pt-10 border-t border-midnight/10 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <p className="text-sm text-midnight/50 max-w-xs leading-relaxed">
            Shipping and duties calculated at confirmation.
          </p>
          <div className="text-right">
            <p className="text-[10px] tracking-[0.2em] uppercase text-midnight/45">{t("cart.subtotal")}</p>
            <p className="font-serif text-3xl md:text-4xl mt-2 tabular-nums">{formatPrice(total || null)}</p>
            {commerceEnabled ? (
              <Link
                to="/checkout"
                className="mt-6 inline-block bg-midnight text-porcelain px-12 py-4 text-[11px] tracking-[0.28em] uppercase hover:bg-crimson transition-colors duration-500"
              >
                {t("cart.checkout")}
              </Link>
            ) : (
              <p className="mt-6 text-[11px] tracking-[0.2em] uppercase text-midnight/45">
                {t("home.hero.ctaPrivate")}
              </p>
            )}
          </div>
        </Reveal>
      </div>
    </>
  );
}

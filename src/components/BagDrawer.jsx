import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useLang } from "../context/LangContext";
import { useSiteMode } from "../context/SiteModeContext";
import { useUI } from "../context/UIContext";
import { imgSrc } from "../lib/cloudinary";

export default function BagDrawer() {
  const { bagOpen, setBagOpen } = useUI();
  const { items, setQty, remove, total, hasPricedItems } = useCart();
  const { t } = useLang();
  const { commerceEnabled, formatCurrency } = useSiteMode();

  useEffect(() => {
    document.body.style.overflow = bagOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [bagOpen]);

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-midnight/20 transition-opacity duration-500 ${
          bagOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setBagOpen(false)}
        aria-hidden={!bagOpen}
      />
      <aside
        className={`fixed inset-y-0 right-0 z-[70] w-full max-w-md bg-porcelain border-l border-midnight/10 flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          bagOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!bagOpen}
        aria-label={t("cart.title")}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-midnight/8">
          <span className="text-[10px] tracking-[0.35em] uppercase">{t("cart.title")}</span>
          <button
            type="button"
            onClick={() => setBagOpen(false)}
            className="text-[10px] tracking-[0.28em] uppercase text-midnight/60 hover:text-midnight transition-colors duration-300"
          >
            {t("nav.close")}
          </button>
        </div>

        {!items.length ? (
          <div className="flex-1 grid place-items-center px-6 text-center">
            <p className="font-serif text-2xl text-midnight/70 max-w-xs leading-relaxed">{t("cart.empty")}</p>
            <Link
              to="/shop"
              onClick={() => setBagOpen(false)}
              className="mt-8 text-[10px] tracking-[0.28em] uppercase border-b border-midnight/30 pb-0.5 hover:border-midnight transition-colors duration-300"
            >
              {t("nav.shop")}
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {items.map((line) => (
                <li key={line.lineId} className="flex gap-4">
                  <div className="w-20 h-24 shrink-0 overflow-hidden bg-white/40">
                    {line.image && (
                      <img src={imgSrc(line.image)} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-xl truncate">{line.name}</p>
                    <p className="text-[11px] tracking-[0.12em] text-midnight/50 mt-1">
                      {line.color || line.colorName} · {line.size}
                    </p>
                    <div className="mt-3 flex items-center gap-3 text-sm">
                      <button
                        type="button"
                        onClick={() => setQty(line.lineId, line.qty - 1)}
                        className="w-7 h-7 border border-midnight/15 hover:border-midnight/40 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        —
                      </button>
                      <span className="min-w-[1.25rem] text-center">{line.qty}</span>
                      <button
                        type="button"
                        onClick={() => setQty(line.lineId, line.qty + 1)}
                        className="w-7 h-7 border border-midnight/15 hover:border-midnight/40 transition-colors"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(line.lineId)}
                        className="ml-auto text-[10px] tracking-[0.15em] uppercase text-midnight/45 hover:text-crimson transition-colors"
                      >
                        {t("cart.remove")}
                      </button>
                    </div>
                  </div>
                  <p className="text-sm shrink-0">
                    {formatCurrency(line.price != null ? line.price * line.qty : null)}
                  </p>
                </li>
              ))}
            </ul>

            <div className="px-6 py-6 border-t border-midnight/8 space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] tracking-[0.28em] uppercase text-midnight/50">{t("cart.subtotal")}</span>
                <span className="font-serif text-2xl">
                  {hasPricedItems ? formatCurrency(total) : "—"}
                </span>
              </div>

              {commerceEnabled ? (
                <Link
                  to="/checkout"
                  onClick={() => setBagOpen(false)}
                  className="block w-full text-center bg-midnight text-porcelain py-3.5 text-[10px] tracking-[0.3em] uppercase hover:bg-crimson transition-colors duration-300"
                >
                  {t("cart.checkout")}
                </Link>
              ) : (
                <Link
                  to="/contact"
                  onClick={() => setBagOpen(false)}
                  className="block w-full text-center bg-midnight text-porcelain py-3.5 text-[10px] tracking-[0.3em] uppercase hover:bg-crimson transition-colors duration-300"
                >
                  {t("home.hero.ctaPrivate")}
                </Link>
              )}

              <Link
                to="/cart"
                onClick={() => setBagOpen(false)}
                className="block w-full text-center py-2 text-[10px] tracking-[0.28em] uppercase text-midnight/60 hover:text-midnight transition-colors duration-300"
              >
                {t("cart.viewBag")}
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

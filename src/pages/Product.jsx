import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCatalog } from "../context/CatalogContext";
import { useCart } from "../context/CartContext";
import { useLang } from "../context/LangContext";
import { useSiteMode } from "../context/SiteModeContext";
import { useWishlist } from "../context/WishlistContext";
import { useCurrency } from "../context/CurrencyContext";
import { getColorVariants } from "../lib/catalogFilters";
import { imgSrc } from "../lib/cloudinary";
import Newsletter from "../components/Newsletter";
import Reveal from "../components/Reveal";
import Seo from "../components/Seo";

const SIZE_PLACEHOLDERS = [
  { eur: "XS", us: "[TBC]", uk: "[TBC]" },
  { eur: "S", us: "[TBC]", uk: "[TBC]" },
  { eur: "M", us: "[TBC]", uk: "[TBC]" },
  { eur: "L", us: "[TBC]", uk: "[TBC]" },
  { eur: "XL", us: "[TBC]", uk: "[TBC]" },
];

function AccordionSection({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-t border-midnight/10">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="text-[11px] tracking-[0.22em] uppercase text-midnight/70 group-hover:text-midnight transition-colors">
          {title}
        </span>
        <span className="text-midnight/35 text-lg leading-none">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="pb-6 text-sm text-midnight/70 leading-relaxed">{children}</div>}
    </div>
  );
}

export default function Product() {
  const { slug } = useParams();
  const { products } = useCatalog();
  const { add } = useCart();
  const { t, lang } = useLang();
  const { commerceEnabled } = useSiteMode();
  const { formatPrice } = useCurrency();
  const { toggle, has } = useWishlist();

  const product = products.find((p) => p.slug === slug || p.id === slug);
  const colorVariants = useMemo(
    () => (product ? getColorVariants(products, product) : []),
    [products, product]
  );

  const galleryImages = useMemo(() => {
    if (!product) return [];
    const front = product.images?.front;
    const gallery = product.images?.gallery || [];
    const merged = front ? [front, ...gallery.filter((img) => img !== front)] : gallery;
    return [...new Set(merged.filter(Boolean))];
  }, [product]);

  const [activeImage, setActiveImage] = useState(null);
  const [size, setSize] = useState(null);
  const [added, setAdded] = useState(false);
  const [showPrivate, setShowPrivate] = useState(false);
  const privateRef = useRef(null);

  useEffect(() => {
    setActiveImage(galleryImages[0] ?? null);
    setSize(null);
    setAdded(false);
  }, [slug, galleryImages]);

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-28 text-center">
        <Seo title="Product — ROJOB" />
        <p className="font-serif text-4xl">Piece not found</p>
        <Link
          to="/shop"
          className="inline-block mt-10 text-[11px] tracking-[0.25em] uppercase border-b border-midnight/30 pb-0.5"
        >
          {t("cart.continue")}
        </Link>
      </div>
    );
  }

  const selectedSize = size || product.sizes?.[0];
  const canPurchase =
    commerceEnabled && product.status === "available" && product.price != null;
  const productId = product.id || product.slug;
  const wishlisted = has(productId);
  const description = lang === "pl" && product.descriptionPl ? product.descriptionPl : product.description;

  const addToBag = () => {
    if (!canPurchase || !selectedSize) return;
    add({
      productId,
      slug: product.slug,
      name: product.name,
      color: product.color,
      colorId: product.colorId,
      size: selectedSize,
      image: product.images?.front,
      price: product.price,
      qty: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handlePrivateAccess = () => {
    setShowPrivate(true);
    requestAnimationFrame(() => {
      privateRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  const ctaLabel = canPurchase
    ? added
      ? "Added"
      : t("product.addToBag")
    : product.status === "preview"
      ? t("product.preview")
      : t("home.hero.ctaPrivate");

  const handleCta = () => {
    if (canPurchase) addToBag();
    else handlePrivateAccess();
  };

  return (
    <>
      <Seo
        title={`${product.name} — ${product.color} — ROJOB`}
        description={description}
      />

      <div className="max-w-7xl mx-auto px-5 py-10 md:py-16 pb-28 md:pb-16">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 xl:gap-20">
          {/* Gallery */}
          <Reveal>
            <div className="space-y-3">
              <div className="aspect-[3/4] overflow-hidden bg-white/25">
                {activeImage && (
                  <img
                    key={activeImage}
                    src={imgSrc(activeImage)}
                    alt={`${product.name} — ${product.color}`}
                    className="h-full w-full object-cover animate-fade-in"
                  />
                )}
              </div>
              {galleryImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {galleryImages.map((img) => (
                    <button
                      key={img}
                      type="button"
                      onClick={() => setActiveImage(img)}
                      className={`aspect-[3/4] overflow-hidden border transition-colors duration-300 ${
                        activeImage === img ? "border-midnight" : "border-midnight/10 hover:border-midnight/30"
                      }`}
                    >
                      <img src={imgSrc(img)} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Reveal>

          {/* Details */}
          <Reveal className="lg:pt-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                {product.collection && (
                  <Link
                    to="/collections/cable-cotton"
                    className="text-[10px] tracking-[0.3em] uppercase text-crimson hover:underline"
                  >
                    {product.collection} · {product.collectionCode}
                  </Link>
                )}
                <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl mt-3 leading-[1.05]">
                  {lang === "pl" && product.namePl ? product.namePl : product.name}
                </h1>
                <p className="mt-3 text-[11px] tracking-[0.25em] uppercase text-midnight/50">
                  {product.color}
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggle(productId)}
                aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                className={`mt-2 text-xl transition-colors duration-300 ${
                  wishlisted ? "text-crimson" : "text-midnight/25 hover:text-midnight/50"
                }`}
              >
                {wishlisted ? "♥" : "♡"}
              </button>
            </div>

            <p className="mt-6 text-xl tabular-nums">{formatPrice(product.price)}</p>

            {product.status === "preview" && (
              <p className="mt-2 text-[10px] tracking-[0.22em] uppercase text-midnight/45">
                {t("product.preview")} · {t("common.prelaunch")}
              </p>
            )}

            <p className="mt-8 text-midnight/75 leading-relaxed max-w-md">{description}</p>

            {/* Colour variants */}
            {colorVariants.length > 1 && (
              <div className="mt-10">
                <p className="text-[11px] tracking-[0.2em] uppercase mb-3">{t("product.colour")}</p>
                <div className="flex gap-3 flex-wrap">
                  {colorVariants.map((variant) => {
                    const active = variant.slug === product.slug;
                    return (
                      <Link
                        key={variant.slug}
                        to={`/products/${variant.slug}`}
                        className={`flex items-center gap-2 px-3 py-2 border transition-all duration-300 ${
                          active
                            ? "border-midnight bg-midnight/5"
                            : "border-midnight/15 hover:border-midnight/35"
                        }`}
                        title={variant.color}
                      >
                        <span
                          className="w-5 h-5 rounded-full border border-midnight/15 shrink-0"
                          style={{ background: variant.colorHex }}
                        />
                        <span className="text-[10px] tracking-[0.15em] uppercase">{variant.color}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size */}
            <div className="mt-10">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] tracking-[0.2em] uppercase">{t("product.size")}</p>
                <Link
                  to="/size-guide"
                  className="text-[10px] tracking-[0.18em] uppercase text-midnight/45 hover:text-crimson transition-colors"
                >
                  {t("product.sizeGuide")}
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes?.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`min-w-[3rem] px-4 py-2.5 text-sm border transition-colors duration-300 ${
                      selectedSize === s
                        ? "bg-midnight text-porcelain border-midnight"
                        : "border-midnight/20 hover:border-midnight/45"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:block mt-12">
              <button
                type="button"
                onClick={handleCta}
                disabled={canPurchase && !selectedSize}
                className="w-full bg-crimson text-porcelain py-4 text-[11px] tracking-[0.3em] uppercase hover:bg-midnight transition-colors duration-500 disabled:opacity-40"
              >
                {ctaLabel}
              </button>
              {!canPurchase && (
                <p className="mt-3 text-xs text-midnight/45 text-center">
                  {product.status === "preview"
                    ? "Register for early access when this piece becomes available."
                    : "Private access opens before public release."}
                </p>
              )}
            </div>

            {/* Accordions */}
            <div className="mt-12 md:mt-16">
              <AccordionSection title={t("product.sizeGuide")}>
                <p className="mb-4 text-midnight/55">{t("sizeGuide.note")}</p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[10px] tracking-[0.15em] uppercase text-midnight/45">
                      <th className="py-2 text-left">EUR</th>
                      <th className="text-left">US</th>
                      <th className="text-left">UK</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SIZE_PLACEHOLDERS.map((row) => (
                      <tr key={row.eur} className="border-t border-midnight/5">
                        <td className="py-1.5">{row.eur}</td>
                        <td>{row.us}</td>
                        <td>{row.uk}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </AccordionSection>

              <AccordionSection title={t("product.details")} defaultOpen>
                <ul className="space-y-2">
                  {(product.details || []).map((d) => (
                    <li key={d}>— {d}</li>
                  ))}
                </ul>
                {product.sku && (
                  <p className="mt-4 text-[10px] tracking-[0.15em] uppercase text-midnight/40">
                    {product.sku}
                  </p>
                )}
              </AccordionSection>

              <AccordionSection title={t("product.composition")}>
                <p>{product.fabric || "100% Cotton"}</p>
              </AccordionSection>

              <AccordionSection title={t("product.care")}>
                <p>[Care instructions — to be confirmed]</p>
              </AccordionSection>

              <AccordionSection title={t("product.origin")}>
                <p>
                  {t("product.designedIn")} · {t("product.madeIn")}
                </p>
              </AccordionSection>

              <AccordionSection title={t("product.delivery")}>
                <p>[Delivery & returns — to be confirmed]</p>
              </AccordionSection>
            </div>

            {/* Private access / newsletter */}
            {(showPrivate || !canPurchase) && (
              <div ref={privateRef} className="mt-12 p-6 md:p-8 bg-white/40 border border-midnight/8">
                <Newsletter compact={false} />
                <Link
                  to="/contact"
                  className="inline-block mt-6 text-[10px] tracking-[0.22em] uppercase text-midnight/50 hover:text-crimson border-b border-midnight/20 pb-0.5"
                >
                  {t("nav.contact")} →
                </Link>
              </div>
            )}
          </Reveal>
        </div>
      </div>

      {/* Sticky mobile bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-porcelain/95 backdrop-blur-sm border-t border-midnight/10 px-5 py-4 safe-area-pb">
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-serif text-lg truncate">{product.name}</p>
            <p className="text-sm tabular-nums text-midnight/60">{formatPrice(product.price)}</p>
          </div>
          <button
            type="button"
            onClick={handleCta}
            disabled={canPurchase && !selectedSize}
            className="shrink-0 bg-crimson text-porcelain px-6 py-3.5 text-[10px] tracking-[0.25em] uppercase hover:bg-midnight transition-colors disabled:opacity-40"
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    </>
  );
}

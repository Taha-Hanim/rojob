import { Link } from "react-router-dom";
import { useCatalog } from "../context/CatalogContext";
import { useLang } from "../context/LangContext";
import { useSiteMode } from "../context/SiteModeContext";
import Emblem52N from "../components/Emblem52N";
import ProductCard from "../components/ProductCard";
import Newsletter from "../components/Newsletter";
import Reveal from "../components/Reveal";
import Seo from "../components/Seo";
import Logo from "../components/Logo";

const COLOURS = [
  { key: "porcelain", hex: "#F3EFE7" },
  { key: "crimson", hex: "#9C1D2D" },
  { key: "midnight", hex: "#0D1A2F" },
  { key: "charcoal", hex: "#34373A" },
];

const DETAIL_ITEMS = [
  { image: "/images/packaging.jpg", titleKey: "world.detail.title", copyKey: "world.detail.copy" },
  { image: "/images/detail-knit.jpg", titleKey: "home.material.title", copyKey: "home.material.copy" },
  { type: "emblem", titleKey: "home.detail.emblem", copyKey: "home.detail.emblemCopy" },
  { type: "label", titleKey: "home.detail.label_", copyKey: "home.detail.labelCopy" },
];

export default function Home() {
  const { t } = useLang();
  const { isCommerce } = useSiteMode();
  const { products } = useCatalog();

  const collectionProducts = products.length ? products : [];
  const heroProductSlug = "cable-half-zip-porcelain";

  return (
    <>
      <Seo
        title={`${t("home.hero.title")} — ${t("home.collection.title")} ${t("home.collection.code")}`}
        description={t("home.statement.copy")}
      />

      {/* 1 — Full-screen hero */}
      <section className="relative min-h-[100svh] flex flex-col justify-end overflow-hidden">
        <img
          src="/images/hero-editorial.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover animate-image-scale"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-midnight/80 via-midnight/20 to-midnight/5" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-5 pt-[5.5rem] md:pt-[6rem] pb-16 md:pb-24 text-porcelain">
          <p className="text-[10px] tracking-[0.42em] uppercase text-porcelain/70 animate-fade-up">
            {t("home.warsaw.title").toUpperCase()} · {t("home.warsaw.coordinate")}
          </p>
          <h1 className="font-serif text-[clamp(4rem,14vw,9rem)] leading-[0.92] tracking-[0.08em] mt-3 animate-fade-up delay-1">
            {t("home.hero.title")}
          </h1>
          <p className="mt-5 text-[10px] tracking-[0.38em] uppercase text-porcelain/75 animate-fade-up delay-2">
            {t("home.hero.collection").toUpperCase()} / {t("home.hero.year")}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 animate-fade-up delay-3">
            <Link
              to="/collections/cable-cotton"
              className="link-underline text-[10px] tracking-[0.28em] uppercase text-porcelain/90 hover:text-porcelain transition-colors duration-300"
            >
              {t("home.hero.ctaDiscover")}
            </Link>
            {!isCommerce && (
              <a
                href="#newsletter"
                className="link-underline text-[10px] tracking-[0.28em] uppercase text-porcelain/55 hover:text-porcelain/80 transition-colors duration-300"
              >
                {t("home.hero.ctaPrivate")}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* 2 — Brand statement */}
      <section className="py-28 md:py-40 lg:py-48">
        <div className="max-w-4xl mx-auto px-5 text-center">
          <Reveal>
            <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl leading-tight tracking-[0.02em]">
              {t("home.statement.line1")}
              <br />
              {t("home.statement.line2")}
            </h2>
            <p className="mt-10 md:mt-14 text-sm md:text-base text-midnight/60 leading-[1.9] max-w-xl mx-auto">
              {t("home.statement.copy")}
            </p>
          </Reveal>
        </div>
      </section>

      {/* 3 — Signature 52°N emblem */}
      <section className="py-24 md:py-32 border-t border-midnight/8">
        <div className="max-w-7xl mx-auto px-5">
          <Reveal className="flex flex-col items-center text-center">
            <p className="text-[10px] tracking-[0.35em] uppercase text-crimson">
              {t("home.emblem.label")}
            </p>
            <div className="mt-12">
              <Emblem52N size="hero" animated />
            </div>
            <p className="mt-10 font-serif text-[10px] md:text-[11px] tracking-[0.42em] uppercase leading-[1.8] text-midnight/70">
              A higher
              <br />
              standard
              <br />
              in everyday life
            </p>
            <h2 className="font-serif text-3xl md:text-4xl mt-10">{t("home.emblem.title")}</h2>
            <p className="mt-5 text-sm text-midnight/55 leading-relaxed max-w-md">
              {t("home.emblem.subtitle")}
            </p>
          </Reveal>
        </div>
      </section>

      {/* 4 — Shop the first collection */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-5">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14 md:mb-16">
              <div>
                <p className="text-[10px] tracking-[0.35em] uppercase text-crimson">
                  {t("home.collection.label")}
                </p>
                <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl mt-3">
                  {t("home.collection.title")}
                </h2>
                <p className="mt-2 text-[11px] tracking-[0.3em] uppercase text-midnight/45">
                  {t("home.collection.code")}
                </p>
              </div>
              <p className="text-sm text-midnight/55 max-w-sm leading-relaxed">
                {t("home.collection.copy")}
              </p>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 md:gap-y-14">
            {collectionProducts.map((product) => (
              <Reveal key={product.id || product.slug}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-16 md:mt-20 text-center">
            <Link
              to="/collections/cable-cotton"
              className="link-underline text-[10px] tracking-[0.28em] uppercase text-midnight/70 hover:text-midnight transition-colors duration-300"
            >
              {t("home.collection.cta")}
            </Link>
          </Reveal>
        </div>
      </section>

      {/* 5 — Hero product story */}
      <section className="py-20 md:py-28 bg-white/20">
        <div className="max-w-7xl mx-auto px-5">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            <Reveal className="lg:col-span-7">
              <div className="overflow-hidden">
                <img
                  src="/images/half-zip-porcelain.jpg"
                  alt={t("home.heroProduct.title")}
                  className="w-full aspect-[4/5] object-cover"
                />
              </div>
            </Reveal>

            <Reveal className="lg:col-span-5 lg:pt-8">
              <p className="text-[10px] tracking-[0.35em] uppercase text-crimson">
                {t("home.heroProduct.label")}
              </p>
              <h2 className="font-serif text-4xl md:text-5xl mt-4">{t("home.heroProduct.title")}</h2>
              <p className="mt-6 text-sm text-midnight/60 leading-[1.85]">
                {t("home.heroProduct.copy")}
              </p>

              <div className="mt-10 grid grid-cols-2 gap-3">
                <div className="overflow-hidden">
                  <img
                    src="/images/detail-knit.jpg"
                    alt=""
                    className="w-full aspect-square object-cover"
                  />
                </div>
                <div className="overflow-hidden">
                  <img
                    src="/images/half-zip-midnight.jpg"
                    alt=""
                    className="w-full aspect-square object-cover"
                  />
                </div>
              </div>

              <Link
                to={`/products/${heroProductSlug}`}
                className="link-underline inline-block mt-10 text-[10px] tracking-[0.28em] uppercase text-midnight/70 hover:text-midnight transition-colors duration-300"
              >
                {t("common.learnMore")}
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 6 — Material */}
      <section className="py-24 md:py-32">
        <div className="max-w-3xl mx-auto px-5 text-center">
          <Reveal>
            <p className="text-[10px] tracking-[0.35em] uppercase text-crimson">
              {t("home.material.label")}
            </p>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl mt-4">
              {t("home.material.title")}
            </h2>
            <p className="mt-8 text-sm md:text-base text-midnight/60 leading-[1.9]">
              {t("home.material.copy")}
            </p>
            <p className="mt-8 text-[11px] tracking-[0.28em] uppercase text-midnight/45">
              {t("home.material.note")}
            </p>
          </Reveal>
        </div>
      </section>

      {/* 7 — Warsaw story */}
      <section className="relative py-28 md:py-40 overflow-hidden">
        <img
          src="/images/lookbook-street.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-midnight/75" />
        <div className="relative z-10 max-w-3xl mx-auto px-5 text-center text-porcelain">
          <Reveal>
            <p className="text-[10px] tracking-[0.35em] uppercase text-porcelain/50">
              {t("home.warsaw.label")}
            </p>
            <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl mt-4 tracking-[0.04em]">
              {t("home.warsaw.title")}
            </h2>
            <p className="mt-2 text-[11px] tracking-[0.38em] uppercase text-porcelain/60">
              {t("home.warsaw.coordinate")}
            </p>
            <p className="mt-10 text-sm md:text-base text-porcelain/75 leading-[1.9]">
              {t("home.warsaw.copy")}
            </p>
            <p className="mt-10 text-[10px] tracking-[0.32em] uppercase text-porcelain/45">
              {t("home.warsaw.coords")}
            </p>
          </Reveal>
        </div>
      </section>

      {/* 8 — Detail is identity */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-5">
          <Reveal className="mb-14 md:mb-16 text-center md:text-left">
            <p className="text-[10px] tracking-[0.35em] uppercase text-crimson">
              {t("home.detail.label")}
            </p>
            <h2 className="font-serif text-4xl md:text-5xl mt-3">{t("home.detail.title")}</h2>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6">
            {DETAIL_ITEMS.map((item) => (
              <Reveal key={item.titleKey}>
                {item.type === "emblem" ? (
                  <div className="flex flex-col items-center justify-center aspect-[3/4] bg-white/30 px-6 text-center">
                    <Emblem52N size="lg" />
                    <p className="mt-8 text-[10px] tracking-[0.25em] uppercase text-midnight/45">
                      {t(item.titleKey)}
                    </p>
                    <p className="mt-3 text-sm text-midnight/60 leading-relaxed">
                      {t(item.copyKey)}
                    </p>
                  </div>
                ) : item.type === "label" ? (
                  <div className="flex flex-col justify-between aspect-[3/4] bg-midnight p-6 text-porcelain">
                    <div className="flex-1 flex items-center justify-center">
                      <Logo
                        variant="primary"
                        light
                        showLocation
                        showEmblem
                        size="sm"
                        as="div"
                        to=""
                      />
                    </div>
                    <div>
                      <p className="text-[10px] tracking-[0.25em] uppercase text-porcelain/45">
                        {t(item.titleKey)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <figure>
                    <div className="overflow-hidden aspect-[3/4] bg-white/30">
                      <img
                        src={item.image}
                        alt={t(item.titleKey)}
                        className="h-full w-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.02]"
                      />
                    </div>
                    <figcaption className="mt-5">
                      <p className="text-[10px] tracking-[0.25em] uppercase text-midnight/45">
                        {t(item.titleKey)}
                      </p>
                      <p className="mt-2 text-sm text-midnight/60 leading-relaxed line-clamp-3">
                        {t(item.copyKey)}
                      </p>
                    </figcaption>
                  </figure>
                )}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 9 — Colour story */}
      <section className="py-24 md:py-32 border-t border-midnight/8">
        <div className="max-w-7xl mx-auto px-5">
          <Reveal className="text-center mb-14 md:mb-16">
            <p className="text-[10px] tracking-[0.35em] uppercase text-crimson">
              {t("home.colour.label")}
            </p>
          </Reveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6 max-w-3xl mx-auto">
            {COLOURS.map(({ key, hex }) => (
              <Reveal key={key} className="text-center">
                <div
                  className="mx-auto w-full aspect-square max-w-[8rem] rounded-full border border-midnight/10"
                  style={{ backgroundColor: hex }}
                />
                <p className="mt-5 text-[10px] tracking-[0.28em] uppercase text-midnight/55">
                  {t(`home.colour.${key}`)}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 10 — Collection campaign */}
      <section className="relative">
        <div className="overflow-hidden">
          <img
            src="/images/lookbook-street.jpg"
            alt={t("home.campaign.title")}
            className="w-full h-[70vh] md:h-[85vh] object-cover"
          />
        </div>
        <div className="absolute inset-0 flex items-end pointer-events-none">
          <div className="max-w-7xl mx-auto px-5 pb-12 md:pb-16 w-full">
            <Reveal>
              <p className="text-[10px] tracking-[0.35em] uppercase text-porcelain/60">
                {t("home.campaign.label")}
              </p>
              <h2 className="font-serif text-3xl md:text-4xl text-porcelain mt-3">
                {t("home.campaign.title")}
              </h2>
            </Reveal>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-midnight/50 via-transparent to-transparent pointer-events-none" />
      </section>

      {/* 11 — Newsletter */}
      <section id="newsletter" className="py-24 md:py-32">
        <div className="max-w-xl mx-auto px-5">
          <Reveal>
            <Newsletter />
          </Reveal>
        </div>
      </section>
    </>
  );
}

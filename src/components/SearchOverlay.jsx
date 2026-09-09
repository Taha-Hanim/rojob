import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useCatalog } from "../context/CatalogContext";
import { useLang } from "../context/LangContext";
import { useSiteMode } from "../context/SiteModeContext";
import { useUI } from "../context/UIContext";
import { formatPrice } from "../lib/format";

const journalEntries = [
  { slug: "warsaw-light", titleKey: "journal.categories.warsaw", href: "/journal/warsaw-light" },
  { slug: "cable-notes", titleKey: "journal.categories.material", href: "/journal/cable-notes" },
  { slug: "52n-emblem", titleKey: "journal.categories.fiftyTwo", href: "/journal/52n-emblem" },
];

const collectionEntries = [
  { slug: "cable-cotton", titleKey: "home.collection.title", href: "/collections/cable-cotton" },
  { slug: "first-collection", titleKey: "home.hero.collection", href: "/collections/first-collection" },
];

export default function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useUI();
  const { t } = useLang();
  const { products } = useCatalog();
  const { formatCurrency } = useSiteMode();
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = searchOpen ? "hidden" : "";
    if (searchOpen) {
      setQuery("");
      requestAnimationFrame(() => inputRef.current?.focus());
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [searchOpen]);

  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!q) return { products: [], collections: [], journal: [] };

    const productHits = products.filter((p) => p.name?.toLowerCase().includes(q)).slice(0, 6);

    const catalogCollections = [
      ...new Set(products.map((p) => p.collection).filter(Boolean)),
    ].map((title) => ({
      slug: title.toLowerCase().replace(/\s+/g, "-"),
      title,
      href: `/collections/${title.toLowerCase().replace(/\s+/g, "-")}`,
    }));

    const collectionHits = [...collectionEntries, ...catalogCollections]
      .filter((c, i, arr) => arr.findIndex((x) => x.slug === c.slug) === i)
      .filter((c) => {
        const label = c.title ?? t(c.titleKey);
        return label.toLowerCase().includes(q);
      })
      .slice(0, 4);

    const journalHits = journalEntries
      .filter((j) => t(j.titleKey).toLowerCase().includes(q))
      .slice(0, 4);

    return { products: productHits, collections: collectionHits, journal: journalHits };
  }, [q, products, t]);

  const hasResults =
    results.products.length + results.collections.length + results.journal.length > 0;

  return (
    <div
      className={`fixed inset-0 z-[80] bg-porcelain transition-opacity duration-500 ${
        searchOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      aria-hidden={!searchOpen}
    >
      <div className="max-w-3xl mx-auto px-5 pt-8 md:pt-14">
        <div className="flex items-center justify-between mb-10">
          <span className="text-[10px] tracking-[0.35em] uppercase text-midnight/40">{t("search.title")}</span>
          <button
            type="button"
            onClick={() => setSearchOpen(false)}
            className="text-[10px] tracking-[0.28em] uppercase text-midnight/60 hover:text-midnight transition-colors duration-300"
          >
            {t("nav.close")}
          </button>
        </div>

        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("search.placeholder")}
          className="w-full bg-transparent border-b border-midnight/20 pb-4 font-serif text-3xl md:text-5xl text-midnight placeholder:text-midnight/25 focus:outline-none focus:border-midnight/50 transition-colors duration-300"
        />

        <div className="mt-12 space-y-10 overflow-y-auto max-h-[60vh]">
          {q && !hasResults && (
            <p className="text-sm text-midnight/50 tracking-[0.12em]">{t("search.noResults")}</p>
          )}

          {results.products.length > 0 && (
            <section>
              <h3 className="text-[10px] tracking-[0.3em] uppercase text-midnight/40 mb-4">{t("search.products")}</h3>
              <ul className="space-y-3">
                {results.products.map((p) => (
                  <li key={p.id || p.slug}>
                    <Link
                      to={`/products/${p.slug || p.id}`}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-baseline justify-between gap-4 group"
                    >
                      <span className="font-serif text-2xl group-hover:text-crimson transition-colors duration-300">
                        {p.name}
                      </span>
                      <span className="text-sm text-midnight/50">{formatCurrency(p.price)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {results.collections.length > 0 && (
            <section>
              <h3 className="text-[10px] tracking-[0.3em] uppercase text-midnight/40 mb-4">
                {t("search.collections")}
              </h3>
              <ul className="space-y-2">
                {results.collections.map((c) => (
                  <li key={c.slug}>
                    <Link
                      to={c.href}
                      onClick={() => setSearchOpen(false)}
                      className="text-lg text-midnight/80 hover:text-crimson transition-colors duration-300"
                    >
                      {c.title ?? t(c.titleKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {results.journal.length > 0 && (
            <section>
              <h3 className="text-[10px] tracking-[0.3em] uppercase text-midnight/40 mb-4">{t("search.stories")}</h3>
              <ul className="space-y-2">
                {results.journal.map((j) => (
                  <li key={j.slug}>
                    <Link
                      to={j.href}
                      onClick={() => setSearchOpen(false)}
                      className="text-lg text-midnight/80 hover:text-crimson transition-colors duration-300"
                    >
                      {t(j.titleKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

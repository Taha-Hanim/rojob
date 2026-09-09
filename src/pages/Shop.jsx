import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCatalog } from "../context/CatalogContext";
import { useLang } from "../context/LangContext";
import ProductCard from "../components/ProductCard";
import ProductFilters from "../components/ProductFilters";
import Reveal from "../components/Reveal";
import Seo from "../components/Seo";
import { filterProducts, getCategories, sortProducts } from "../lib/catalogFilters";

export default function Shop() {
  const { products, loading } = useCatalog();
  const { t } = useLang();

  const [category, setCategory] = useState("All");
  const [colorId, setColorId] = useState("All");
  const [size, setSize] = useState("All");
  const [availability, setAvailability] = useState("All");
  const [sort, setSort] = useState("featured");

  const categories = useMemo(() => getCategories(products), [products]);

  const list = useMemo(() => {
    const filtered = filterProducts(products, { category, colorId, size, availability });
    return sortProducts(filtered, sort);
  }, [products, category, colorId, size, availability, sort]);

  return (
    <>
      <Seo
        title="Shop — ROJOB"
        description="ROJOB shop. Cable cotton knits in Porcelain and Midnight — Warsaw, 52°N."
      />

      <div className="max-w-7xl mx-auto px-5 pt-28 md:pt-32 pb-14 md:pb-20">
        <Reveal>
          <p className="text-[11px] tracking-[0.3em] uppercase text-crimson">{t("home.shop.label")}</p>
          <h1 className="font-serif text-5xl md:text-7xl mt-3 leading-[1.05]">{t("home.shop.title")}</h1>
          <p className="mt-6 text-midnight/65 max-w-xl leading-relaxed">
            {t("home.collection.copy")}
          </p>
          <Link
            to="/collections/cable-cotton"
            className="inline-block mt-6 text-[11px] tracking-[0.25em] uppercase text-midnight/50 hover:text-crimson border-b border-midnight/20 hover:border-crimson pb-0.5 transition-colors"
          >
            Cable Cotton · 01 / 2026
          </Link>
        </Reveal>

        <div className="mt-12 md:mt-16">
          <ProductFilters
            categories={categories}
            category={category}
            setCategory={setCategory}
            colorId={colorId}
            setColorId={setColorId}
            size={size}
            setSize={setSize}
            availability={availability}
            setAvailability={setAvailability}
            sort={sort}
            setSort={setSort}
            labels={{
              category: "Category",
              colour: t("product.colour"),
              size: t("product.size"),
              availability: "Availability",
              sort: "Sort",
              all: "All",
            }}
          />
        </div>

        {loading ? (
          <p className="mt-20 text-midnight/45 text-[11px] tracking-[0.2em] uppercase">
            {t("common.loading")}…
          </p>
        ) : list.length === 0 ? (
          <Reveal className="mt-24 py-20 text-center border-t border-midnight/8">
            <p className="font-serif text-3xl text-midnight/70">No pieces match</p>
            <p className="mt-4 text-sm text-midnight/45 max-w-sm mx-auto leading-relaxed">
              Adjust your filters to explore the collection.
            </p>
            <button
              type="button"
              onClick={() => {
                setCategory("All");
                setColorId("All");
                setSize("All");
                setAvailability("All");
              }}
              className="mt-8 text-[11px] tracking-[0.25em] uppercase border-b border-midnight/30 pb-0.5 hover:border-midnight transition-colors"
            >
              Clear filters
            </button>
          </Reveal>
        ) : (
          <div className="mt-14 md:mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14 md:gap-y-20">
            {list.map((p, i) => (
              <Reveal key={p.slug || p.id} className={i % 2 === 1 ? "sm:mt-10 lg:mt-16" : ""}>
                <ProductCard product={p} index={i} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

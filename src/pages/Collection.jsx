import { Link, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { useCatalog } from "../context/CatalogContext";
import { useLang } from "../context/LangContext";
import ProductCard from "../components/ProductCard";
import ProductFilters from "../components/ProductFilters";
import Seo from "../components/Seo";
import Reveal from "../components/Reveal";
import {
  filterProducts,
  getCategories,
  getCollectionProducts,
  sortProducts,
} from "../lib/catalogFilters";

export default function Collection() {
  const { slug } = useParams();
  const { products, loading } = useCatalog();
  const { t } = useLang();

  const [category, setCategory] = useState("All");
  const [colorId, setColorId] = useState("All");
  const [size, setSize] = useState("All");
  const [availability, setAvailability] = useState("All");
  const [sort, setSort] = useState("featured");

  const collectionItems = useMemo(
    () => getCollectionProducts(products, slug),
    [products, slug]
  );

  const categories = useMemo(() => getCategories(collectionItems), [collectionItems]);

  const list = useMemo(
    () =>
      sortProducts(
        filterProducts(collectionItems, { category, colorId, size, availability }),
        sort
      ),
    [collectionItems, category, colorId, size, availability, sort]
  );

  const name = collectionItems[0]?.collection || slug?.replace(/-/g, " ");
  const code = collectionItems[0]?.collectionCode || "01 / 2026";

  if (!loading && !collectionItems.length) {
    return (
      <div className="max-w-7xl mx-auto px-5 pt-32 pb-24 text-center">
        <p className="font-serif text-4xl">Collection not found</p>
        <Link
          to="/collections"
          className="link-underline mt-8 inline-block text-[11px] tracking-[0.28em] uppercase"
        >
          {t("nav.collections")}
        </Link>
      </div>
    );
  }

  return (
    <>
      <Seo title={`${name} — ROJOB`} description={t("home.collection.copy")} />
      <section className="max-w-7xl mx-auto px-5 pt-28 md:pt-32 pb-20">
        <Reveal>
          <Link
            to="/collections"
            className="text-[10px] tracking-[0.3em] uppercase text-midnight/45 hover:text-midnight"
          >
            ← {t("nav.collections")}
          </Link>
          <p className="text-[10px] tracking-[0.35em] uppercase text-crimson mt-8">{code}</p>
          <h1 className="font-serif text-6xl md:text-8xl mt-2 tracking-[0.04em]">{name}</h1>
          <p className="mt-6 max-w-xl text-midnight/65 leading-relaxed">
            {t("home.collection.copy")}
          </p>
        </Reveal>

        <div className="mt-12">
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
          />
        </div>

        {loading ? (
          <p className="mt-16 text-midnight/45 text-sm tracking-[0.2em] uppercase">…</p>
        ) : list.length === 0 ? (
          <p className="mt-16 text-midnight/50">No pieces match these filters.</p>
        ) : (
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
            {list.map((p, i) => (
              <ProductCard key={p.id || p.slug} product={p} index={i} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

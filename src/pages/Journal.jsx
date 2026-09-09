import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useLang } from "../context/LangContext";
import { seedJournal } from "../data/seed";
import Seo from "../components/Seo";
import Reveal from "../components/Reveal";

const CATEGORY_KEYS = {
  Warsaw: "journal.categories.warsaw",
  Material: "journal.categories.material",
  "52°N": "journal.categories.fiftyTwo",
  Objects: "journal.categories.objects",
  People: "journal.categories.people",
  Collections: "journal.categories.collections",
};

function articleTitle(article, lang) {
  return lang === "pl" && article.titlePl ? article.titlePl : article.title;
}

function articleExcerpt(article, lang) {
  return lang === "pl" && article.excerptPl ? article.excerptPl : article.excerpt;
}

function formatDate(dateStr, lang) {
  try {
    return new Date(dateStr).toLocaleDateString(lang === "pl" ? "pl-PL" : "en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function Journal() {
  const { t, lang } = useLang();
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = useMemo(() => {
    const unique = [...new Set(seedJournal.map((a) => a.category))];
    return unique.sort();
  }, []);

  const filtered = useMemo(() => {
    if (activeCategory === "all") return seedJournal;
    return seedJournal.filter((a) => a.category === activeCategory);
  }, [activeCategory]);

  return (
    <>
      <Seo
        title={`${t("journal.title")} — ROJOB`}
        description={t("journal.subtitle")}
      />

      <section className="max-w-7xl mx-auto px-5 py-16 md:py-24">
        <Reveal>
          <p className="text-[11px] tracking-[0.35em] uppercase text-crimson">
            {t("journal.title")}
          </p>
          <h1 className="font-serif text-6xl md:text-7xl mt-3 tracking-[0.08em]">
            {t("journal.title")}
          </h1>
          <p className="mt-5 text-lg text-midnight/70 max-w-xl">
            {t("journal.subtitle")}
          </p>
        </Reveal>

        <Reveal className="mt-12 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={`text-[10px] tracking-[0.28em] uppercase px-4 py-2 border transition-colors ${
              activeCategory === "all"
                ? "border-midnight bg-midnight text-porcelain"
                : "border-midnight/20 hover:border-midnight/50"
            }`}
          >
            {t("common.viewAll")}
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`text-[10px] tracking-[0.28em] uppercase px-4 py-2 border transition-colors ${
                activeCategory === cat
                  ? "border-midnight bg-midnight text-porcelain"
                  : "border-midnight/20 hover:border-midnight/50"
              }`}
            >
              {t(CATEGORY_KEYS[cat] || cat, cat)}
            </button>
          ))}
        </Reveal>

        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
          {filtered.map((article, i) => (
            <Reveal key={article.slug} className={i === 0 ? "md:col-span-2 lg:col-span-2" : ""}>
              <article className="group">
                <Link to={`/journal/${article.slug}`} className="block">
                  <div
                    className={`overflow-hidden bg-white/30 ${
                      i === 0 ? "aspect-[16/9]" : "aspect-[4/5]"
                    }`}
                  >
                    <img
                      src={article.image}
                      alt=""
                      className="h-full w-full object-cover transition duration-[1.2s] ease-out group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="mt-5">
                    <div className="flex items-center gap-3 text-[10px] tracking-[0.28em] uppercase text-midnight/45">
                      <span>{t(CATEGORY_KEYS[article.category] || article.category, article.category)}</span>
                      <span aria-hidden="true">·</span>
                      <time dateTime={article.date}>{formatDate(article.date, lang)}</time>
                    </div>
                    <h2
                      className={`font-serif mt-2 group-hover:text-crimson transition-colors ${
                        i === 0 ? "text-4xl md:text-5xl" : "text-3xl"
                      }`}
                    >
                      {articleTitle(article, lang)}
                    </h2>
                    <p className="mt-3 text-midnight/70 leading-relaxed line-clamp-3">
                      {articleExcerpt(article, lang)}
                    </p>
                    <span className="link-underline mt-4 inline-block text-[10px] tracking-[0.28em] uppercase text-midnight/60">
                      {t("journal.read")}
                    </span>
                  </div>
                </Link>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}

import { Link, useParams } from "react-router-dom";
import { useLang } from "../context/LangContext";
import { seedJournal } from "../data/seed";
import Seo from "../components/Seo";
import Reveal from "../components/Reveal";

function articleField(article, field, lang) {
  const plKey = `${field}Pl`;
  if (lang === "pl" && article[plKey]) return article[plKey];
  return article[field];
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

export default function JournalArticle() {
  const { slug } = useParams();
  const { t, lang } = useLang();
  const article = seedJournal.find((a) => a.slug === slug);

  if (!article) {
    return (
      <>
        <Seo title={`${t("journal.notFound")} — ROJOB`} />
        <section className="min-h-[60vh] flex flex-col items-center justify-center px-5 py-24 text-center">
          <Reveal>
            <p className="text-[11px] tracking-[0.35em] uppercase text-crimson">404</p>
            <h1 className="font-serif text-5xl md:text-6xl mt-4">{t("journal.notFound")}</h1>
            <p className="mt-5 text-midnight/65 max-w-md leading-relaxed">
              {t("journal.notFoundCopy")}
            </p>
            <Link
              to="/journal"
              className="link-underline mt-10 inline-block text-[11px] tracking-[0.28em] uppercase"
            >
              {t("journal.back")}
            </Link>
          </Reveal>
        </section>
      </>
    );
  }

  const title = articleField(article, "title", lang);
  const content = articleField(article, "content", lang);

  return (
    <>
      <Seo title={`${title} — ROJOB`} description={articleField(article, "excerpt", lang)} />

      <article>
        <header className="relative min-h-[55vh] flex items-end overflow-hidden">
          <img
            src={article.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-midnight/85 via-midnight/30 to-transparent" />
          <div className="relative z-10 max-w-4xl mx-auto px-5 pb-14 w-full text-porcelain">
            <Reveal>
              <Link
                to="/journal"
                className="text-[10px] tracking-[0.3em] uppercase text-porcelain/60 hover:text-porcelain transition-colors"
              >
                ← {t("journal.title")}
              </Link>
              <time
                dateTime={article.date}
                className="block mt-8 text-[10px] tracking-[0.3em] uppercase text-porcelain/50"
              >
                {formatDate(article.date, lang)}
              </time>
              <h1 className="font-serif text-5xl md:text-7xl mt-4 tracking-[0.06em]">{title}</h1>
            </Reveal>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-5 py-16 md:py-24">
          <Reveal>
            <div className="prose prose-lg max-w-none">
              {content.split("\n\n").map((paragraph) => (
                <p key={paragraph.slice(0, 24)} className="text-lg leading-[1.85] text-midnight/80 mb-6">
                  {paragraph}
                </p>
              ))}
            </div>
          </Reveal>

          <Reveal className="mt-16 pt-10 border-t border-midnight/10">
            <Link
              to="/journal"
              className="link-underline text-[11px] tracking-[0.28em] uppercase text-midnight/65 hover:text-crimson transition-colors"
            >
              {t("journal.back")}
            </Link>
          </Reveal>
        </div>
      </article>
    </>
  );
}

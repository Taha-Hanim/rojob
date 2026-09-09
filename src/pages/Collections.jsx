import { Link } from "react-router-dom";
import { useLang } from "../context/LangContext";
import Seo from "../components/Seo";
import Reveal from "../components/Reveal";

const FUTURE = [
  "Cable Crew-Neck",
  "Premium Polo",
  "Cable Scarf",
  "Outerwear",
];

export default function Collections() {
  const { t } = useLang();

  return (
    <>
      <Seo
        title={`${t("nav.collections")} — ROJOB`}
        description={t("home.collection.copy")}
      />
      <section className="max-w-7xl mx-auto px-5 pt-28 md:pt-32 pb-20 md:pb-28">
        <Reveal>
          <p className="text-[10px] tracking-[0.35em] uppercase text-crimson">
            {t("home.collection.label")}
          </p>
          <h1 className="font-serif text-6xl md:text-8xl mt-3 tracking-[0.04em]">
            {t("nav.collections")}
          </h1>
        </Reveal>

        <Reveal className="mt-16 md:mt-24">
          <Link to="/collections/cable-cotton" className="group block">
            <div className="relative aspect-[16/10] md:aspect-[21/9] overflow-hidden bg-midnight">
              <img
                src="/images/hero-editorial.jpg"
                alt=""
                className="h-full w-full object-cover opacity-90 transition duration-[1.4s] ease-out group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-midnight/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 md:p-10 text-porcelain">
                <p className="text-[10px] tracking-[0.35em] uppercase text-porcelain/60">
                  {t("home.collection.code")}
                </p>
                <h2 className="font-serif text-4xl md:text-6xl mt-2 tracking-[0.06em]">
                  {t("home.collection.title")}
                </h2>
                <p className="mt-4 max-w-md text-sm text-porcelain/70 leading-relaxed">
                  {t("home.collection.copy")}
                </p>
                <span className="inline-block mt-6 text-[10px] tracking-[0.28em] uppercase link-underline">
                  {t("home.collection.cta")}
                </span>
              </div>
            </div>
          </Link>
        </Reveal>

        <Reveal className="mt-20 md:mt-28">
          <p className="text-[10px] tracking-[0.3em] uppercase text-midnight/40 mb-8">
            Later editions
          </p>
          <ul className="space-y-4 border-t border-midnight/10">
            {FUTURE.map((name) => (
              <li
                key={name}
                className="flex items-baseline justify-between border-b border-midnight/10 py-4 text-midnight/35"
              >
                <span className="font-serif text-2xl md:text-3xl">{name}</span>
                <span className="text-[10px] tracking-[0.25em] uppercase">Coming later</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>
    </>
  );
}

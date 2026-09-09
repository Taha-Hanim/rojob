import { Link } from "react-router-dom";
import { useLang } from "../context/LangContext";
import Seo from "../components/Seo";
import Reveal from "../components/Reveal";
import Emblem52N from "../components/Emblem52N";

function ConstructionBlock({ label, sublabel, className = "" }) {
  return (
    <div className={`group text-center ${className}`}>
      <div className="relative w-16 h-24 md:w-20 md:h-28 mx-auto overflow-hidden rounded-[4px] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]">
        <div className="absolute inset-0 flex flex-col">
          <div className="h-1/2 bg-porcelain" />
          <div className="h-1/2 bg-crimson" />
        </div>
        <span className="absolute inset-x-0 top-0 h-1/2 flex items-center justify-center font-serif text-xl md:text-2xl text-black">
          {label}
        </span>
      </div>
      <p className="mt-4 text-[10px] tracking-[0.3em] uppercase text-midnight/50">{sublabel}</p>
    </div>
  );
}

function GapBlock({ label }) {
  return (
    <div className="group text-center px-2 md:px-4">
      <div className="w-8 md:w-12 h-24 md:h-28 mx-auto border border-dashed border-midnight/20 rounded-[2px] flex items-center justify-center transition-colors duration-500 group-hover:border-crimson/40">
        <span className="sr-only">{label}</span>
      </div>
      <p className="mt-4 text-[10px] tracking-[0.3em] uppercase text-midnight/50 max-w-[8rem] mx-auto leading-relaxed">
        {label}
      </p>
    </div>
  );
}

export default function FiftyTwoN() {
  const { t } = useLang();

  return (
    <>
      <Seo
        title={`${t("fiftyTwo.headline")} — ROJOB`}
        description={t("fiftyTwo.intro")}
      />

      <section className="min-h-[85vh] flex flex-col items-center justify-center px-5 py-24 bg-midnight text-porcelain">
        <Reveal className="text-center">
          <Emblem52N size="xl" animated className="scale-[1.35] md:scale-[1.6] mb-12 md:mb-16" />
          <p className="text-[11px] tracking-[0.45em] uppercase text-porcelain/50">
            {t("fiftyTwo.warsaw")}
          </p>
          <h1 className="font-serif text-6xl md:text-8xl tracking-[0.14em] mt-4">
            {t("fiftyTwo.title")}
          </h1>
          <p className="mt-2 font-serif text-2xl md:text-3xl italic text-porcelain/80">
            {t("fiftyTwo.warsaw")}
          </p>
        </Reveal>
      </section>

      <section className="max-w-3xl mx-auto px-5 py-20 md:py-28">
        <Reveal>
          <p className="text-lg md:text-xl leading-relaxed text-midnight/80 text-center">
            {t("fiftyTwo.intro")}
          </p>
        </Reveal>
      </section>

      <section className="border-y border-midnight/10 bg-white/20 py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-5">
          <Reveal>
            <p className="text-[11px] tracking-[0.35em] uppercase text-crimson text-center">
              {t("fiftyTwo.construction.label")}
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-center mt-3">
              {t("fiftyTwo.construction.title")}
            </h2>
          </Reveal>

          <Reveal className="mt-16 md:mt-20">
            <div className="flex items-end justify-center gap-3 md:gap-6">
              <ConstructionBlock label="52°" sublabel={t("fiftyTwo.left")} />
              <GapBlock label={t("fiftyTwo.gap")} />
              <ConstructionBlock label="N" sublabel={t("fiftyTwo.right")} />
            </div>
          </Reveal>

          <Reveal className="mt-16 grid md:grid-cols-3 gap-8 text-center text-sm text-midnight/70">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-midnight/45 mb-2">
                {t("home.colour.porcelain")}
              </p>
              <p>{t("fiftyTwo.colours.upper")}</p>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-midnight/45 mb-2">
                {t("home.colour.crimson")}
              </p>
              <p>{t("fiftyTwo.colours.lower")}</p>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-midnight/45 mb-2">
                {t("home.colour.charcoal")}
              </p>
              <p>{t("fiftyTwo.colours.lettering")}</p>
            </div>
          </Reveal>

          <Reveal className="mt-12 max-w-2xl mx-auto text-center">
            <p className="text-sm leading-relaxed text-midnight/65 italic">
              {t("fiftyTwo.note")}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 py-20 md:py-28 text-center">
        <Reveal>
          <Link
            to="/world"
            className="link-underline text-[11px] tracking-[0.28em] uppercase text-midnight/70 hover:text-crimson transition-colors"
          >
            {t("world.title")}
          </Link>
        </Reveal>
      </section>
    </>
  );
}

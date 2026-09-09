import { Link } from "react-router-dom";
import { useLang } from "../context/LangContext";
import Seo from "../components/Seo";
import Reveal from "../components/Reveal";

const SIZES = ["XS", "S", "M", "L", "XL"];
const MEASURES = ["chest", "length", "sleeve", "shoulder"];

export default function SizeGuide() {
  const { t } = useLang();
  const placeholder = t("sizeGuide.placeholderCell", "[To be confirmed]");

  return (
    <>
      <Seo title={`${t("sizeGuide.title")} — ROJOB`} description={t("sizeGuide.note")} />

      <section className="max-w-5xl mx-auto px-5 py-16 md:py-24">
        <Reveal>
          <p className="text-[11px] tracking-[0.35em] uppercase text-crimson">{t("sizeGuide.title")}</p>
          <h1 className="font-serif text-6xl md:text-7xl mt-3">{t("sizeGuide.title")}</h1>
          <p className="mt-5 text-midnight/70 max-w-xl">{t("sizeGuide.note")}</p>
        </Reveal>

        <Reveal className="mt-14 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm border-collapse">
            <thead>
              <tr className="border-b border-midnight/15">
                <th className="py-4 pr-6 text-left text-[10px] tracking-[0.28em] uppercase text-midnight/45 font-normal">
                  {t("product.size")}
                </th>
                {MEASURES.map((m) => (
                  <th
                    key={m}
                    className="py-4 px-4 text-left text-[10px] tracking-[0.28em] uppercase text-midnight/45 font-normal"
                  >
                    {t(`sizeGuide.${m}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SIZES.map((size) => (
                <tr key={size} className="border-b border-midnight/8">
                  <td className="py-4 pr-6 font-serif text-xl">{size}</td>
                  {MEASURES.map((m) => (
                    <td key={m} className="py-4 px-4 text-midnight/50 italic">
                      {placeholder}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>

        <Reveal className="mt-20 md:mt-28">
          <h2 className="font-serif text-4xl">{t("sizeGuide.howTo")}</h2>
          <div className="mt-8 grid md:grid-cols-2 gap-10 text-midnight/75 leading-relaxed">
            <div>
              <p className="text-[10px] tracking-[0.28em] uppercase text-midnight/45 mb-2">
                {t("sizeGuide.chest")}
              </p>
              <p>{t("sizeGuide.measure.chest")}</p>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.28em] uppercase text-midnight/45 mb-2">
                {t("sizeGuide.length")}
              </p>
              <p>{t("sizeGuide.measure.length")}</p>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.28em] uppercase text-midnight/45 mb-2">
                {t("sizeGuide.sleeve")}
              </p>
              <p>{t("sizeGuide.measure.sleeve")}</p>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.28em] uppercase text-midnight/45 mb-2">
                {t("sizeGuide.shoulder")}
              </p>
              <p>{t("sizeGuide.measure.shoulder")}</p>
            </div>
          </div>
        </Reveal>

        <Reveal className="mt-16">
          <Link
            to="/contact"
            className="link-underline text-[11px] tracking-[0.28em] uppercase text-midnight/65 hover:text-crimson transition-colors"
          >
            {t("contact.title")}
          </Link>
        </Reveal>
      </section>
    </>
  );
}

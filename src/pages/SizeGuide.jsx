import { Link } from "react-router-dom";
import { useLang } from "../context/LangContext";
import Seo from "../components/Seo";
import Reveal from "../components/Reveal";
import {
  ACCESSORY_MEASUREMENTS,
  FIT_NOTE,
  GARMENT_MEASUREMENTS,
  SIZE_CONVERSIONS,
} from "../data/productInfo";

const MEASURES = ["chest", "length", "sleeve", "shoulder"];

function Table({ head, children }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm border-collapse tabular-nums">
        <thead>
          <tr className="border-b border-midnight/15">
            {head.map((label) => (
              <th
                key={label}
                className="py-4 pr-6 text-left text-[10px] tracking-[0.28em] uppercase text-midnight/45 font-normal"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export default function SizeGuide() {
  const { t, lang } = useLang();
  const accessories = ACCESSORY_MEASUREMENTS[lang] || ACCESSORY_MEASUREMENTS.en;

  return (
    <>
      <Seo title={`${t("sizeGuide.title")} — ROJOB`} description={t("sizeGuide.note")} />

      <section className="max-w-5xl mx-auto px-5 py-16 md:py-24">
        <Reveal>
          <p className="text-[11px] tracking-[0.35em] uppercase text-crimson">{t("sizeGuide.title")}</p>
          <h1 className="font-serif text-6xl md:text-7xl mt-3">{t("sizeGuide.title")}</h1>
          <p className="mt-5 text-midnight/70 max-w-xl">{t("sizeGuide.note")}</p>
        </Reveal>

        <Reveal className="mt-14">
          <h2 className="text-[10px] tracking-[0.28em] uppercase text-midnight/45 mb-5">
            {t("sizeGuide.conversions")}
          </h2>
          <Table head={[t("product.size"), "EU", "UK", "US", "IT", `${t("sizeGuide.bodyChest")} (cm)`]}>
            {SIZE_CONVERSIONS.map((row) => (
              <tr key={row.size} className="border-b border-midnight/8">
                <td className="py-4 pr-6 font-serif text-xl">{row.size}</td>
                <td className="py-4 pr-6 text-midnight/70">{row.eu}</td>
                <td className="py-4 pr-6 text-midnight/70">{row.uk}</td>
                <td className="py-4 pr-6 text-midnight/70">{row.us}</td>
                <td className="py-4 pr-6 text-midnight/70">{row.it}</td>
                <td className="py-4 pr-6 text-midnight/70">{row.chestCm}</td>
              </tr>
            ))}
          </Table>
        </Reveal>

        <Reveal className="mt-16">
          <h2 className="text-[10px] tracking-[0.28em] uppercase text-midnight/45 mb-5">
            {t("sizeGuide.garmentFlat")}
          </h2>
          <Table head={[t("product.size"), ...MEASURES.map((m) => t(`sizeGuide.${m}`))]}>
            {GARMENT_MEASUREMENTS.top.map((row) => (
              <tr key={row.size} className="border-b border-midnight/8">
                <td className="py-4 pr-6 font-serif text-xl">{row.size}</td>
                <td className="py-4 pr-6 text-midnight/70">{row.chest}</td>
                <td className="py-4 pr-6 text-midnight/70">{row.length}</td>
                <td className="py-4 pr-6 text-midnight/70">{row.sleeve}</td>
                <td className="py-4 pr-6 text-midnight/70">{row.shoulder}</td>
              </tr>
            ))}
          </Table>
          <p className="mt-6 text-sm text-midnight/60 max-w-2xl leading-relaxed">
            {FIT_NOTE[lang] || FIT_NOTE.en}
          </p>
        </Reveal>

        <Reveal className="mt-16">
          <h2 className="text-[10px] tracking-[0.28em] uppercase text-midnight/45 mb-5">
            {t("sizeGuide.accessories")}
          </h2>
          <dl className="max-w-xl">
            {accessories.map((row) => (
              <div key={row.label} className="flex justify-between gap-8 border-b border-midnight/8 py-4">
                <dt className="text-midnight/70">{row.label}</dt>
                <dd className="text-right tabular-nums">{row.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 text-sm text-midnight/60">{t("sizeGuide.accessoriesNote")}</p>
        </Reveal>

        <Reveal className="mt-20 md:mt-28">
          <h2 className="font-serif text-4xl">{t("sizeGuide.howTo")}</h2>
          <div className="mt-8 grid md:grid-cols-2 gap-10 text-midnight/75 leading-relaxed">
            {MEASURES.map((m) => (
              <div key={m}>
                <p className="text-[10px] tracking-[0.28em] uppercase text-midnight/45 mb-2">
                  {t(`sizeGuide.${m}`)}
                </p>
                <p>{t(`sizeGuide.measure.${m}`)}</p>
              </div>
            ))}
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

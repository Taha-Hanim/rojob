import { Link } from "react-router-dom";
import { useLang } from "../context/LangContext";
import Seo from "../components/Seo";
import Reveal from "../components/Reveal";
import Emblem52N from "../components/Emblem52N";
import Newsletter from "../components/Newsletter";
import Logo from "../components/Logo";

const sections = [
  { id: "rojob", labelKey: "world.rojob.title", copyKey: "world.rojob.copy" },
  { id: "warsaw", labelKey: "world.warsaw.title", copyKey: "world.warsaw.copy" },
  { id: "fifty-two", labelKey: "world.fiftyTwo.title", copyKey: "world.fiftyTwo.copy", link: "/52n" },
  { id: "design", labelKey: "world.design.title", copyKey: "world.design.copy" },
  { id: "material", labelKey: "world.material.title", copyKey: "world.material.copy" },
  { id: "detail", labelKey: "world.detail.title", copyKey: "world.detail.copy" },
  { id: "emblem", labelKey: "world.emblem.title", copyKey: "world.emblem.copy", link: "/52n" },
];

export default function World() {
  const { t } = useLang();

  return (
    <>
      <Seo
        title={`${t("world.title")} — ROJOB`}
        description={t("world.intro")}
      />

      <section className="relative min-h-[70vh] flex items-end overflow-hidden">
        <img
          src="/images/lookbook-street.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover animate-image-scale"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-midnight/90 via-midnight/35 to-midnight/15" />
        <div className="relative z-10 max-w-7xl mx-auto px-5 pb-16 md:pb-24 w-full text-porcelain">
          <Reveal>
            <Logo
              variant="stacked"
              light
              showLocation
              showEmblem={false}
              size="lg"
              to=""
              as="div"
            />
            <p className="text-[11px] tracking-[0.4em] uppercase text-porcelain/70 mt-10">
              {t("world.est")}
            </p>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-porcelain/85">
              {t("world.intro")}
            </p>
          </Reveal>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-5 py-20 md:py-28">
        {sections.map((section, i) => (
          <Reveal key={section.id} className={i > 0 ? "mt-24 md:mt-32" : ""}>
            <article id={section.id} className="grid md:grid-cols-12 gap-8 md:gap-12 items-start">
              <div className="md:col-span-4">
                <p className="text-[11px] tracking-[0.35em] uppercase text-crimson">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h2 className="font-serif text-4xl md:text-5xl mt-3 tracking-[0.06em]">
                  {t(section.labelKey)}
                </h2>
                {section.id === "fifty-two" && (
                  <div className="mt-8">
                    <Emblem52N size="lg" animated />
                  </div>
                )}
              </div>
              <div className="md:col-span-8 md:pt-2">
                <p className="text-lg leading-relaxed text-midnight/80 max-w-2xl">
                  {t(section.copyKey)}
                </p>
                {section.link && (
                  <Link
                    to={section.link}
                    className="link-underline mt-8 inline-block text-[11px] tracking-[0.28em] uppercase text-midnight/70 hover:text-crimson transition-colors"
                  >
                    {t("common.learnMore")}
                  </Link>
                )}
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      <section className="bg-midnight text-porcelain py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-5 grid md:grid-cols-2 gap-12 items-center">
          <Reveal>
            <p className="text-[11px] tracking-[0.35em] uppercase text-porcelain/45">
              {t("home.warsaw.coordinate")}
            </p>
            <p className="font-serif text-4xl md:text-5xl mt-4 italic">
              {t("world.coordinate")}
            </p>
            <p className="mt-6 text-porcelain/70 leading-relaxed max-w-md">
              {t("home.warsaw.coords")}
            </p>
          </Reveal>
          <Reveal className="flex justify-center md:justify-end">
            <Emblem52N size="xl" animated className="opacity-95" />
          </Reveal>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 py-20 md:py-28">
        <Reveal className="max-w-lg mx-auto text-center">
          <Newsletter />
        </Reveal>
      </section>
    </>
  );
}

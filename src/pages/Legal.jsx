import { Link } from "react-router-dom";
import { useLang } from "../context/LangContext";
import Seo from "../components/Seo";
import Reveal from "../components/Reveal";

const LEGAL_NAV = [
  { type: "terms", path: "/terms" },
  { type: "privacy", path: "/privacy" },
  { type: "cookies", path: "/cookies" },
  { type: "delivery-returns", path: "/delivery-returns" },
  { type: "payments", path: "/payments" },
  { type: "complaints", path: "/complaints" },
  { type: "company", path: "/company" },
];

const TITLE_KEYS = {
  terms: "legal.terms",
  privacy: "legal.privacy",
  cookies: "legal.cookies",
  "delivery-returns": "legal.deliveryReturns",
  payments: "legal.payments",
  complaints: "legal.complaints",
  company: "legal.company",
};

const BODY_KEYS = {
  terms: "legal.bodies.terms",
  privacy: "legal.bodies.privacy",
  cookies: "legal.bodies.cookies",
  "delivery-returns": "legal.bodies.deliveryReturns",
  payments: "legal.bodies.payments",
  complaints: "legal.bodies.complaints",
  company: "legal.bodies.company",
};

export default function Legal({ type = "terms" }) {
  const { t } = useLang();
  const title = t(TITLE_KEYS[type] || "legal.terms");
  const body = t(BODY_KEYS[type] || "legal.bodies.terms");

  const placeholders = {
    company: t("legal.placeholders.company"),
    nip: t("legal.placeholders.nip"),
    regon: t("legal.placeholders.regon"),
    address: t("legal.placeholders.address"),
    email: t("legal.placeholders.email"),
  };

  const renderedBody = body
    .replace(/\[LEGAL COMPANY NAME\]/g, placeholders.company)
    .replace(/\[NAZWA PRAWNA FIRMY\]/g, placeholders.company)
    .replace(/\[NIP\]/g, placeholders.nip)
    .replace(/\[REGON\/KRS\]/g, placeholders.regon)
    .replace(/\[REGISTERED ADDRESS\]/g, placeholders.address)
    .replace(/\[ADRES REJESTROWY\]/g, placeholders.address)
    .replace(/\[CONTACT EMAIL\]/g, placeholders.email)
    .replace(/\[ADRES E-MAIL KONTAKTOWY\]/g, placeholders.email);

  return (
    <>
      <Seo title={`${title} — ROJOB`} description={t("legal.reviewNote")} />

      <section className="max-w-7xl mx-auto px-5 py-16 md:py-24">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
          <aside className="lg:col-span-3">
            <Reveal>
              <p className="text-[10px] tracking-[0.32em] uppercase text-midnight/45 mb-6">
                {t("legal.nav")}
              </p>
              <nav>
                <ul className="space-y-2 text-sm">
                  {LEGAL_NAV.map((item) => (
                    <li key={item.type}>
                      <Link
                        to={item.path}
                        className={`transition-colors ${
                          item.type === type
                            ? "text-crimson"
                            : "text-midnight/65 hover:text-midnight"
                        }`}
                      >
                        {t(TITLE_KEYS[item.type])}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </Reveal>
          </aside>

          <article className="lg:col-span-9">
            <Reveal>
              <div className="mb-8 p-4 border border-crimson/30 bg-crimson/5 text-sm text-midnight/80">
                {t("legal.reviewNote")}
              </div>

              <h1 className="font-serif text-5xl md:text-6xl">{title}</h1>

              <div className="mt-10 space-y-6 text-midnight/80 leading-relaxed">
                {renderedBody.split("\n\n").map((paragraph) => (
                  <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                ))}
              </div>

              <div className="mt-12 pt-8 border-t border-midnight/10 text-sm text-midnight/55 space-y-1">
                <p>{placeholders.company}</p>
                <p>{placeholders.nip} · {placeholders.regon}</p>
                <p>{placeholders.address}</p>
                <p>{placeholders.email}</p>
              </div>
            </Reveal>
          </article>
        </div>
      </section>
    </>
  );
}

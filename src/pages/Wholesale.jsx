import { useEffect, useId, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useLang } from "../context/LangContext";
import { db, isFirebaseConfigured } from "../lib/firebase";
import { wholesaleTermsEn, wholesaleTermsPl } from "../data/wholesaleTerms";
import Seo from "../components/Seo";
import Reveal from "../components/Reveal";
import Emblem52N from "../components/Emblem52N";

const WHOLESALE_KEY = "rojob_wholesale_applications";

const FIELD =
  "mt-2 w-full bg-transparent border-b border-midnight/20 py-3 text-sm text-midnight outline-none focus:border-midnight/55 transition-colors placeholder:text-midnight/25";

function applyPlaceholders(text, p) {
  return text
    .replace(/\[LEGAL COMPANY NAME\]/g, p.company)
    .replace(/\[NAZWA PRAWNA FIRMY\]/g, p.company)
    .replace(/\[NIP\]/g, p.nip)
    .replace(/\[REGON\/KRS\]/g, p.regon)
    .replace(/\[REGISTERED ADDRESS\]/g, p.address)
    .replace(/\[ADRES REJESTROWY\]/g, p.address)
    .replace(/\[CONTACT EMAIL\]/g, p.email)
    .replace(/\[ADRES E-MAIL KONTAKTOWY\]/g, p.email);
}

function TermsModal({ open, onClose, sections, t, placeholders }) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center">
      <button
        type="button"
        aria-label={t("wholesale.closeTerms")}
        className="absolute inset-0 bg-midnight/55 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full sm:max-w-2xl md:max-w-3xl max-h-[88vh] sm:max-h-[85vh] flex flex-col bg-porcelain text-midnight shadow-2xl sm:mx-5"
      >
        <header className="shrink-0 flex items-start justify-between gap-6 px-6 md:px-8 pt-6 md:pt-8 pb-4 border-b border-midnight/10">
          <div>
            <p className="text-[10px] tracking-[0.32em] uppercase text-crimson">
              {t("wholesale.label")}
            </p>
            <h2 id={titleId} className="font-serif text-3xl md:text-4xl mt-2">
              {t("wholesale.termsTitle")}
            </h2>
            <p className="mt-2 text-[10px] tracking-[0.24em] uppercase text-midnight/45">
              {t("wholesale.termsEffective")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[10px] tracking-[0.28em] uppercase text-midnight/55 hover:text-midnight transition-colors pt-1"
          >
            {t("wholesale.closeTerms")}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 md:px-8 py-8 space-y-10">
          <p className="text-xs text-midnight/55 leading-relaxed">{t("wholesale.legalNote")}</p>
          {sections.map((section) => (
            <article key={section.id}>
              <h3 className="font-serif text-lg md:text-xl">{section.title}</h3>
              <div className="mt-3 space-y-3 text-sm text-midnight/70 leading-[1.8]">
                {section.body.split("\n\n").map((para) => (
                  <p key={para.slice(0, 48)}>{para}</p>
                ))}
              </div>
            </article>
          ))}
          <div className="pt-6 border-t border-midnight/10 text-xs text-midnight/50 space-y-1">
            <p>{placeholders.company}</p>
            <p>
              {placeholders.nip} · {placeholders.regon}
            </p>
            <p>{placeholders.address}</p>
            <p>{placeholders.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Wholesale() {
  const { t, lang } = useLang();
  const [status, setStatus] = useState("idle");
  const [accepted, setAccepted] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [form, setForm] = useState({
    company: "",
    nip: "",
    contactName: "",
    email: "",
    phone: "",
    country: "",
    website: "",
    message: "",
  });

  const placeholders = {
    company: t("legal.placeholders.company"),
    nip: t("legal.placeholders.nip"),
    regon: t("legal.placeholders.regon"),
    address: t("legal.placeholders.address"),
    email: t("contact.emails.wholesale") || t("legal.placeholders.email"),
  };

  const sections = (lang === "pl" ? wholesaleTermsPl : wholesaleTermsEn).map((s) => ({
    ...s,
    body: applyPlaceholders(s.body, placeholders),
  }));

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!accepted) return;
    const email = form.email.trim().toLowerCase();
    if (!email || !form.company.trim() || !form.contactName.trim()) return;

    setStatus("loading");
    const payload = {
      type: "wholesale",
      ...Object.fromEntries(Object.entries(form).map(([k, v]) => [k, String(v).trim()])),
      email,
      termsAcceptedAt: new Date().toISOString(),
      termsVersion: "2026-09-11",
      createdAt: new Date().toISOString(),
    };

    try {
      const existing = JSON.parse(localStorage.getItem(WHOLESALE_KEY) || "[]");
      localStorage.setItem(WHOLESALE_KEY, JSON.stringify([payload, ...existing]));
    } catch {
      /* ignore */
    }

    if (isFirebaseConfigured && db) {
      try {
        await addDoc(collection(db, "wholesale_applications"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      } catch {
        /* ignore */
      }
    }

    setStatus("done");
    setAccepted(false);
    setForm({
      company: "",
      nip: "",
      contactName: "",
      email: "",
      phone: "",
      country: "",
      website: "",
      message: "",
    });
  };

  return (
    <>
      <Seo title={`${t("wholesale.title")} — ROJOB`} description={t("wholesale.seo")} />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-midnight/[0.04] via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-5 pt-28 md:pt-36 pb-16 md:pb-20">
          <Reveal className="max-w-2xl">
            <div className="flex items-center gap-4 mb-8">
              <Emblem52N size="sm" />
              <p className="text-[10px] tracking-[0.38em] uppercase text-crimson">
                {t("wholesale.label")}
              </p>
            </div>
            <h1 className="font-serif text-[clamp(3.25rem,10vw,5.5rem)] leading-[0.95] tracking-[0.03em]">
              {t("wholesale.title")}
            </h1>
            <p className="mt-7 text-sm md:text-base text-midnight/60 leading-[1.9] max-w-xl">
              {t("wholesale.intro")}
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <a
                href="#wholesale-apply"
                className="link-underline text-[10px] tracking-[0.28em] uppercase text-midnight/80 hover:text-midnight transition-colors"
              >
                {t("wholesale.applyCta")}
              </a>
              <button
                type="button"
                onClick={() => setTermsOpen(true)}
                className="link-underline text-[10px] tracking-[0.28em] uppercase text-midnight/55 hover:text-midnight transition-colors"
              >
                {t("wholesale.viewTerms")}
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      <section
        id="wholesale-apply"
        className="border-t border-midnight/8 bg-white/25 scroll-mt-28"
      >
        <div className="max-w-7xl mx-auto px-5 py-16 md:py-24">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
            <Reveal className="lg:col-span-4">
              <h2 className="font-serif text-3xl md:text-4xl">{t("wholesale.applyTitle")}</h2>
              <p className="mt-5 text-sm text-midnight/55 leading-[1.85]">
                {t("wholesale.applyCopy")}
              </p>

              <div className="mt-10 pt-8 border-t border-midnight/10">
                <p className="text-[10px] tracking-[0.28em] uppercase text-midnight/40">
                  {t("wholesale.termsTitle")}
                </p>
                <p className="mt-3 text-sm text-midnight/55 leading-relaxed">
                  {t("wholesale.termsTeaser")}
                </p>
                <button
                  type="button"
                  onClick={() => setTermsOpen(true)}
                  className="mt-6 inline-flex items-center gap-3 text-[10px] tracking-[0.28em] uppercase text-midnight border border-midnight/20 px-5 py-3 hover:border-midnight/50 hover:bg-midnight hover:text-porcelain transition-colors duration-300"
                >
                  {t("wholesale.viewTerms")}
                </button>
              </div>
            </Reveal>

            <Reveal className="lg:col-span-8">
              {status === "done" ? (
                <div className="max-w-xl py-16">
                  <p className="font-serif text-3xl">{t("wholesale.successTitle")}</p>
                  <p className="mt-4 text-sm text-midnight/60 leading-relaxed">
                    {t("wholesale.success")}
                  </p>
                </div>
              ) : (
                <form onSubmit={submit} className="max-w-xl space-y-7">
                  <label className="block text-[10px] tracking-[0.22em] uppercase text-midnight/45">
                    {t("wholesale.fields.company")}
                    <input
                      required
                      className={FIELD}
                      value={form.company}
                      onChange={set("company")}
                      autoComplete="organization"
                    />
                  </label>
                  <label className="block text-[10px] tracking-[0.22em] uppercase text-midnight/45">
                    {t("wholesale.fields.nip")}
                    <input className={FIELD} value={form.nip} onChange={set("nip")} />
                  </label>
                  <label className="block text-[10px] tracking-[0.22em] uppercase text-midnight/45">
                    {t("wholesale.fields.contactName")}
                    <input
                      required
                      className={FIELD}
                      value={form.contactName}
                      onChange={set("contactName")}
                      autoComplete="name"
                    />
                  </label>
                  <label className="block text-[10px] tracking-[0.22em] uppercase text-midnight/45">
                    {t("wholesale.fields.email")}
                    <input
                      required
                      type="email"
                      className={FIELD}
                      value={form.email}
                      onChange={set("email")}
                      autoComplete="email"
                    />
                  </label>
                  <div className="grid sm:grid-cols-2 gap-7">
                    <label className="block text-[10px] tracking-[0.22em] uppercase text-midnight/45">
                      {t("wholesale.fields.phone")}
                      <input
                        className={FIELD}
                        value={form.phone}
                        onChange={set("phone")}
                        autoComplete="tel"
                      />
                    </label>
                    <label className="block text-[10px] tracking-[0.22em] uppercase text-midnight/45">
                      {t("wholesale.fields.country")}
                      <input
                        className={FIELD}
                        value={form.country}
                        onChange={set("country")}
                        autoComplete="country-name"
                      />
                    </label>
                  </div>
                  <label className="block text-[10px] tracking-[0.22em] uppercase text-midnight/45">
                    {t("wholesale.fields.website")}
                    <input
                      className={FIELD}
                      value={form.website}
                      onChange={set("website")}
                      autoComplete="url"
                    />
                  </label>
                  <label className="block text-[10px] tracking-[0.22em] uppercase text-midnight/45">
                    {t("wholesale.fields.message")}
                    <textarea
                      rows={4}
                      className={`${FIELD} resize-none`}
                      value={form.message}
                      onChange={set("message")}
                    />
                  </label>

                  <div className="pt-2 space-y-4">
                    <label className="flex gap-3 items-start text-sm text-midnight/65 leading-relaxed cursor-pointer">
                      <input
                        type="checkbox"
                        className="mt-1 shrink-0 accent-midnight"
                        checked={accepted}
                        onChange={(e) => setAccepted(e.target.checked)}
                        required
                      />
                      <span>
                        {t("wholesale.acceptTermsPrefix")}{" "}
                        <button
                          type="button"
                          onClick={() => setTermsOpen(true)}
                          className="link-underline text-midnight hover:text-crimson transition-colors"
                        >
                          {t("wholesale.termsLink")}
                        </button>
                        .
                      </span>
                    </label>

                    <button
                      type="submit"
                      disabled={status === "loading" || !accepted}
                      className="text-[10px] tracking-[0.28em] uppercase px-8 py-3.5 bg-midnight text-porcelain disabled:opacity-35 hover:bg-midnight/90 transition-colors"
                    >
                      {status === "loading" ? t("wholesale.sending") : t("wholesale.submit")}
                    </button>
                  </div>
                </form>
              )}
            </Reveal>
          </div>
        </div>
      </section>

      <TermsModal
        open={termsOpen}
        onClose={() => setTermsOpen(false)}
        sections={sections}
        t={t}
        placeholders={placeholders}
      />
    </>
  );
}

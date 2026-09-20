import { useEffect, useId, useState } from "react";
import { Link } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useLang } from "../context/LangContext";
import { db, isFirebaseConfigured } from "../lib/firebase";
import { wholesaleTermsEn, wholesaleTermsPl } from "../data/wholesaleTerms";
import {
  PRODUCT_TYPES,
  WHOLESALE_ADVANTAGES,
  WHOLESALE_FAQ,
  WHOLESALE_PROCESS,
  WHOLESALE_SERVICES,
  WHOLESALE_STATS,
} from "../data/wholesaleContent";
import Seo from "../components/Seo";
import Reveal from "../components/Reveal";
import Emblem52N from "../components/Emblem52N";

const WHOLESALE_KEY = "rojob_wholesale_applications";

/** Lightened brand crimson, legible on the midnight ground of this page. */
const ACCENT = "text-[#C8556A]";

const EYEBROW = `text-[10px] tracking-[0.38em] uppercase ${ACCENT}`;

const FIELD =
  "mt-2 w-full bg-transparent border border-porcelain/15 rounded-lg px-4 py-3.5 text-sm text-porcelain outline-none focus:border-porcelain/45 transition-colors placeholder:text-porcelain/30";

const ICON_PATHS = {
  box: "M3 7.5 12 3l9 4.5v9L12 21l-9-4.5v-9Zm0 0 9 4.5m0 0 9-4.5m-9 4.5V21",
  label: "M3 7a2 2 0 0 1 2-2h7l9 9-9 9-9-9V7Zm4.5 1.5h.01",
  gear: "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm8-3.5a8 8 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a8 8 0 0 0-2-1.2L15 3H9l-.5 2.6a8 8 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6a8 8 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-1a8 8 0 0 0 2 1.2L9 21h6l.5-2.6a8 8 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.07-.4.1-.8.1-1.2Z",
  thread: "M6 3v7a6 6 0 0 0 12 0V3M9 21h6m-3-5v5M4 7h4m8 0h4",
  tag: "M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0l-7.2-7.2A2 2 0 0 1 2.8 12V4.8A2 2 0 0 1 4.8 2.8H12a2 2 0 0 1 1.4.6l7.2 7.2a2 2 0 0 1 0 2.8ZM7.5 7.5h.01",
  truck: "M3 6h11v10H3V6Zm11 4h4l3 3v3h-7v-6ZM7 19.5a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5Zm10 0a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5Z",
};

function Icon({ name }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-7 h-7"
      aria-hidden="true"
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}

function SectionHead({ label, title, copy, className = "" }) {
  return (
    <Reveal className={`max-w-2xl ${className}`}>
      <p className={EYEBROW}>{label}</p>
      <h2 className="mt-5 font-serif text-[clamp(2.1rem,5vw,3.4rem)] leading-[1.08]">{title}</h2>
      {copy && (
        <p className="mt-6 text-sm md:text-base text-porcelain/55 leading-[1.9]">{copy}</p>
      )}
    </Reveal>
  );
}

function FaqItem({ item, open, onToggle }) {
  const panelId = useId();

  return (
    <div className="border-b border-porcelain/12">
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          className="w-full flex items-start justify-between gap-8 py-7 text-left group"
        >
          <span className="font-serif text-xl md:text-2xl text-porcelain/90 group-hover:text-porcelain transition-colors">
            {item.q}
          </span>
          <span
            className={`shrink-0 mt-1.5 text-lg leading-none text-porcelain/40 transition-transform duration-300 ${
              open ? "rotate-45" : ""
            }`}
            aria-hidden="true"
          >
            +
          </span>
        </button>
      </h3>
      <div
        id={panelId}
        hidden={!open}
        className="pb-8 -mt-1 max-w-3xl text-sm text-porcelain/55 leading-[1.9]"
      >
        {item.a}
      </div>
    </div>
  );
}

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
        className="absolute inset-0 bg-midnight/75 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full sm:max-w-2xl md:max-w-3xl max-h-[88vh] sm:max-h-[85vh] flex flex-col bg-porcelain text-midnight shadow-2xl sm:mx-5 sm:rounded-xl overflow-hidden"
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

const EMPTY_FORM = {
  company: "",
  nip: "",
  contactName: "",
  email: "",
  phone: "",
  country: "",
  website: "",
  productType: "",
  quantity: "",
  message: "",
};

export default function Wholesale() {
  const { t, lang } = useLang();
  const [status, setStatus] = useState("idle");
  const [accepted, setAccepted] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const services = WHOLESALE_SERVICES[lang] || WHOLESALE_SERVICES.en;
  const advantages = WHOLESALE_ADVANTAGES[lang] || WHOLESALE_ADVANTAGES.en;
  const process = WHOLESALE_PROCESS[lang] || WHOLESALE_PROCESS.en;
  const faq = WHOLESALE_FAQ[lang] || WHOLESALE_FAQ.en;
  const stats = WHOLESALE_STATS[lang] || WHOLESALE_STATS.en;
  const productTypes = PRODUCT_TYPES[lang] || PRODUCT_TYPES.en;

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
    setForm(EMPTY_FORM);
  };

  const labelCls = "block text-[10px] tracking-[0.22em] uppercase text-porcelain/45";

  return (
    <div className="bg-midnight text-porcelain">
      <Seo title={`${t("wholesale.title")} — ROJOB`} description={t("wholesale.seo")} />

      {/* Hero */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden">
        <img
          src="/images/hero-editorial.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-midnight/85 via-midnight/70 to-midnight" />

        <div className="relative w-full max-w-7xl mx-auto px-5 pt-32 pb-20 text-center">
          <Reveal>
            <div className="flex justify-center">
              <Emblem52N size="lg" />
            </div>
            <p className={`${EYEBROW} mt-9`}>{t("wholesale.label")}</p>
            <h1 className="mt-6 font-serif text-[clamp(2.75rem,8vw,5.25rem)] leading-[1.02] tracking-[0.01em] max-w-4xl mx-auto">
              {t("wholesale.heroHeadline")}
            </h1>
            <p className="mt-8 text-sm md:text-base text-porcelain/60 leading-[1.9] max-w-xl mx-auto">
              {t("wholesale.heroCopy")}
            </p>

            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#wholesale-apply"
                className="w-full sm:w-auto rounded-full bg-porcelain text-midnight px-11 py-4 text-[11px] tracking-[0.28em] uppercase hover:bg-porcelain/85 transition-colors duration-300"
              >
                {t("wholesale.applyCta")}
              </a>
              <button
                type="button"
                onClick={() => setTermsOpen(true)}
                className="w-full sm:w-auto rounded-full border border-porcelain/30 px-11 py-4 text-[11px] tracking-[0.28em] uppercase text-porcelain/85 hover:border-porcelain/70 hover:text-porcelain transition-colors duration-300"
              >
                {t("wholesale.viewTerms")}
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-porcelain/10">
        <div className="max-w-7xl mx-auto px-5 grid grid-cols-2 lg:grid-cols-4 divide-x divide-porcelain/10">
          {stats.map((stat) => (
            <div key={stat.label} className="px-5 py-10 md:py-14 text-center">
              <p className="font-serif text-4xl md:text-5xl">{stat.value}</p>
              <p className="mt-3 text-[10px] tracking-[0.2em] uppercase text-porcelain/40 leading-relaxed">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="max-w-7xl mx-auto px-5 py-24 md:py-36">
        <div className="grid lg:grid-cols-12 gap-14 lg:gap-24 items-start">
          <div className="lg:col-span-5">
            <SectionHead label={t("wholesale.aboutLabel")} title={t("wholesale.aboutTitle")} />
          </div>
          <Reveal className="lg:col-span-7 space-y-7 text-sm md:text-base text-porcelain/55 leading-[1.95] lg:pt-6">
            <p>{t("wholesale.aboutCopy")}</p>
            <p>{t("wholesale.aboutCopyTwo")}</p>
            <p className="text-porcelain/40 text-sm">{t("wholesale.intro")}</p>
          </Reveal>
        </div>
      </section>

      {/* Services */}
      <section className="border-t border-porcelain/10 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-5 py-24 md:py-36">
          <SectionHead
            label={t("wholesale.servicesLabel")}
            title={t("wholesale.servicesTitle")}
            copy={t("wholesale.servicesCopy")}
          />

          <div className="mt-20 grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-porcelain/10 border border-porcelain/10">
            {services.map((service, i) => (
              <Reveal
                key={service.id}
                className="bg-midnight p-9 md:p-11"
                rootMargin={`0px 0px ${-4 - (i % 3) * 2}% 0px`}
              >
                <span className={ACCENT}>
                  <Icon name={service.icon} />
                </span>
                <h3 className="mt-8 font-serif text-2xl">{service.title}</h3>
                <p className="mt-4 text-sm text-porcelain/50 leading-[1.9]">{service.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Why ROJOB */}
      <section className="border-t border-porcelain/10">
        <div className="max-w-7xl mx-auto px-5 py-24 md:py-36">
          <SectionHead
            label={t("wholesale.whyLabel")}
            title={t("wholesale.whyTitle")}
            copy={t("wholesale.whyCopy")}
          />

          <div className="mt-20 grid md:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-14">
            {advantages.map((item) => (
              <Reveal key={item.id}>
                <div className={`h-px w-10 bg-current ${ACCENT}`} />
                <h3 className="mt-7 font-serif text-2xl">{item.title}</h3>
                <p className="mt-4 text-sm text-porcelain/50 leading-[1.9]">{item.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="border-t border-porcelain/10 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-5 py-24 md:py-36">
          <SectionHead
            label={t("wholesale.processLabel")}
            title={t("wholesale.processTitle")}
            copy={t("wholesale.processCopy")}
          />

          <ol className="mt-20 relative border-l border-porcelain/15 ml-3 md:ml-5">
            {process.map((stage) => (
              <li key={stage.step} className="relative pl-10 md:pl-16 pb-14 last:pb-0">
                <span
                  className="absolute -left-[5px] top-1.5 w-[9px] h-[9px] rounded-full bg-[#C8556A]"
                  aria-hidden="true"
                />
                <Reveal>
                  <p className="text-[10px] tracking-[0.3em] text-porcelain/35">{stage.step}</p>
                  <h3 className="mt-3 font-serif text-2xl md:text-3xl">{stage.title}</h3>
                  <p className="mt-3 text-sm text-porcelain/50 leading-[1.9] max-w-xl">
                    {stage.body}
                  </p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Private label split */}
      <section className="border-t border-porcelain/10">
        <div className="grid lg:grid-cols-2">
          <div className="relative min-h-[320px] lg:min-h-[560px] overflow-hidden">
            <img
              src="/images/detail-knit.jpg"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover opacity-45"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-midnight/70 to-midnight/20" />
          </div>

          <Reveal className="flex items-center px-5 sm:px-10 lg:px-16 py-20 lg:py-28">
            <div className="max-w-lg">
              <p className={EYEBROW}>{t("wholesale.splitLabel")}</p>
              <h2 className="mt-5 font-serif text-[clamp(2rem,4.5vw,3.1rem)] leading-[1.1]">
                {t("wholesale.splitTitle")}
              </h2>
              <p className="mt-6 text-sm md:text-base text-porcelain/55 leading-[1.95]">
                {t("wholesale.splitCopy")}
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <a
                  href="#wholesale-apply"
                  className="rounded-full bg-porcelain text-midnight px-9 py-3.5 text-[11px] tracking-[0.28em] uppercase hover:bg-porcelain/85 transition-colors duration-300"
                >
                  {t("wholesale.applyCta")}
                </a>
                <Link
                  to="/shop"
                  className="rounded-full border border-porcelain/30 px-9 py-3.5 text-[11px] tracking-[0.28em] uppercase text-porcelain/85 hover:border-porcelain/70 hover:text-porcelain transition-colors duration-300"
                >
                  {t("wholesale.shopCta")}
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-porcelain/10 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-5 py-24 md:py-36">
          <div className="grid lg:grid-cols-12 gap-14 lg:gap-24">
            <div className="lg:col-span-4">
              <SectionHead label={t("wholesale.faqLabel")} title={t("wholesale.faqTitle")} />
            </div>
            <div className="lg:col-span-8 border-t border-porcelain/12">
              {faq.map((item) => (
                <FaqItem
                  key={item.id}
                  item={item}
                  open={openFaq === item.id}
                  onToggle={() => setOpenFaq((cur) => (cur === item.id ? null : item.id))}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enquiry form */}
      <section id="wholesale-apply" className="border-t border-porcelain/10 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-5 py-24 md:py-36">
          <div className="grid lg:grid-cols-12 gap-14 lg:gap-24">
            <div className="lg:col-span-4">
              <SectionHead
                label={t("wholesale.formLabel")}
                title={t("wholesale.applyTitle")}
                copy={t("wholesale.applyCopy")}
              />

              <Reveal className="mt-12 pt-10 border-t border-porcelain/12">
                <p className="text-[10px] tracking-[0.28em] uppercase text-porcelain/40">
                  {t("wholesale.termsTitle")}
                </p>
                <p className="mt-4 text-sm text-porcelain/50 leading-relaxed">
                  {t("wholesale.termsTeaser")}
                </p>
                <button
                  type="button"
                  onClick={() => setTermsOpen(true)}
                  className="mt-7 rounded-full border border-porcelain/30 px-8 py-3.5 text-[10px] tracking-[0.28em] uppercase text-porcelain/85 hover:border-porcelain/70 hover:text-porcelain transition-colors duration-300"
                >
                  {t("wholesale.viewTerms")}
                </button>
              </Reveal>
            </div>

            <Reveal className="lg:col-span-8">
              {status === "done" ? (
                <div className="max-w-xl py-16">
                  <p className="font-serif text-4xl">{t("wholesale.successTitle")}</p>
                  <p className="mt-5 text-sm text-porcelain/55 leading-[1.9]">
                    {t("wholesale.success")}
                  </p>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-7">
                  <div className="grid sm:grid-cols-2 gap-7">
                    <label className={labelCls}>
                      {t("wholesale.fields.company")}
                      <input
                        required
                        className={FIELD}
                        value={form.company}
                        onChange={set("company")}
                        autoComplete="organization"
                      />
                    </label>
                    <label className={labelCls}>
                      {t("wholesale.fields.nip")}
                      <input className={FIELD} value={form.nip} onChange={set("nip")} />
                    </label>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-7">
                    <label className={labelCls}>
                      {t("wholesale.fields.contactName")}
                      <input
                        required
                        className={FIELD}
                        value={form.contactName}
                        onChange={set("contactName")}
                        autoComplete="name"
                      />
                    </label>
                    <label className={labelCls}>
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
                  </div>

                  <div className="grid sm:grid-cols-2 gap-7">
                    <label className={labelCls}>
                      {t("wholesale.fields.phone")}
                      <input
                        className={FIELD}
                        value={form.phone}
                        onChange={set("phone")}
                        autoComplete="tel"
                      />
                    </label>
                    <label className={labelCls}>
                      {t("wholesale.fields.country")}
                      <input
                        className={FIELD}
                        value={form.country}
                        onChange={set("country")}
                        autoComplete="country-name"
                      />
                    </label>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-7">
                    <label className={labelCls}>
                      {t("wholesale.fields.productType")}
                      <select
                        required
                        className={`${FIELD} appearance-none`}
                        value={form.productType}
                        onChange={set("productType")}
                      >
                        <option value="" disabled className="bg-midnight">
                          {t("wholesale.fields.productTypePlaceholder")}
                        </option>
                        {productTypes.map((option) => (
                          <option key={option.value} value={option.value} className="bg-midnight">
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className={labelCls}>
                      {t("wholesale.fields.quantity")}
                      <input
                        className={FIELD}
                        value={form.quantity}
                        onChange={set("quantity")}
                        inputMode="numeric"
                      />
                    </label>
                  </div>

                  <label className={labelCls}>
                    {t("wholesale.fields.website")}
                    <input
                      className={FIELD}
                      value={form.website}
                      onChange={set("website")}
                      autoComplete="url"
                    />
                  </label>

                  <label className={labelCls}>
                    {t("wholesale.fields.message")}
                    <textarea
                      rows={5}
                      className={`${FIELD} resize-none`}
                      value={form.message}
                      onChange={set("message")}
                    />
                  </label>

                  <div className="pt-3 space-y-7">
                    <label className="flex gap-3 items-start text-sm text-porcelain/60 leading-relaxed cursor-pointer">
                      <input
                        type="checkbox"
                        className="mt-1 shrink-0 accent-[#C8556A]"
                        checked={accepted}
                        onChange={(e) => setAccepted(e.target.checked)}
                        required
                      />
                      <span>
                        {t("wholesale.acceptTermsPrefix")}{" "}
                        <button
                          type="button"
                          onClick={() => setTermsOpen(true)}
                          className={`link-underline hover:text-porcelain transition-colors ${ACCENT}`}
                        >
                          {t("wholesale.termsLink")}
                        </button>
                        .
                      </span>
                    </label>

                    <button
                      type="submit"
                      disabled={status === "loading" || !accepted}
                      className="w-full sm:w-auto rounded-full bg-porcelain text-midnight px-12 py-4 text-[11px] tracking-[0.28em] uppercase disabled:opacity-30 hover:bg-porcelain/85 transition-colors duration-300"
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
    </div>
  );
}

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useLang } from "../context/LangContext";
import { db, isFirebaseConfigured } from "../lib/firebase";
import { isContactEmailConfigured, sendContactEmail } from "../lib/contactEmail";
import Seo from "../components/Seo";
import Reveal from "../components/Reveal";

const INQUIRIES_KEY = "rojob_inquiries";

/** Public addresses shown on the page. Form delivery always goes to contact@. */
const DEPARTMENTS = [
  {
    id: "contact",
    email: "contact@rojob.eu",
    labelKey: "contact.customerCare",
  },
  {
    id: "marketing",
    email: "marketing@rojob.eu",
    labelKey: "contact.marketing",
    noteKey: "contact.marketingNote",
  },
  {
    id: "ceo",
    email: "ceo@rojob.eu",
    labelKey: "contact.ceo",
  },
];

const FIELD =
  "mt-2 w-full bg-transparent border-b border-midnight/25 py-2.5 text-sm focus:outline-none focus:border-midnight/60";

export default function Contact() {
  const { t } = useLang();
  const [department, setDepartment] = useState("contact");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !message.trim()) return;

    setStatus("loading");
    setError("");

    const payload = {
      department,
      name: name.trim(),
      email: trimmedEmail,
      message: message.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      const existing = JSON.parse(localStorage.getItem(INQUIRIES_KEY) || "[]");
      localStorage.setItem(INQUIRIES_KEY, JSON.stringify([payload, ...existing]));
    } catch {
      /* graceful */
    }

    if (isFirebaseConfigured && db) {
      try {
        await addDoc(collection(db, "inquiries"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      } catch {
        /* graceful */
      }
    }

    try {
      if (!isContactEmailConfigured()) {
        throw new Error(t("contact.form.configError"));
      }
      await sendContactEmail(payload);
      setStatus("done");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      console.warn("Contact email failed:", err?.message || err);
      setStatus("error");
      setError(t("contact.form.sendError"));
    }
  };

  return (
    <>
      <Seo title={`${t("contact.title")} — ROJOB`} description={t("contact.note")} />

      <section className="max-w-7xl mx-auto px-5 py-16 md:py-24">
        <Reveal>
          <p className="text-[11px] tracking-[0.35em] uppercase text-crimson">
            {t("contact.title")}
          </p>
          <h1 className="font-serif text-6xl md:text-7xl mt-3">{t("contact.title")}</h1>
          <p className="mt-5 text-midnight/70 max-w-lg">{t("contact.note")}</p>
        </Reveal>

        <div className="mt-16 grid lg:grid-cols-2 gap-16 lg:gap-24">
          <Reveal>
            <div className="space-y-10">
              {DEPARTMENTS.map((dept) => (
                <div key={dept.id}>
                  <p className="text-[10px] tracking-[0.32em] uppercase text-midnight/45">
                    {t(dept.labelKey)}
                  </p>
                  <a
                    href={`mailto:${dept.email}`}
                    className="mt-2 inline-block font-serif text-2xl hover:text-crimson transition-colors"
                  >
                    {dept.email}
                  </a>
                  {dept.noteKey && (
                    <p className="mt-2 text-xs text-midnight/45 leading-relaxed max-w-xs">
                      {t(dept.noteKey)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal>
            {status === "done" ? (
              <div className="space-y-6">
                <p className="font-serif text-3xl">{t("contact.form.sent")}</p>
                <p className="text-sm text-midnight/60 leading-relaxed">
                  {t("contact.form.sentCopy")}
                </p>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="link-underline text-[11px] tracking-[0.25em] uppercase text-midnight/70"
                >
                  {t("contact.form.sendAnother")}
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-6">
                <div>
                  <label
                    htmlFor="contact-dept"
                    className="text-[10px] tracking-[0.28em] uppercase text-midnight/45"
                  >
                    {t("contact.form.department")}
                  </label>
                  <select
                    id="contact-dept"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className={FIELD}
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {t(dept.labelKey)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="contact-name"
                    className="text-[10px] tracking-[0.28em] uppercase text-midnight/45"
                  >
                    {t("contact.form.name")}
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={FIELD}
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="text-[10px] tracking-[0.28em] uppercase text-midnight/45"
                  >
                    {t("contact.form.email")}
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={FIELD}
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="text-[10px] tracking-[0.28em] uppercase text-midnight/45"
                  >
                    {t("contact.form.message")}
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className={`${FIELD} resize-none`}
                  />
                </div>

                {error && (
                  <p className="text-sm text-crimson leading-relaxed" role="alert">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="bg-midnight text-porcelain px-8 py-3.5 text-[11px] tracking-[0.25em] uppercase hover:bg-midnight/90 transition-colors disabled:opacity-50"
                >
                  {status === "loading" ? t("contact.form.sending") : t("contact.form.send")}
                </button>
              </form>
            )}
          </Reveal>
        </div>
      </section>
    </>
  );
}

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../lib/firebase";
import { useLang } from "../context/LangContext";

const KEY = "rojob_newsletter";

export default function Newsletter({ className = "", compact = false }) {
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  const submit = async (e) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return;

    setStatus("loading");

    try {
      const existing = JSON.parse(localStorage.getItem(KEY) || "[]");
      if (!existing.includes(trimmed)) {
        localStorage.setItem(KEY, JSON.stringify([...existing, trimmed]));
      }
    } catch {
      /* ignore */
    }

    if (isFirebaseConfigured && db) {
      try {
        await addDoc(collection(db, "newsletter"), {
          email: trimmed,
          createdAt: serverTimestamp(),
          source: "site",
        });
      } catch {
        /* graceful fail */
      }
    }

    setStatus("done");
    setEmail("");
  };

  return (
    <div className={className}>
      {!compact && (
        <>
          <p className="text-[10px] tracking-[0.35em] uppercase text-midnight/45">
            {t("home.newsletter.title")}
          </p>
          <p className="mt-2 text-sm text-midnight/65 leading-relaxed max-w-sm">
            {t("newsletter.copy")}
          </p>
        </>
      )}
      <form onSubmit={submit} className={`flex gap-2 ${compact ? "" : "mt-5"}`}>
        <label className="sr-only" htmlFor="newsletter-email">
          Email
        </label>
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("newsletter.placeholder")}
          disabled={status === "done"}
          className="flex-1 min-w-0 bg-transparent border-b border-midnight/25 py-2 text-sm placeholder:text-midnight/35 focus:outline-none focus:border-midnight/60 transition-colors"
        />
        <button
          type="submit"
          disabled={status === "loading" || status === "done"}
          className="shrink-0 text-[10px] tracking-[0.28em] uppercase text-midnight/80 hover:text-midnight transition-colors disabled:opacity-50"
        >
          {status === "done" ? "✓" : t("newsletter.cta")}
        </button>
      </form>
    </div>
  );
}

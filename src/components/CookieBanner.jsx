import { useEffect, useState } from "react";
import { useLang } from "../context/LangContext";

const KEY = "rojob_cookie_consent";

function readConsent() {
  try {
    return JSON.parse(localStorage.getItem(KEY));
  } catch {
    return null;
  }
}

function saveConsent(value) {
  try {
    localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export default function CookieBanner() {
  const { t } = useLang();
  const [consent, setConsent] = useState(() => readConsent());
  const [showSettings, setShowSettings] = useState(false);
  const [analytics, setAnalytics] = useState(() => readConsent()?.analytics ?? false);

  useEffect(() => {
    if (consent?.analytics && typeof window.gtag === "function") {
      window.gtag("consent", "update", { analytics_storage: "granted" });
    }
  }, [consent]);

  if (consent) return null;

  const acceptAll = () => {
    const next = { essential: true, analytics: true, decidedAt: Date.now() };
    saveConsent(next);
    setConsent(next);
  };

  const rejectNonEssential = () => {
    const next = { essential: true, analytics: false, decidedAt: Date.now() };
    saveConsent(next);
    setConsent(next);
  };

  const saveSettings = () => {
    const next = { essential: true, analytics, decidedAt: Date.now() };
    saveConsent(next);
    setConsent(next);
    setShowSettings(false);
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-[90] p-4 md:p-6 pointer-events-none">
      <div className="max-w-3xl mx-auto pointer-events-auto bg-porcelain border border-midnight/12 shadow-sm px-5 py-4 md:px-6 md:py-5">
        <p className="text-sm text-midnight/70 leading-relaxed">
          {t("cookie.copy")}{" "}
          <span className="text-midnight/45 italic">{t("legal.reviewNote")}</span>
        </p>

        {showSettings && (
          <label className="mt-4 flex items-center gap-3 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={analytics}
              onChange={(e) => setAnalytics(e.target.checked)}
              className="accent-midnight"
            />
            Analytics
          </label>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={acceptAll}
            className="px-5 py-2 bg-midnight text-porcelain text-[10px] tracking-[0.25em] uppercase hover:bg-crimson transition-colors duration-300"
          >
            {t("cookie.accept")}
          </button>
          <button
            type="button"
            onClick={rejectNonEssential}
            className="px-5 py-2 border border-midnight/20 text-[10px] tracking-[0.25em] uppercase hover:border-midnight/50 transition-colors duration-300"
          >
            {t("cookie.reject")}
          </button>
          <button
            type="button"
            onClick={() => setShowSettings((v) => !v)}
            className="px-5 py-2 text-[10px] tracking-[0.25em] uppercase text-midnight/55 hover:text-midnight transition-colors duration-300"
          >
            {t("cookie.settings")}
          </button>
        </div>
      </div>
    </div>
  );
}

import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useLang } from "../context/LangContext";
import { useUI } from "../context/UIContext";

const links = [
  { labelKey: "nav.shop", to: "/shop" },
  { labelKey: "nav.collections", to: "/collections" },
  { labelKey: "home.collection.title", to: "/collections/cable-cotton" },
  { labelKey: "nav.world", to: "/world" },
  { labelKey: "fiftyTwo.title", to: "/52n" },
  { labelKey: "nav.journal", to: "/journal" },
  { labelKey: "product.sizeGuide", to: "/size-guide" },
  { labelKey: "nav.contact", to: "/contact" },
  { labelKey: "nav.account", to: "/account" },
];

function LangToggle({ className = "", light = false }) {
  const { lang, setLang, t } = useLang();
  const active = light ? "text-porcelain" : "text-midnight";
  const idle = light ? "text-porcelain/40 hover:text-porcelain/70" : "text-midnight/40 hover:text-midnight/70";

  return (
    <div className={`flex items-center gap-3 text-[10px] tracking-[0.25em] uppercase ${className}`}>
      {["en", "pl"].map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          className={`transition-opacity duration-300 ${lang === code ? active : idle}`}
        >
          {t(`common.${code}`)}
        </button>
      ))}
    </div>
  );
}

export default function MenuOverlay() {
  const { menuOpen, setMenuOpen } = useUI();
  const { t } = useLang();

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-midnight/20 transition-opacity duration-500 ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMenuOpen(false)}
        aria-hidden={!menuOpen}
      />
      <nav
        className={`fixed inset-y-0 left-0 z-[70] w-full max-w-md bg-porcelain border-r border-midnight/10 flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!menuOpen}
        aria-label="Main menu"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-midnight/8">
          <span className="text-[10px] tracking-[0.35em] uppercase text-midnight/45">ROJOB</span>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="text-[10px] tracking-[0.28em] uppercase text-midnight/60 hover:text-midnight transition-colors duration-300"
          >
            {t("nav.close")}
          </button>
        </div>

        <ul className="flex-1 px-6 py-10 space-y-5 overflow-y-auto">
          {links.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className="font-serif text-3xl md:text-4xl text-midnight/90 hover:text-crimson transition-colors duration-300"
              >
                {t(item.labelKey)}
              </Link>
            </li>
          ))}
        </ul>

        <div className="px-6 py-6 border-t border-midnight/8 flex items-center justify-between">
          <LangToggle />
          <span className="text-[9px] tracking-[0.3em] uppercase text-midnight/35">Warsaw · 52°N</span>
        </div>
      </nav>
    </>
  );
}

export { LangToggle };

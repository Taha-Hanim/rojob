import { Link } from "react-router-dom";
import { useLang } from "../context/LangContext";
import { useSiteMode } from "../context/SiteModeContext";
import Newsletter from "./Newsletter";
import { LangToggle } from "./MenuOverlay";
import Logo from "./Logo";

const nav = [
  { key: "footer.shop", to: "/shop" },
  { key: "footer.collections", to: "/collections" },
  { key: "footer.world", to: "/world" },
  { key: "footer.contact", to: "/contact" },
  { key: "footer.sizeGuide", to: "/size-guide" },
  { key: "footer.delivery", to: "/delivery-returns" },
  { key: "footer.terms", to: "/terms" },
  { key: "footer.privacy", to: "/privacy" },
  { key: "footer.cookies", to: "/cookies" },
];

const social = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "TikTok", href: "https://tiktok.com" },
  { label: "Pinterest", href: "https://pinterest.com" },
];

export default function Footer() {
  const { t } = useLang();
  const { currency } = useSiteMode();

  return (
    <footer className="bg-midnight text-porcelain mt-24">
      <div className="max-w-7xl mx-auto px-5 py-16 md:py-20">
        <div className="grid md:grid-cols-12 gap-12 md:gap-8">
          <div className="md:col-span-4">
            <Logo
              light
              showLocation
              showEmblem
              size="md"
              to="/"
            />
            <p className="mt-6 text-sm text-porcelain/65 leading-relaxed max-w-xs">
              {t("footer.tagline")}
            </p>
          </div>

          <nav className="md:col-span-3 text-sm">
            <div className="text-[10px] tracking-[0.3em] uppercase text-porcelain/40 mb-4">Navigate</div>
            <ul className="space-y-2.5">
              {nav.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-porcelain/75 hover:text-porcelain transition-colors duration-300"
                  >
                    {t(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-3">
            <div className="text-[10px] tracking-[0.3em] uppercase text-porcelain/40 mb-4">Follow</div>
            <ul className="space-y-2.5 text-sm">
              {social.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-porcelain/75 hover:text-porcelain transition-colors duration-300"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2 text-porcelain">
            <Newsletter compact className="[&_input]:border-porcelain/25 [&_input]:text-porcelain [&_input]:placeholder:text-porcelain/35 [&_button]:text-porcelain/80 [&_button]:hover:text-porcelain" />
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-porcelain/10 flex flex-col md:flex-row md:items-center justify-between gap-4 text-[10px] tracking-[0.22em] uppercase text-porcelain/45">
          <div className="flex items-center gap-5">
            <LangToggle light />
            <span>
              {t("common.currency")}: {currency}
            </span>
          </div>
          <p>{t("footer.copyright")}</p>
        </div>
      </div>
    </footer>
  );
}

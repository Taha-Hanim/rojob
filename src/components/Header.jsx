import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useLang } from "../context/LangContext";
import { useUI } from "../context/UIContext";
import Logo from "./Logo";
import { LangToggle } from "./MenuOverlay";
import MenuOverlay from "./MenuOverlay";
import SearchOverlay from "./SearchOverlay";
import BagDrawer from "./BagDrawer";
import AnnouncementBar from "./AnnouncementBar";
import Emblem52N from "./Emblem52N";

function IconButton({ children, label, onClick, light }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`text-[10px] tracking-[0.22em] uppercase transition-colors duration-300 ${
        light ? "text-porcelain/85 hover:text-porcelain" : "text-midnight/75 hover:text-midnight"
      }`}
    >
      {children}
    </button>
  );
}

export default function Header() {
  const { pathname } = useLocation();
  const { count } = useCart();
  const { t } = useLang();
  const { openMenu, openSearch, openBag } = useUI();
  const [scrolled, setScrolled] = useState(false);

  const overHero = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = scrolled || !overHero;
  const light = overHero && !scrolled;

  return (
    <>
      <div className="fixed top-0 inset-x-0 z-50">
        <AnnouncementBar />
      <header
        className={`transition-all duration-500 ${
          solid
            ? "bg-porcelain/95 backdrop-blur-sm border-b border-midnight/8 shadow-[0_1px_0_rgba(13,26,47,0.04)]"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 h-16 md:h-[4.5rem] grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          {/* Desktop left */}
          <div className="hidden md:flex items-center gap-6">
            <IconButton label={t("nav.menu")} onClick={openMenu} light={light}>
              {t("nav.menu")}
            </IconButton>
            <IconButton label={t("nav.search")} onClick={openSearch} light={light}>
              {t("nav.search")}
            </IconButton>
          </div>

          {/* Mobile left */}
          <div className="md:hidden flex items-center">
            <IconButton label={t("nav.menu")} onClick={openMenu} light={light}>
              <span className="flex flex-col gap-1.5 w-5" aria-hidden>
                <span className={`block h-px w-full transition-colors duration-300 ${light ? "bg-porcelain/80" : "bg-midnight/70"}`} />
                <span className={`block h-px w-3/4 transition-colors duration-300 ${light ? "bg-porcelain/80" : "bg-midnight/70"}`} />
              </span>
            </IconButton>
          </div>

          {/* Center logo — primary wordmark */}
          <div className="justify-self-center">
            <Logo light={light} showLocation={false} showEmblem={false} size="sm" />
          </div>

          {/* Desktop right */}
          <div className="hidden md:flex items-center justify-end gap-6">
            <LangToggle className={light ? "text-porcelain/70" : ""} />
            <Link
              to="/account"
              className={`text-[10px] tracking-[0.22em] uppercase transition-colors duration-300 ${
                light ? "text-porcelain/85 hover:text-porcelain" : "text-midnight/75 hover:text-midnight"
              }`}
            >
              {t("nav.account")}
            </Link>
            <button
              type="button"
              onClick={openBag}
              className={`text-[10px] tracking-[0.22em] uppercase transition-colors duration-300 ${
                light ? "text-porcelain/85 hover:text-porcelain" : "text-midnight/75 hover:text-midnight"
              }`}
            >
              {t("nav.bag")}
              {count > 0 && <span className="ml-1 opacity-70">({count})</span>}
            </button>
          </div>

          {/* Mobile right */}
          <div className="md:hidden flex items-center justify-end">
            <button
              type="button"
              onClick={openBag}
              className={`text-[10px] tracking-[0.22em] uppercase transition-colors duration-300 ${
                light ? "text-porcelain/85 hover:text-porcelain" : "text-midnight/75 hover:text-midnight"
              }`}
            >
              {t("nav.bag")}
              {count > 0 && <span className="ml-1 opacity-70">({count})</span>}
            </button>
          </div>
        </div>
      </header>
      </div>

      <MenuOverlay />
      <SearchOverlay />
      <BagDrawer />
    </>
  );
}

export { Emblem52N as Emblem };

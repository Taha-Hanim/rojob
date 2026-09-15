import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * The browser keeps the old scroll offset while the new route mounts, which drops
 * the visitor near the footer. We take over restoration: top of page on forward
 * navigation, remembered offset on back/forward.
 */
export default function ScrollToTop() {
  const { key, pathname, search, hash } = useLocation();
  const navigationType = useNavigationType();
  const offsets = useRef(new Map());

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // Remember where the visitor was before leaving this entry.
  useEffect(() => {
    const remember = () => offsets.current.set(key, window.scrollY);
    window.addEventListener("scroll", remember, { passive: true });
    return () => {
      remember();
      window.removeEventListener("scroll", remember);
    };
  }, [key]);

  useEffect(() => {
    // `html { scroll-behavior: smooth }` would otherwise animate the reset, leaving
    // the visitor gliding up from the footer. Route changes must jump.
    const jumpTo = (top) => window.scrollTo({ top, left: 0, behavior: "instant" });

    if (navigationType === "POP") {
      jumpTo(offsets.current.get(key) ?? 0);
      return undefined;
    }

    if (hash) {
      const target = document.querySelector(hash);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        return undefined;
      }
    }

    // Reveal animations change page height just after mount, which lets scroll
    // anchoring drag the viewport back down — so reset again once layout settles.
    jumpTo(0);
    const frame = requestAnimationFrame(() => jumpTo(0));
    return () => cancelAnimationFrame(frame);
  }, [key, pathname, search, hash, navigationType]);

  return null;
}

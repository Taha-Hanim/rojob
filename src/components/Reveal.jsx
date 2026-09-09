import { useEffect, useRef, useState } from "react";

export default function Reveal({
  children,
  className = "",
  as: Tag = "div",
  threshold = 0.12,
  rootMargin = "0px 0px -8% 0px",
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return (
    <Tag
      ref={ref}
      className={`transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
      } ${className}`}
    >
      {children}
    </Tag>
  );
}

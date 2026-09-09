import { Link } from "react-router-dom";
import Emblem52N from "./Emblem52N";

/**
 * Official ROJOB logo system
 * - primary: wordmark + WARSAW · 52° N + optional emblem
 * - stacked: large R monogram + wordmark + location + emblem
 * - mark: emblem only
 */

const WORD = {
  xs: "text-lg tracking-[0.04em]",
  sm: "text-xl tracking-[0.04em]",
  md: "text-3xl tracking-[0.04em]",
  lg: "text-5xl tracking-[0.03em]",
  xl: "text-6xl md:text-7xl tracking-[0.02em]",
};

const LOC = {
  xs: "text-[7px] tracking-[0.42em]",
  sm: "text-[8px] tracking-[0.45em]",
  md: "text-[10px] tracking-[0.48em]",
  lg: "text-[11px] tracking-[0.5em]",
  xl: "text-xs tracking-[0.52em]",
};

const R_SIZE = {
  xs: "text-4xl",
  sm: "text-5xl",
  md: "text-7xl",
  lg: "text-8xl",
  xl: "text-[9rem]",
};

const EMBLEM = {
  xs: "xs",
  sm: "xs",
  md: "sm",
  lg: "md",
  xl: "lg",
};

function Wordmark({ light, size }) {
  return (
    <span
      className={`font-serif font-medium leading-none ${WORD[size] || WORD.md} ${
        light ? "text-porcelain" : "text-black"
      }`}
    >
      ROJOB
    </span>
  );
}

function Location({ light, size }) {
  return (
    <span
      className={`font-serif uppercase leading-none ${LOC[size] || LOC.md} ${
        light ? "text-porcelain/75" : "text-black"
      }`}
    >
      Warsaw · 52° N
    </span>
  );
}

function MonogramR({ light, size }) {
  return (
    <span
      className={`font-serif font-medium leading-none ${R_SIZE[size] || R_SIZE.md} ${
        light ? "text-porcelain" : "text-black"
      }`}
      aria-hidden
    >
      R
    </span>
  );
}

export default function Logo({
  variant = "primary",
  showLocation = true,
  showEmblem = false,
  showTagline = false,
  light = false,
  size = "md",
  to = "/",
  className = "",
  as: Tag = Link,
}) {
  const emblemSize = EMBLEM[size] || "sm";
  const shared = { light, size };

  const inner =
    variant === "stacked" ? (
      <span className="inline-flex flex-col items-center gap-2 md:gap-3">
        <MonogramR {...shared} />
        <Wordmark {...shared} />
        {showLocation && <Location {...shared} />}
        {showEmblem && <Emblem52N size={emblemSize} className="mt-1" />}
        {showTagline && (
          <span
            className={`mt-3 text-center font-serif uppercase leading-[1.7] ${
              size === "xl" ? "text-[10px] tracking-[0.42em]" : "text-[8px] tracking-[0.38em]"
            } ${light ? "text-porcelain/70" : "text-black/80"}`}
          >
            A higher
            <br />
            standard
            <br />
            in everyday life
          </span>
        )}
      </span>
    ) : variant === "mark" ? (
      <Emblem52N size={size === "xl" ? "hero" : size === "lg" ? "xl" : size} />
    ) : (
      <span className="inline-flex flex-col items-start gap-1.5">
        <Wordmark {...shared} />
        {showLocation && <Location {...shared} />}
        {showEmblem && <Emblem52N size={emblemSize} className="mt-1" />}
      </span>
    );

  if (!to || Tag === "div") {
    return <div className={className}>{inner}</div>;
  }

  return (
    <Tag to={to} className={`inline-flex ${className}`}>
      {inner}
    </Tag>
  );
}

export { MonogramR, Wordmark, Location };
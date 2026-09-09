import { useId } from "react";

/**
 * Official ROJOB 52°N Emblem
 * Two rounded blocks · transparent centre gap
 * Upper: Porcelain with black type · Lower: Warsaw Crimson
 * “52°” left · “N” right — type lives only in the upper half
 */
const SIZES = {
  xs: { w: 14, h: 20, gap: 2, font: 6, radius: 2 },
  sm: { w: 18, h: 26, gap: 2.5, font: 7.5, radius: 2.5 },
  md: { w: 24, h: 34, gap: 3, font: 10, radius: 3 },
  lg: { w: 36, h: 52, gap: 4, font: 15, radius: 4 },
  xl: { w: 56, h: 80, gap: 6, font: 22, radius: 5 },
  hero: { w: 88, h: 126, gap: 8, font: 34, radius: 7 },
};

function Block({ label, w, h, font, radius, clipId, animClass }) {
  const midY = h / 2;
  return (
    <g className={animClass}>
      <g clipPath={`url(#${clipId})`}>
        <rect x="0" y="0" width={w} height={midY} fill="#F3EFE7" />
        <rect x="0" y={midY} width={w} height={midY} fill="#9C1D2D" />
      </g>
      <text
        x={w / 2}
        y={midY * 0.52}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#111111"
        fontFamily='"Libre Bodoni", "Cormorant Garamond", Georgia, serif'
        fontSize={font}
        fontWeight="600"
      >
        {label}
      </text>
    </g>
  );
}

export function Emblem52N({ size = "md", className = "", animated = false }) {
  const uid = useId().replace(/:/g, "");
  const s = SIZES[size] ?? SIZES.md;
  const totalW = s.w * 2 + s.gap;
  const clipL = `roj-l-${uid}`;
  const clipR = `roj-r-${uid}`;

  return (
    <svg
      width={totalW}
      height={s.h}
      viewBox={`0 0 ${totalW} ${s.h}`}
      className={`inline-block shrink-0 overflow-visible ${animated ? "emblem-52n-animated" : ""} ${className}`}
      role="img"
      aria-label="ROJOB 52°N emblem"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id={clipL}>
          <rect x="0" y="0" width={s.w} height={s.h} rx={s.radius} ry={s.radius} />
        </clipPath>
        <clipPath id={clipR}>
          <rect x="0" y="0" width={s.w} height={s.h} rx={s.radius} ry={s.radius} />
        </clipPath>
      </defs>

      {/* Position via outer <g>; animate only inner so CSS transform does not wipe SVG translate */}
      <g transform={`translate(0 0)`}>
        <Block
          label="52°"
          w={s.w}
          h={s.h}
          font={s.font}
          radius={s.radius}
          clipId={clipL}
          animClass="emblem-block-left"
        />
      </g>
      <g transform={`translate(${s.w + s.gap} 0)`}>
        <Block
          label="N"
          w={s.w}
          h={s.h}
          font={s.font}
          radius={s.radius}
          clipId={clipR}
          animClass="emblem-block-right"
        />
      </g>
    </svg>
  );
}

export default Emblem52N;

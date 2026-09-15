import { useId } from "react";

/**
 * Official ROJOB 52°N Emblem
 * Two black-outlined blocks · transparent centre gap
 * Upper: Porcelain with black type · Lower: Warsaw Crimson
 * “52°” left · “N” right — type lives only in the upper half
 *
 * Proportions are measured from the master artwork (04_rojob_52N_emblem.png):
 * each block is 300 × 328 px, the centre gap is 90 px, and the porcelain half
 * takes 56% of the block height.
 */
const H_RATIO = 1.09;
const GAP_RATIO = 0.3;
const RADIUS_RATIO = 0.12;
const STROKE_RATIO = 0.038;
const PORCELAIN_RATIO = 0.56;
const FONT_RATIO = 0.4;

const WIDTHS = {
  xs: 13,
  sm: 17,
  md: 22,
  lg: 34,
  xl: 54,
  hero: 92,
};

function Block({ label, w, h, font, radius, stroke, clipId, animClass }) {
  const splitY = h * PORCELAIN_RATIO;
  return (
    <g className={animClass}>
      <g clipPath={`url(#${clipId})`}>
        <rect x="0" y="0" width={w} height={splitY} fill="#F3EFE7" />
        <rect x="0" y={splitY} width={w} height={h - splitY} fill="#9C1D2D" />
      </g>
      <rect
        x={stroke / 2}
        y={stroke / 2}
        width={w - stroke}
        height={h - stroke}
        rx={radius}
        ry={radius}
        fill="none"
        stroke="#111111"
        strokeWidth={stroke}
      />
      <text
        x={w / 2}
        y={splitY * 0.52}
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
  const w = WIDTHS[size] ?? WIDTHS.md;
  const h = w * H_RATIO;
  const gap = w * GAP_RATIO;
  const totalW = w * 2 + gap;
  const shared = {
    w,
    h,
    font: w * FONT_RATIO,
    radius: w * RADIUS_RATIO,
    stroke: w * STROKE_RATIO,
  };
  const clipL = `roj-l-${uid}`;
  const clipR = `roj-r-${uid}`;

  return (
    <svg
      width={totalW}
      height={h}
      viewBox={`0 0 ${totalW} ${h}`}
      className={`inline-block shrink-0 overflow-visible ${animated ? "emblem-52n-animated" : ""} ${className}`}
      role="img"
      aria-label="ROJOB 52°N emblem"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id={clipL}>
          <rect
            x="0"
            y="0"
            width={w}
            height={h}
            rx={shared.radius}
            ry={shared.radius}
          />
        </clipPath>
        <clipPath id={clipR}>
          <rect
            x="0"
            y="0"
            width={w}
            height={h}
            rx={shared.radius}
            ry={shared.radius}
          />
        </clipPath>
      </defs>

      {/* Position via outer <g>; animate only inner so CSS transform does not wipe SVG translate */}
      <g transform="translate(0 0)">
        <Block label="52°" {...shared} clipId={clipL} animClass="emblem-block-left" />
      </g>
      <g transform={`translate(${w + gap} 0)`}>
        <Block label="N" {...shared} clipId={clipR} animClass="emblem-block-right" />
      </g>
    </svg>
  );
}

export default Emblem52N;

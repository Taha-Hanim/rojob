import { useEffect, useRef } from "react";

export default function BarcodeMark({ value, height = 36 }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!value || !ref.current) return undefined;
    let cancelled = false;
    import("jsbarcode").then((mod) => {
      if (cancelled || !ref.current) return;
      const JsBarcode = mod.default || mod;
      try {
        JsBarcode(ref.current, value, {
          format: "CODE128",
          width: 1.1,
          height,
          margin: 2,
          displayValue: true,
          fontSize: 10,
          background: "transparent",
          lineColor: "#0D1A2F",
        });
      } catch {
        /* keep the empty svg */
      }
    });
    return () => {
      cancelled = true;
    };
  }, [value, height]);

  if (!value) return null;
  return <svg ref={ref} className="max-w-[150px] h-11" />;
}

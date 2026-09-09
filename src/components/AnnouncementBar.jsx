import { useSiteMode } from "../context/SiteModeContext";

export default function AnnouncementBar() {
  const { commerceEnabled } = useSiteMode();
  const text = commerceEnabled
    ? "ROJOB · WARSAW · 52°N"
    : "ROJOB / FIRST COLLECTION / 2026";

  return (
    <div
      className="border-b border-midnight/8 bg-porcelain text-midnight/55 text-[9px] md:text-[10px] tracking-[0.38em] uppercase text-center py-2 px-4"
      role="status"
    >
      {text}
    </div>
  );
}

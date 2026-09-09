import {
  AVAILABILITY_FILTERS,
  COLOR_FILTERS,
  SIZE_FILTERS,
  SORT_OPTIONS,
} from "../lib/catalogFilters";

function FilterGroup({ label, children }) {
  return (
    <div>
      <p className="text-[10px] tracking-[0.2em] uppercase text-midnight/45 mb-3">{label}</p>
      {children}
    </div>
  );
}

export default function ProductFilters({
  categories,
  category,
  setCategory,
  colorId,
  setColorId,
  size,
  setSize,
  availability,
  setAvailability,
  sort,
  setSort,
  labels = {},
}) {
  const L = {
    category: labels.category ?? "Category",
    colour: labels.colour ?? "Colour",
    size: labels.size ?? "Size",
    availability: labels.availability ?? "Availability",
    sort: labels.sort ?? "Sort",
    all: labels.all ?? "All",
  };

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between">
      <div className="flex flex-col sm:flex-row flex-wrap gap-8 sm:gap-10">
        <FilterGroup label={L.category}>
          <div className="flex gap-4 flex-wrap">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`text-[11px] tracking-[0.2em] uppercase pb-1 border-b transition-colors duration-300 ${
                  category === c
                    ? "border-crimson text-crimson"
                    : "border-transparent text-midnight/55 hover:text-midnight"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup label={L.colour}>
          <div className="flex gap-3 items-center flex-wrap">
            {COLOR_FILTERS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setColorId(c.id)}
                title={c.label}
                className={`flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase transition-colors duration-300 ${
                  colorId === c.id ? "text-crimson" : "text-midnight/55 hover:text-midnight"
                }`}
              >
                {c.hex ? (
                  <>
                    <span
                      className={`w-6 h-6 rounded-full border transition-transform duration-300 ${
                        colorId === c.id ? "border-crimson scale-110" : "border-midnight/25"
                      }`}
                      style={{ background: c.hex }}
                    />
                    <span className="hidden sm:inline">{c.label}</span>
                  </>
                ) : (
                  <span className={colorId === c.id ? "border-b border-crimson pb-0.5" : ""}>
                    {L.all}
                  </span>
                )}
              </button>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup label={L.size}>
          <div className="flex gap-2 flex-wrap">
            {SIZE_FILTERS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`px-2.5 py-1 text-[10px] tracking-[0.15em] uppercase border transition-colors duration-300 ${
                  size === s
                    ? "border-midnight text-midnight"
                    : "border-midnight/15 text-midnight/50 hover:border-midnight/35"
                }`}
              >
                {s === "All" ? L.all : s}
              </button>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup label={L.availability}>
          <div className="flex gap-4 flex-wrap">
            {AVAILABILITY_FILTERS.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setAvailability(a.id)}
                className={`text-[11px] tracking-[0.2em] uppercase pb-1 border-b transition-colors duration-300 ${
                  availability === a.id
                    ? "border-crimson text-crimson"
                    : "border-transparent text-midnight/55 hover:text-midnight"
                }`}
              >
                {a.id === "All" ? L.all : a.label}
              </button>
            ))}
          </div>
        </FilterGroup>
      </div>

      <FilterGroup label={L.sort}>
        <div className="flex gap-4 flex-wrap">
          {SORT_OPTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSort(s.id)}
              className={`text-[11px] tracking-[0.2em] uppercase pb-1 border-b transition-colors duration-300 ${
                sort === s.id
                  ? "border-crimson text-crimson"
                  : "border-transparent text-midnight/55 hover:text-midnight"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </FilterGroup>
    </div>
  );
}

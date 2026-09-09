export const COLLECTIONS = [
  {
    slug: "cable-cotton",
    title: "Cable Cotton",
    code: "01 / 2026",
    collectionName: "Cable Cotton",
    image: "/images/hero-editorial.jpg",
    active: true,
  },
  {
    slug: "crew-neck",
    title: "Crew Neck",
    code: "02 / 2026",
    comingSoon: true,
  },
  {
    slug: "essentials",
    title: "Essentials",
    code: "—",
    comingSoon: true,
  },
];

export const COLOR_FILTERS = [
  { id: "All", label: "All" },
  { id: "porcelain", label: "Porcelain", hex: "#F3EFE7" },
  { id: "midnight", label: "Midnight", hex: "#0D1A2F" },
];

export const SIZE_FILTERS = ["All", "XS", "S", "M", "L", "XL", "One size"];

export const AVAILABILITY_FILTERS = [
  { id: "All", label: "All" },
  { id: "available", label: "Available" },
  { id: "preview", label: "Preview" },
];

export const SORT_OPTIONS = [
  { id: "featured", label: "Featured" },
  { id: "newest", label: "Newest" },
  { id: "price", label: "Price" },
];

export function getCollection(slug) {
  return COLLECTIONS.find((c) => c.slug === slug) ?? null;
}

export function getCollectionProducts(products, slug) {
  const col = getCollection(slug);
  if (!col?.collectionName) return [];
  return products.filter((p) => p.collection === col.collectionName);
}

export function filterProducts(products, { category, colorId, size, availability }) {
  return products.filter((p) => {
    if (category && category !== "All" && p.category !== category) return false;
    if (colorId && colorId !== "All" && p.colorId !== colorId) return false;
    if (size && size !== "All" && !p.sizes?.includes(size)) return false;
    if (availability && availability !== "All" && p.status !== availability) return false;
    return true;
  });
}

export function sortProducts(products, sort) {
  const list = [...products];
  switch (sort) {
    case "featured":
      return list.sort((a, b) => Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name));
    case "newest":
      return list.sort(
        (a, b) =>
          (b.release || "").localeCompare(a.release || "") ||
          (b.sku || "").localeCompare(a.sku || "") ||
          a.slug.localeCompare(b.slug)
      );
    case "price":
      return list.sort((a, b) => {
        if (a.price == null && b.price == null) return 0;
        if (a.price == null) return 1;
        if (b.price == null) return -1;
        return Number(a.price) - Number(b.price);
      });
    default:
      return list;
  }
}

export function getCategories(products) {
  return ["All", ...new Set(products.map((p) => p.category).filter(Boolean))];
}

export function getColorVariants(products, product) {
  if (!product?.name) return [];
  return products.filter((p) => p.name === product.name);
}

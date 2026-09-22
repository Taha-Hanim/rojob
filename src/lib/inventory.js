import { seedProducts } from "../data/seed";

const INV_KEY = "rojob_inventory";
export const INVENTORY_EVENT = "rojob-inventory";

const PAID_PAYMENTS = new Set(["paid", "demo"]);

export function stockMap(product) {
  const sizes = product?.sizes?.length ? product.sizes : ["One size"];
  const raw = product?.stockBySize && typeof product.stockBySize === "object" ? product.stockBySize : null;
  if (raw && Object.keys(raw).length) {
    const map = {};
    for (const size of sizes) {
      const n = Number(raw[size]);
      map[size] = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
    }
    return map;
  }
  const total = Number(product?.stock);
  const each = Number.isFinite(total) && sizes.length ? Math.floor(Math.max(0, total) / sizes.length) : 0;
  const extra = Number.isFinite(total) ? Math.max(0, Math.floor(total) - each * sizes.length) : 0;
  const map = {};
  sizes.forEach((size, i) => {
    map[size] = each + (i === 0 ? extra : 0);
  });
  return map;
}

export function totalStock(product) {
  return Object.values(stockMap(product)).reduce((n, v) => n + v, 0);
}

export function stockForSize(product, size) {
  if (!size) return 0;
  return stockMap(product)[size] ?? 0;
}

export function isSizeInStock(product, size) {
  return stockForSize(product, size) > 0;
}

export function isProductInStock(product) {
  return totalStock(product) > 0;
}

export function firstInStockSize(product) {
  const sizes = product?.sizes || [];
  return sizes.find((s) => isSizeInStock(product, s)) || sizes[0] || null;
}

export function remapStockToSizes(product, sizes) {
  const nextSizes = sizes?.length ? sizes : product?.sizes?.length ? product.sizes : ["One size"];
  const current = stockMap(product);
  const map = {};
  for (const size of nextSizes) {
    if (size === "XXL") {
      map[size] = Math.max(0, Math.floor(Number(current.XXL ?? current.XS ?? 0)));
    } else {
      map[size] = Math.max(0, Math.floor(Number(current[size] ?? 0)));
    }
  }
  return map;
}

export function withNormalizedStock(product) {
  const stockBySize = stockMap(product);
  return {
    ...product,
    stockBySize,
    stock: Object.values(stockBySize).reduce((n, v) => n + v, 0),
  };
}

export function decrementMap(stockBySize, size, qty) {
  const next = { ...stockBySize };
  const key = size || Object.keys(next)[0];
  if (!key) return next;
  const current = Number(next[key] ?? 0);
  next[key] = Math.max(0, current - Math.max(0, Number(qty) || 0));
  return next;
}

export function saleShouldAdjustStock(payload) {
  return PAID_PAYMENTS.has(payload?.payment);
}

export function readLocalInventory() {
  try {
    const raw = JSON.parse(localStorage.getItem(INV_KEY) || "{}");
    return raw && typeof raw === "object" ? raw : {};
  } catch {
    return {};
  }
}

export function writeLocalInventory(map) {
  localStorage.setItem(INV_KEY, JSON.stringify(map));
  window.dispatchEvent(new Event(INVENTORY_EVENT));
}

export function overlayLocalInventory(products) {
  const inv = readLocalInventory();
  return products.map((p) => {
    const key = p.slug || p.id;
    const saved = inv[key];
    if (!saved?.stockBySize) return withNormalizedStock(p);
    return withNormalizedStock({ ...p, stockBySize: saved.stockBySize });
  });
}

export function persistLocalProductStock(product) {
  const key = product.slug || product.id;
  if (!key) return;
  const next = { ...readLocalInventory() };
  const normalized = withNormalizedStock(product);
  next[key] = { stockBySize: normalized.stockBySize, stock: normalized.stock };
  writeLocalInventory(next);
}

export function findCatalogProduct(products, line) {
  if (!line) return null;
  return (
    products.find((p) => p.id && p.id === line.productId) ||
    products.find((p) => p.slug && (p.slug === line.slug || p.slug === line.productId)) ||
    null
  );
}

export function availableForLine(products, line) {
  const product = findCatalogProduct(products, line);
  if (!product) return null;
  return stockForSize(product, line.size);
}

export function inventoryErrorForCart(products, items) {
  for (const line of items || []) {
    const available = availableForLine(products, line);
    if (available == null) continue;
    if (available <= 0) {
      return `${line.name || "Item"} · ${line.size} is out of stock.`;
    }
    if (line.qty > available) {
      return `Only ${available} left of ${line.name || "item"} in ${line.size}.`;
    }
  }
  return "";
}

export function applySaleToLocalInventory(items) {
  const inv = readLocalInventory();
  for (const line of items || []) {
    const key = line.slug || line.productId;
    if (!key) continue;
    const seed = seedProducts.find((p) => p.slug === key);
    const current = inv[key]?.stockBySize || seed?.stockBySize || stockMap(seed || { sizes: [line.size] });
    const stockBySize = decrementMap(current, line.size, line.qty);
    inv[key] = {
      stockBySize,
      stock: Object.values(stockBySize).reduce((n, v) => n + v, 0),
    };
  }
  writeLocalInventory(inv);
}

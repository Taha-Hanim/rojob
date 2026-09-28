import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import {
  seedProducts,
  seedPortfolio,
  seedJournal,
  retiredProductSlugs,
} from "../data/seed";
import {
  applySaleToLocalInventory,
  overlayLocalInventory,
  persistLocalProductStock,
  saleShouldAdjustStock,
  stockMap,
  withNormalizedStock,
  decrementMap,
  incrementMap,
  remapStockToSizes,
} from "./inventory";
import { recordPaidSale } from "./salesWorkbook";
import { barcodeFor, findByBarcode } from "./barcode";

export { seedJournal };

const RETIRED_PRODUCTS = new Set(retiredProductSlugs);

function withIds(snapshot) {
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

function dropRetired(rows) {
  return rows.filter((p) => !RETIRED_PRODUCTS.has(p.slug || p.id));
}

/** Overlay catalogue prices, sizes and images from seed so shop updates without a reseed. */
function mergeSeedCommerce(rows) {
  const bySlug = Object.fromEntries(seedProducts.map((p) => [p.slug, p]));
  return rows.map((p) => {
    const seed = bySlug[p.slug || p.id];
    if (!seed) return withNormalizedStock(p);
    const needsCommerce =
      p.price == null || p.status === "preview" || p.status == null;
    const hasSizeStock =
      p.stockBySize && typeof p.stockBySize === "object" && Object.keys(p.stockBySize).length > 0;
    const sizes = seed.sizes || p.sizes;
    return withNormalizedStock({
      ...p,
      price: seed.price ?? p.price,
      compareAtPrice: seed.compareAtPrice ?? p.compareAtPrice,
      sizes,
      status:
        needsCommerce && (p.status === "preview" || !p.status)
          ? seed.status
          : p.status || seed.status,
      stockBySize: hasSizeStock ? remapStockToSizes(p, sizes) : seed.stockBySize,
      images: seed.images,
    });
  });
}

function withMissingSeed(rows) {
  const merged = mergeSeedCommerce(dropRetired(rows));
  const have = new Set(merged.map((p) => p.slug || p.id));
  const extra = seedProducts
    .filter((p) => !have.has(p.slug))
    .map((p) => withNormalizedStock({ ...p, id: p.slug }));
  return [...merged, ...extra];
}

function localCatalogue() {
  return overlayLocalInventory(seedProducts.map((p) => ({ ...p, id: p.slug })));
}

export async function fetchProductsOnce() {
  if (!isFirebaseConfigured) return localCatalogue();
  const snap = await getDocs(collection(db, "products"));
  if (snap.empty) return localCatalogue();
  // Trust Firestore as the source of truth when connected — do not let a
  // browser's local cache override live stock after sales or scans elsewhere.
  return withMissingSeed(withIds(snap));
}

export function subscribeProducts(cb) {
  if (!isFirebaseConfigured) {
    const emit = () => cb(localCatalogue());
    emit();
    window.addEventListener("rojob-inventory", emit);
    return () => window.removeEventListener("rojob-inventory", emit);
  }
  return onSnapshot(collection(db, "products"), (snap) => {
    if (snap.empty) cb(localCatalogue());
    else cb(withMissingSeed(withIds(snap)));
  });
}

export function subscribePortfolio(cb) {
  if (!isFirebaseConfigured) {
    cb(seedPortfolio.map((p) => ({ ...p, id: p.slug })));
    return () => {};
  }
  return onSnapshot(collection(db, "portfolio"), (snap) => {
    if (snap.empty) cb(seedPortfolio.map((p) => ({ ...p, id: p.slug })));
    else cb(withIds(snap));
  });
}

export function subscribeOrders(cb) {
  if (!isFirebaseConfigured) {
    cb([]);
    return () => {};
  }
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => cb(withIds(snap)));
}

const MOVES_KEY = "rojob_stock_moves";

function readLocalMoves() {
  try {
    const raw = JSON.parse(localStorage.getItem(MOVES_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function writeLocalMoves(rows) {
  localStorage.setItem(MOVES_KEY, JSON.stringify(rows.slice(0, 400)));
  window.dispatchEvent(new Event("rojob-stock-moves"));
}

async function resolveProductDoc(line) {
  const ids = [...new Set([line.productId, line.slug].filter(Boolean))];
  for (const id of ids) {
    const ref = doc(db, "products", id);
    const snap = await getDoc(ref);
    if (snap.exists()) return { ref, data: { id: snap.id, ...snap.data() } };
  }

  const all = await getDocs(collection(db, "products"));
  const rows = all.docs.map((d) => ({ ref: d.ref, data: { id: d.id, ...d.data() } }));
  const bySlug = rows.find(
    (row) =>
      row.data.slug === line.slug ||
      row.data.sku === line.sku ||
      row.id === line.productId
  );
  if (bySlug) return bySlug;

  const hit = findByBarcode(
    rows.map((row) => row.data),
    line.barcode || barcodeFor(line.sku || line.slug, line.size)
  );
  if (hit) {
    const match = rows.find((row) => row.id === hit.product.id || row.data.slug === hit.product.slug);
    if (match) return match;
  }

  const seed = seedProducts.find(
    (p) => p.slug === line.slug || p.sku === line.sku || ids.includes(p.slug)
  );
  if (!seed) return null;
  return { ref: doc(db, "products", seed.slug), data: { ...seed, id: seed.slug } };
}

async function writeStockMove(move) {
  const row = {
    id: crypto.randomUUID(),
    ...move,
    createdAt: new Date().toISOString(),
  };
  writeLocalMoves([row, ...readLocalMoves()]);
  if (isFirebaseConfigured && db) {
    try {
      await addDoc(collection(db, "stockMoves"), {
        ...row,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("[stock] move log failed", err.code || err.message);
    }
  }
  return row;
}

async function applyPaidSale(items) {
  applySaleToLocalInventory(items);

  if (!isFirebaseConfigured) return;

  for (const line of items || []) {
    try {
      const resolved = await resolveProductDoc(line);
      if (!resolved) {
        console.error("[stock] no product for line", line.slug || line.productId || line.barcode);
        continue;
      }
      const nextMap = decrementMap(stockMap(resolved.data), line.size, line.qty);
      const stock = Object.values(nextMap).reduce((n, v) => n + v, 0);
      await setDoc(resolved.ref, { stockBySize: nextMap, stock }, { merge: true });
      persistLocalProductStock({
        ...resolved.data,
        slug: resolved.data.slug || line.slug,
        id: resolved.data.id,
        stockBySize: nextMap,
      });
      await writeStockMove({
        barcode: line.barcode || barcodeFor(resolved.data.sku || resolved.data.slug, line.size),
        sku: resolved.data.sku || line.sku || "",
        slug: resolved.data.slug || line.slug || "",
        name: resolved.data.name || line.name || "",
        color: resolved.data.color || line.color || "",
        size: line.size || "",
        qty: Math.max(1, Number(line.qty) || 1),
        direction: "out",
        location: "poland",
        source: "order",
        orderId: line.orderId || "",
      });
    } catch (err) {
      console.error("[stock] could not decrement", line.slug || line.productId, err.code || err.message);
    }
  }
}

export async function applyStockMove({ product, size, qty = 1, direction = "out", location = "poland", source = "scan" }) {
  const amount = Math.max(1, Number(qty) || 1);
  const current = stockMap(product);
  const nextMap = direction === "in" ? incrementMap(current, size, amount) : decrementMap(current, size, amount);
  const stock = Object.values(nextMap).reduce((n, v) => n + v, 0);
  const nextProduct = { ...product, stockBySize: nextMap, stock };
  persistLocalProductStock(nextProduct);

  if (isFirebaseConfigured && db) {
    const resolved = await resolveProductDoc({
      productId: product.id,
      slug: product.slug,
      sku: product.sku,
    });
    const ref = resolved?.ref || doc(db, "products", product.id || product.slug);
    await setDoc(ref, { stockBySize: nextMap, stock }, { merge: true });
  }

  const move = await writeStockMove({
    barcode: barcodeFor(product.sku || product.slug, size),
    sku: product.sku || "",
    slug: product.slug || "",
    name: product.name || "",
    color: product.color || "",
    size: size || "",
    qty: amount,
    direction,
    location,
    source,
  });
  return { product: nextProduct, move };
}

export function subscribeStockMoves(cb) {
  const emitLocal = () => cb(readLocalMoves());
  if (!isFirebaseConfigured) {
    emitLocal();
    window.addEventListener("rojob-stock-moves", emitLocal);
    return () => window.removeEventListener("rojob-stock-moves", emitLocal);
  }
  const unsub = onSnapshot(collection(db, "stockMoves"), (snap) => {
    const rows = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
    cb(rows.length ? rows : readLocalMoves());
  }, emitLocal);
  window.addEventListener("rojob-stock-moves", emitLocal);
  return () => {
    unsub();
    window.removeEventListener("rojob-stock-moves", emitLocal);
  };
}

export async function createOrder(payload) {
  const { status: statusOverride, ...rest } = payload;
  const order = {
    ...rest,
    status: statusOverride || "received",
    createdAt: isFirebaseConfigured ? serverTimestamp() : new Date().toISOString(),
  };
  if (!isFirebaseConfigured) {
    const local = JSON.parse(localStorage.getItem("rojob_orders") || "[]");
    local.unshift({ ...order, id: crypto.randomUUID() });
    localStorage.setItem("rojob_orders", JSON.stringify(local));
    if (saleShouldAdjustStock(payload)) {
      applySaleToLocalInventory(payload.items);
      try {
        await recordPaidSale({
          ...order,
          id: local[0].id,
          items: payload.items,
          customer: payload.customer,
          payment: payload.payment,
        });
      } catch {
        /* order and stock already saved */
      }
    }
    return { id: local[0].id, local: true };
  }
  const ref = await addDoc(collection(db, "orders"), order);
  if (saleShouldAdjustStock(payload)) {
    await applyPaidSale(payload.items);
    try {
      await recordPaidSale({
        ...order,
        id: ref.id,
        items: payload.items,
        customer: payload.customer,
        payment: payload.payment,
      });
    } catch {
      /* order and stock already saved */
    }
  }
  return { id: ref.id };
}

export async function updateProductStock(product, stockBySize) {
  const normalized = withNormalizedStock({ ...product, stockBySize });
  persistLocalProductStock(normalized);
  if (!isFirebaseConfigured) return normalized;
  const id = product.id || product.slug;
  if (!id) throw new Error("Product id is required.");
  await setDoc(
    doc(db, "products", id),
    { stockBySize: normalized.stockBySize, stock: normalized.stock },
    { merge: true }
  );
  return normalized;
}

export async function updateOrderStatus(id, status) {
  if (!isFirebaseConfigured) return;
  await updateDoc(doc(db, "orders", id), { status });
}

export async function saveProduct(product) {
  const normalized = withNormalizedStock(product);
  persistLocalProductStock(normalized);
  if (!isFirebaseConfigured) {
    return normalized.id || normalized.slug;
  }
  if (normalized.id) {
    const { id, ...rest } = normalized;
    await setDoc(doc(db, "products", id), rest, { merge: true });
    return id;
  }
  const ref = await addDoc(collection(db, "products"), normalized);
  return ref.id;
}

export async function removeProduct(id) {
  if (!isFirebaseConfigured) throw new Error("Connect Firebase first.");
  await deleteDoc(doc(db, "products", id));
}

export async function savePortfolioItem(item) {
  if (!isFirebaseConfigured) {
    throw new Error("Connect Firebase to save portfolio items.");
  }
  if (item.id) {
    const { id, ...rest } = item;
    await setDoc(doc(db, "portfolio", id), rest, { merge: true });
    return id;
  }
  const ref = await addDoc(collection(db, "portfolio"), item);
  return ref.id;
}

export async function removePortfolioItem(id) {
  if (!isFirebaseConfigured) throw new Error("Connect Firebase first.");
  await deleteDoc(doc(db, "portfolio", id));
}

export async function seedDatabase() {
  if (!isFirebaseConfigured) {
    throw new Error("Add your Firebase keys to .env.local first.");
  }
  // Drop catalogue entries the seed no longer lists, so retiring a colourway
  // here actually removes it from the live shop instead of leaving it behind.
  const existing = await getDocs(collection(db, "products"));
  const keep = new Set(seedProducts.map((p) => p.slug));
  await Promise.all(
    existing.docs
      .filter((d) => !keep.has(d.data()?.slug || d.id))
      .map((d) => deleteDoc(d.ref))
  );

  await Promise.all(
    seedProducts.map(async (p) => {
      const ref = doc(db, "products", p.slug);
      const snap = await getDoc(ref);
      const existing = snap.exists() ? snap.data() : {};
      const keepStock =
        existing.stockBySize && Object.keys(existing.stockBySize).length > 0;
      if (!keepStock) {
        await setDoc(ref, p);
        return;
      }
      const stockBySize = remapStockToSizes({ ...existing, sizes: existing.sizes || p.sizes }, p.sizes);
      await setDoc(ref, {
        ...p,
        stockBySize,
        stock: Object.values(stockBySize).reduce((n, v) => n + v, 0),
      });
    })
  );
  await Promise.all(
    seedPortfolio.map((p) => setDoc(doc(db, "portfolio", p.slug), p))
  );
  await Promise.all(
    seedJournal.map((p) => setDoc(doc(db, "journal", p.slug), p))
  );
}

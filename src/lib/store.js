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
} from "./inventory";

export { seedJournal };

const RETIRED_PRODUCTS = new Set(retiredProductSlugs);

function withIds(snapshot) {
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

function dropRetired(rows) {
  return rows.filter((p) => !RETIRED_PRODUCTS.has(p.slug || p.id));
}

/** Keep local seed commerce fields when Firestore still has preview / empty prices */
function mergeSeedCommerce(rows) {
  const bySlug = Object.fromEntries(seedProducts.map((p) => [p.slug, p]));
  return rows.map((p) => {
    const seed = bySlug[p.slug || p.id];
    if (!seed) return withNormalizedStock(p);
    const needsCommerce =
      p.price == null || p.status === "preview" || p.status == null;
    const hasSizeStock =
      p.stockBySize && typeof p.stockBySize === "object" && Object.keys(p.stockBySize).length > 0;
    return withNormalizedStock({
      ...p,
      price: needsCommerce && p.price == null ? seed.price : p.price ?? seed.price,
      status:
        needsCommerce && (p.status === "preview" || !p.status)
          ? seed.status
          : p.status || seed.status,
      stockBySize: hasSizeStock ? p.stockBySize : seed.stockBySize,
      // Prefer local catalogue imagery (corrected emblems)
      images: seed.images,
    });
  });
}

function localCatalogue() {
  return overlayLocalInventory(seedProducts.map((p) => ({ ...p, id: p.slug })));
}

export async function fetchProductsOnce() {
  if (!isFirebaseConfigured) return localCatalogue();
  const snap = await getDocs(collection(db, "products"));
  if (snap.empty) return localCatalogue();
  return mergeSeedCommerce(dropRetired(withIds(snap)));
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
    else cb(mergeSeedCommerce(dropRetired(withIds(snap))));
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

async function applyPaidSale(items) {
  applySaleToLocalInventory(items);

  if (!isFirebaseConfigured) return;

  for (const line of items || []) {
    const id = line.productId || line.slug;
    if (!id) continue;
    const productRef = doc(db, "products", id);
    try {
      const snap = await getDoc(productRef);
      const existing = snap.exists()
        ? { id, ...snap.data() }
        : seedProducts.find((p) => p.slug === id);
      if (!existing) continue;
      const nextMap = decrementMap(stockMap(existing), line.size, line.qty);
      await setDoc(
        productRef,
        { stockBySize: nextMap, stock: Object.values(nextMap).reduce((n, v) => n + v, 0) },
        { merge: true }
      );
    } catch {
      /* order is already saved; inventory is best-effort */
    }
  }
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
    if (saleShouldAdjustStock(payload)) applySaleToLocalInventory(payload.items);
    return { id: local[0].id, local: true };
  }
  const ref = await addDoc(collection(db, "orders"), order);
  if (saleShouldAdjustStock(payload)) await applyPaidSale(payload.items);
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
      await setDoc(ref, keepStock ? { ...p, stockBySize: existing.stockBySize, stock: existing.stock } : p);
    })
  );
  await Promise.all(
    seedPortfolio.map((p) => setDoc(doc(db, "portfolio", p.slug), p))
  );
  await Promise.all(
    seedJournal.map((p) => setDoc(doc(db, "journal", p.slug), p))
  );
}

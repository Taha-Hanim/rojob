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
import { seedProducts, seedPortfolio, seedJournal } from "../data/seed";

export { seedJournal };

function withIds(snapshot) {
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Keep local seed commerce fields when Firestore still has preview / empty prices */
function mergeSeedCommerce(rows) {
  const bySlug = Object.fromEntries(seedProducts.map((p) => [p.slug, p]));
  return rows.map((p) => {
    const seed = bySlug[p.slug || p.id];
    if (!seed) return p;
    const needsCommerce =
      p.price == null || p.status === "preview" || p.status == null;
    return {
      ...p,
      price: needsCommerce && p.price == null ? seed.price : p.price ?? seed.price,
      status:
        needsCommerce && (p.status === "preview" || !p.status)
          ? seed.status
          : p.status || seed.status,
      stock: (p.stock == null || p.stock === 0) && seed.stock ? seed.stock : p.stock,
      // Prefer local catalogue imagery (corrected emblems)
      images: seed.images,
    };
  });
}

export async function fetchProductsOnce() {
  if (!isFirebaseConfigured) return seedProducts.map((p) => ({ ...p, id: p.slug }));
  const snap = await getDocs(collection(db, "products"));
  if (snap.empty) return seedProducts.map((p) => ({ ...p, id: p.slug }));
  return mergeSeedCommerce(withIds(snap));
}

export function subscribeProducts(cb) {
  if (!isFirebaseConfigured) {
    cb(seedProducts.map((p) => ({ ...p, id: p.slug })));
    return () => {};
  }
  return onSnapshot(collection(db, "products"), (snap) => {
    if (snap.empty) cb(seedProducts.map((p) => ({ ...p, id: p.slug })));
    else cb(mergeSeedCommerce(withIds(snap)));
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
    return { id: local[0].id, local: true };
  }
  const ref = await addDoc(collection(db, "orders"), order);

  for (const line of payload.items || []) {
    if (!line.productId) continue;
    const productRef = doc(db, "products", line.productId);
    try {
      const snap = await getDoc(productRef);
      if (!snap.exists()) continue;
      const current = Number(snap.data().stock ?? 0);
      const next = Math.max(0, current - Number(line.qty || 0));
      await updateDoc(productRef, { stock: next });
    } catch {
      // Stock update is best-effort; order is already saved
    }
  }

  return { id: ref.id };
}

export async function updateOrderStatus(id, status) {
  if (!isFirebaseConfigured) return;
  await updateDoc(doc(db, "orders", id), { status });
}

export async function saveProduct(product) {
  if (!isFirebaseConfigured) {
    throw new Error("Connect Firebase to save products.");
  }
  if (product.id) {
    const { id, ...rest } = product;
    await setDoc(doc(db, "products", id), rest, { merge: true });
    return id;
  }
  const ref = await addDoc(collection(db, "products"), product);
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
  await Promise.all(
    seedProducts.map((p) => setDoc(doc(db, "products", p.slug), p))
  );
  await Promise.all(
    seedPortfolio.map((p) => setDoc(doc(db, "portfolio", p.slug), p))
  );
  await Promise.all(
    seedJournal.map((p) => setDoc(doc(db, "journal", p.slug), p))
  );
}

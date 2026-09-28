import { addDoc, collection, getDocs, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import { barcodeFor, barcodePng } from "./barcode";
import { seedProducts } from "../data/seed";
import { stockMap } from "./inventory";

const LEDGER_KEY = "rojob_sales_ledger";
const LEDGER_EVENT = "rojob-sales-ledger";

function sizeColumns(products) {
  const set = new Set();
  for (const p of products) {
    for (const s of p.sizes?.length ? p.sizes : ["One size"]) set.add(s);
  }
  const preferred = ["S", "M", "L", "XL", "XXL", "One size"];
  return [
    ...preferred.filter((s) => set.has(s)),
    ...[...set].filter((s) => !preferred.includes(s)),
  ];
}

function readLocalLedger() {
  try {
    const raw = JSON.parse(localStorage.getItem(LEDGER_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function writeLocalLedger(rows) {
  localStorage.setItem(LEDGER_KEY, JSON.stringify(rows));
  window.dispatchEvent(new Event(LEDGER_EVENT));
}

function cataloguePayload(products) {
  return (products?.length ? products : seedProducts).map((p) => ({
    name: p.name,
    color: p.color,
    sku: p.sku || "",
    slug: p.slug,
    sizes: p.sizes,
    stockBySize: p.stockBySize,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
  }));
}

export async function fetchSalesSheetStatus() {
  try {
    const res = await fetch("/api/append-sale");
    const data = await res.json().catch(() => ({}));
    return { configured: Boolean(data.configured) };
  } catch {
    return { configured: false };
  }
}

export async function syncSalesSheet(products, lines = [], { replaceStock = false } = {}) {
  const res = await fetch("/api/append-sale", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      lines,
      catalogue: cataloguePayload(products),
      replaceStock,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok && res.status !== 204) {
    throw new Error(data.error || "Could not update the cloud sheet.");
  }
  return data;
}

async function pushPaidSaleToSheet(lines) {
  try {
    await syncSalesSheet(seedProducts, lines, { replaceStock: false });
  } catch {
    /* Firestore already holds the sale */
  }
}

export async function recordPaidSale(order) {
  const soldAt = new Date().toISOString();
  const buyer = order.customer || {};
  const buyerName = buyer.name || "";
  const buyerEmail = buyer.email || "";
  const buyerPhone = buyer.phone || "";
  const lines = (order.items || []).map((item) => ({
    id: crypto.randomUUID(),
    orderId: order.id || "",
    soldAt,
    barcode: item.barcode || barcodeFor(item.sku || item.slug, item.size),
    sku: item.sku || "",
    slug: item.slug || item.productId || "",
    name: item.name || "",
    color: item.color || "",
    size: item.size || "",
    qty: Math.max(1, Number(item.qty) || 1),
    price: item.price == null ? null : Number(item.price),
    buyerName,
    buyerEmail,
    buyerPhone,
    buyerAddress: buyer.address || "",
    buyerCity: buyer.city || "",
    buyerPostcode: buyer.postcode || "",
    buyerCountry: buyer.country || "",
    buyerNotes: buyer.notes || "",
    // keep legacy single field for older rows / sheets
    customer: buyerEmail || buyerName || buyerPhone || "",
    payment: order.payment || "",
  }));

  const local = [...lines, ...readLocalLedger()];
  writeLocalLedger(local);

  if (isFirebaseConfigured && db) {
    try {
      await Promise.all(
        lines.map((line) =>
          addDoc(collection(db, "salesLedger"), {
            ...line,
            createdAt: serverTimestamp(),
          })
        )
      );
    } catch {
      /* local ledger already saved */
    }
  }

  await pushPaidSaleToSheet(lines);

  return lines;
}

export function subscribeSalesLedger(cb) {
  const emitLocal = () => cb(readLocalLedger());

  if (!isFirebaseConfigured || !db) {
    emitLocal();
    window.addEventListener(LEDGER_EVENT, emitLocal);
    return () => window.removeEventListener(LEDGER_EVENT, emitLocal);
  }

  try {
    return onSnapshot(collection(db, "salesLedger"), (snap) => {
      const rows = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => String(b.soldAt || "").localeCompare(String(a.soldAt || "")));
      cb(rows.length ? rows : readLocalLedger());
    }, emitLocal);
  } catch {
    emitLocal();
    return () => {};
  }
}

export async function fetchSalesLedger() {
  if (!isFirebaseConfigured || !db) return readLocalLedger();
  try {
    const snap = await getDocs(collection(db, "salesLedger"));
    const rows = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => String(b.soldAt || "").localeCompare(String(a.soldAt || "")));
    return rows.length ? rows : readLocalLedger();
  } catch {
    return readLocalLedger();
  }
}

function catalogue(products) {
  return products?.length ? products : seedProducts;
}

export async function downloadSalesWorkbook(products) {
  const excelMod = await import("exceljs");
  const ExcelJS = excelMod.default || excelMod;
  const list = catalogue(products);
  const sales = await fetchSalesLedger();
  const sizes = sizeColumns(list);

  const wb = new ExcelJS.Workbook();
  wb.creator = "ROJOB";
  wb.created = new Date();

  const barcodes = wb.addWorksheet("Barcodes", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  barcodes.columns = [
    { header: "Product", key: "name", width: 22 },
    { header: "Colour", key: "color", width: 16 },
    { header: "SKU", key: "sku", width: 18 },
    ...sizes.map((size) => ({ header: size, key: size, width: 28 })),
  ];
  barcodes.getRow(1).font = { bold: true };

  const stock = wb.addWorksheet("Stock", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  stock.columns = [
    { header: "Product", key: "name", width: 22 },
    { header: "Colour", key: "color", width: 16 },
    { header: "SKU", key: "sku", width: 18 },
    ...sizes.map((size) => ({ header: `${size} qty`, key: `qty_${size}`, width: 12 })),
    { header: "Total", key: "total", width: 10 },
    { header: "Sale PLN", key: "price", width: 12 },
    { header: "Original PLN", key: "compareAtPrice", width: 14 },
  ];
  stock.getRow(1).font = { bold: true };

  let excelRow = 2;
  for (const product of list) {
    const map = stockMap(product);
    const productSizes = product.sizes?.length ? product.sizes : ["One size"];
    const barcodeRow = {
      name: product.name,
      color: product.color,
      sku: product.sku || "",
    };
    const stockRow = {
      name: product.name,
      color: product.color,
      sku: product.sku || "",
      total: Object.values(map).reduce((n, v) => n + Number(v || 0), 0),
      price: product.price ?? "",
      compareAtPrice: product.compareAtPrice ?? "",
    };
    for (const size of sizes) {
      stockRow[`qty_${size}`] = productSizes.includes(size) ? map[size] ?? 0 : "";
    }

    barcodes.addRow(barcodeRow);
    stock.addRow(stockRow);
    barcodes.getRow(excelRow).height = 48;
    stock.getRow(excelRow).alignment = { vertical: "middle" };

    for (const size of sizes) {
      if (!productSizes.includes(size)) continue;
      const col = sizes.indexOf(size) + 4;
      const code = barcodeFor(product.sku || product.slug, size);
      const cell = barcodes.getRow(excelRow).getCell(col);
      cell.value = code;
      cell.alignment = { vertical: "middle", wrapText: true };
      try {
        const png = await barcodePng(code);
        const imgId = wb.addImage({ base64: png, extension: "png" });
        barcodes.addImage(imgId, {
          tl: { col: col - 1, row: excelRow - 1 },
          ext: { width: 170, height: 52 },
        });
      } catch {
        /* barcode number still sits in the cell */
      }
    }
    excelRow += 1;
  }

  const salesSheet = wb.addWorksheet("Sales", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  salesSheet.columns = [
    { header: "Sold at", key: "soldAt", width: 22 },
    { header: "Order", key: "orderId", width: 22 },
    { header: "Barcode", key: "barcode", width: 28 },
    { header: "Product", key: "name", width: 22 },
    { header: "Colour", key: "color", width: 16 },
    { header: "Size", key: "size", width: 12 },
    { header: "Qty", key: "qty", width: 8 },
    { header: "PLN", key: "price", width: 10 },
    { header: "Buyer name", key: "buyerName", width: 22 },
    { header: "Email", key: "buyerEmail", width: 28 },
    { header: "Phone", key: "buyerPhone", width: 16 },
    { header: "Address", key: "buyerAddress", width: 28 },
    { header: "City", key: "buyerCity", width: 16 },
    { header: "Postcode", key: "buyerPostcode", width: 12 },
    { header: "Country", key: "buyerCountry", width: 14 },
    { header: "Notes", key: "buyerNotes", width: 24 },
    { header: "Payment", key: "payment", width: 12 },
  ];
  salesSheet.getRow(1).font = { bold: true };

  let saleRow = 2;
  for (const line of sales) {
    salesSheet.addRow({
      soldAt: line.soldAt || "",
      orderId: line.orderId || "",
      barcode: line.barcode || barcodeFor(line.sku || line.slug, line.size),
      name: line.name || "",
      color: line.color || "",
      size: line.size || "",
      qty: line.qty || 1,
      price: line.price ?? "",
      buyerName: line.buyerName || line.customer || "",
      buyerEmail: line.buyerEmail || "",
      buyerPhone: line.buyerPhone || "",
      buyerAddress: line.buyerAddress || "",
      buyerCity: line.buyerCity || "",
      buyerPostcode: line.buyerPostcode || "",
      buyerCountry: line.buyerCountry || "",
      buyerNotes: line.buyerNotes || "",
      payment: line.payment || "",
    });
    salesSheet.getRow(saleRow).height = 48;
    const code = line.barcode || barcodeFor(line.sku || line.slug, line.size);
    try {
      const png = await barcodePng(code);
      const imgId = wb.addImage({ base64: png, extension: "png" });
      salesSheet.addImage(imgId, {
        tl: { col: 2, row: saleRow - 1 },
        ext: { width: 170, height: 52 },
      });
    } catch {
      /* keep the barcode number */
    }
    saleRow += 1;
  }

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const stamp = new Date().toISOString().slice(0, 10);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ROJOB-sales-${stamp}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

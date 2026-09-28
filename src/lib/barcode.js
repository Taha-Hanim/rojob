/** Compact CODE128 value: SKU letters/digits + size code. */
export function barcodeFor(sku, size) {
  const base = String(sku || "ROJ")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  const rawSize = String(size || "OS").toUpperCase().replace(/[^A-Z0-9]/g, "");
  const sz = !rawSize || rawSize === "ONESIZE" ? "OS" : rawSize;
  return `${base || "ROJ"}${sz}`;
}

export function normalizeBarcode(value) {
  return String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

export function findByBarcode(products, code) {
  const raw = normalizeBarcode(code);
  if (!raw) return null;
  for (const product of products || []) {
    const sizes = product.sizes?.length ? product.sizes : ["One size"];
    for (const size of sizes) {
      const barcode = barcodeFor(product.sku || product.slug, size);
      if (normalizeBarcode(barcode) === raw) {
        return { product, size, barcode };
      }
    }
  }
  return null;
}

export async function barcodePng(value) {
  const mod = await import("jsbarcode");
  const JsBarcode = mod.default || mod;
  const canvas = document.createElement("canvas");
  JsBarcode(canvas, value, {
    format: "CODE128",
    width: 1.4,
    height: 42,
    margin: 6,
    displayValue: true,
    fontSize: 11,
    background: "#ffffff",
    lineColor: "#0D1A2F",
  });
  const dataUrl = canvas.toDataURL("image/png");
  const comma = dataUrl.indexOf(",");
  return dataUrl.slice(comma + 1);
}

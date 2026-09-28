/** Google Apps Script the atelier pastes into a Sheet. Keep in sync with /api/append-sale. */
export const SALES_SHEET_APP_SCRIPT = `const SIZES = ["S", "M", "L", "XL", "XXL", "One size"];

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || "{}");
    const expected = PropertiesService.getScriptProperties().getProperty("ROJOB_SECRET") || "";
    if (expected && body.secret !== expected) {
      return json_({ error: "unauthorized" });
    }
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const barcodes = sheet_(ss, "Barcodes");
    const stock = sheet_(ss, "Stock");
    const sales = sheet_(ss, "Sales");
    setupHeaders_(barcodes, stock, sales);
    upsertCatalogue_(barcodes, stock, body.catalogue || [], !!body.replaceStock);
    appendSales_(sales, body.lines || []);
    if (!body.replaceStock) applyStock_(stock, body.lines || []);
    return json_({ ok: true });
  } catch (err) {
    return json_({ error: String(err) });
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function sheet_(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function setupHeaders_(barcodes, stock, sales) {
  if (barcodes.getLastRow() === 0) {
    barcodes.appendRow(["Product", "Colour", "SKU"].concat(SIZES));
    barcodes.getRange(1, 1, 1, 3 + SIZES.length).setFontWeight("bold");
    barcodes.setFrozenRows(1);
  }
  if (stock.getLastRow() === 0) {
    stock.appendRow(["Product", "Colour", "SKU"].concat(SIZES.map(function (s) { return s + " qty"; })).concat(["Total", "Sale PLN", "Original PLN"]));
    stock.getRange(1, 1, 1, 6 + SIZES.length).setFontWeight("bold");
    stock.setFrozenRows(1);
  }
  if (sales.getLastRow() === 0) {
    sales.appendRow(["Sold at", "Order", "Barcode", "Barcode image", "Product", "Colour", "Size", "Qty", "PLN", "Customer", "Payment"]);
    sales.getRange(1, 1, 1, 11).setFontWeight("bold");
    sales.setFrozenRows(1);
    sales.setColumnWidth(4, 220);
  }
}

function findSkuRow_(sheet, sku) {
  if (!sku) return 0;
  const last = sheet.getLastRow();
  if (last < 2) return 0;
  const values = sheet.getRange(2, 3, last - 1, 1).getValues();
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0]) === sku) return i + 2;
  }
  return 0;
}

function barcodeFormula_(code) {
  const url = "https://bwipjs-api.metafloor.com/?bcid=code128&text=" + encodeURIComponent(code) + "&scale=2&includetext";
  return '=IMAGE("' + url + '")';
}

function compactBarcode_(sku, size) {
  const base = String(sku || "ROJ").toUpperCase().replace(/[^A-Z0-9]/g, "");
  const raw = String(size || "OS").toUpperCase().replace(/[^A-Z0-9]/g, "");
  const sz = !raw || raw === "ONESIZE" ? "OS" : raw;
  return (base || "ROJ") + sz;
}

function upsertCatalogue_(barcodes, stock, catalogue, replaceStock) {
  catalogue.forEach(function (product) {
    const sku = product.sku || product.slug || "";
    const sizes = product.sizes && product.sizes.length ? product.sizes : ["One size"];
    const map = product.stockBySize || {};
    let brow = findSkuRow_(barcodes, sku);
    if (!brow) {
      barcodes.appendRow([product.name || "", product.color || "", sku]);
      brow = barcodes.getLastRow();
    } else {
      barcodes.getRange(brow, 1, 1, 3).setValues([[product.name || "", product.color || "", sku]]);
    }
    barcodes.setRowHeight(brow, 52);
    SIZES.forEach(function (size, i) {
      const cell = barcodes.getRange(brow, 4 + i);
      if (sizes.indexOf(size) === -1) {
        cell.clearContent();
        return;
      }
      const code = compactBarcode_(sku, size);
      cell.setFormula(barcodeFormula_(code));
      barcodes.setColumnWidth(4 + i, 200);
    });

    let srow = findSkuRow_(stock, sku);
    if (!srow) {
      stock.appendRow([product.name || "", product.color || "", sku]);
      srow = stock.getLastRow();
    } else {
      stock.getRange(srow, 1, 1, 3).setValues([[product.name || "", product.color || "", sku]]);
    }
    if (replaceStock || srow === stock.getLastRow() && stock.getRange(srow, 4).isBlank()) {
      var total = 0;
      SIZES.forEach(function (size, i) {
        const qty = sizes.indexOf(size) === -1 ? "" : Number(map[size] || 0);
        stock.getRange(srow, 4 + i).setValue(qty);
        if (qty !== "") total += Number(qty || 0);
      });
      stock.getRange(srow, 4 + SIZES.length).setValue(total);
      stock.getRange(srow, 5 + SIZES.length).setValue(product.price == null ? "" : product.price);
      stock.getRange(srow, 6 + SIZES.length).setValue(product.compareAtPrice == null ? "" : product.compareAtPrice);
    }
  });
}

function appendSales_(sales, lines) {
  lines.forEach(function (line) {
    const code = line.barcode || compactBarcode_(line.sku || line.slug, line.size);
    sales.appendRow([
      line.soldAt || new Date().toISOString(),
      line.orderId || "",
      code,
      "",
      line.name || "",
      line.color || "",
      line.size || "",
      line.qty || 1,
      line.price == null ? "" : line.price,
      line.customer || "",
      line.payment || "",
    ]);
    const row = sales.getLastRow();
    sales.setRowHeight(row, 52);
    sales.getRange(row, 4).setFormula(barcodeFormula_(code));
  });
}

function applyStock_(stock, lines) {
  lines.forEach(function (line) {
    const sku = line.sku || "";
    const row = findSkuRow_(stock, sku);
    if (!row) return;
    const size = line.size || "One size";
    const idx = SIZES.indexOf(size);
    if (idx === -1) return;
    const cell = stock.getRange(row, 4 + idx);
    const current = Number(cell.getValue() || 0);
    const next = Math.max(0, current - Math.max(1, Number(line.qty) || 1));
    cell.setValue(next);
    var total = 0;
    SIZES.forEach(function (_, i) {
      total += Number(stock.getRange(row, 4 + i).getValue() || 0);
    });
    stock.getRange(row, 4 + SIZES.length).setValue(total);
  });
}
`;

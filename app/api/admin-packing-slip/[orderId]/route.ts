import { Buffer } from "node:buffer";
import { NextResponse } from "next/server";
import { PDFDocument, PageSizes, StandardFonts, rgb, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";
import QRCode from "qrcode";
import { adminDb } from "@/lib/firebaseAdmin";
import type { Order } from "@/lib/order";

export const runtime = "nodejs";

type Color = readonly [number, number, number];
type PackingItem = Pick<Order["items"][number], "id" | "name" | "quantity" | "price" | "image" | "images"> & {
  variant: string;
  size: string;
  weight: string;
};
type PackingSlipOrder = Pick<Order, "id" | "orderId" | "invoiceNumber" | "customer" | "address" | "totals" | "status"> & {
  createdAt?: Date;
  items: PackingItem[];
  packedAt?: Date;
};
type ProductLookup = { id: string; slug: string; name: string; image: string; images: string[]; variant: string; size: string; weight: string };

const BLACK: Color = [0.05, 0.05, 0.05];
const GRAY: Color = [0.35, 0.35, 0.35];
const LIGHT_GRAY: Color = [0.94, 0.94, 0.94];
const WHITE: Color = [1, 1, 1];
const BARCODE_PATTERNS = [
  "212222","222122","222221","121223","121322","131222","122213","122312","132212","221213","221312","231212","112232","122132","122231","113222","123122","123221","223211","221132","221231","213212","223112","312131","311222","321122","321221","312212","322112","322211","212123","212321","232121","111323","131123","131321","112313","132113","132311","211313","231113","231311","112133","112331","132131","113123","113321","133121","313121","211331","231131","213113","213311","213131","311123","311321","331121","312113","312311","332111","314111","221411","431111","111224","111422","121124","121421","141122","141221","112214","112412","122114","122411","142112","142211","241211","221114","413111","241112","134111","111242","121142","121241","114212","124112","124211","411212","421112","421211","212141","214121","412121","111143","111341","131141","114113","114311","411113","411311","113141","114131","311141","411131","211412","211214","211232","2331112"
] as const;

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? value as Record<string, unknown> : {};
}
function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value.trim() : typeof value === "number" ? String(value) : fallback;
}
function asNumber(value: unknown, fallback = 0): number {
  const numberValue = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isFinite(numberValue) ? numberValue : fallback;
}
function asStrings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.length > 0) : [];
}
function parseDate(value: unknown): Date | undefined {
  if (value instanceof Date) return value;
  const record = asRecord(value);
  if (typeof record.toDate === "function") return record.toDate() as Date;
  const seconds = asNumber(record.seconds, Number.NaN);
  return Number.isFinite(seconds) ? new Date(seconds * 1000) : undefined;
}
function formatDate(value?: Date): string {
  return (value ?? new Date()).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function formatCurrency(value: number): string {
  return `Rs. ${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}
function cleanPdfText(value: string): string {
  return value.replace(/[^\x20-\x7E]/g, "-");
}
function textWidth(font: PDFFont, value: string, size: number): number {
  return font.widthOfTextAtSize(cleanPdfText(value), size);
}
function wrap(font: PDFFont, value: string, size: number, width: number): string[] {
  const words = cleanPdfText(value).split(/\s+/).filter(Boolean);
  if (!words.length) return ["-"];
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (!current || textWidth(font, candidate, size) <= width) current = candidate;
    else { lines.push(current); current = word; }
  }
  lines.push(current);
  return lines;
}
function drawText(page: PDFPage, font: PDFFont, value: string, x: number, y: number, size: number, color: Color = BLACK, width?: number, align: "left" | "right" | "center" = "left"): number {
  const lines = width ? wrap(font, value, size, width) : [cleanPdfText(value)];
  const lineHeight = size + 3;
  lines.forEach((line, index) => {
    const lineWidth = textWidth(font, line, size);
    const drawX = align === "right" ? x - lineWidth : align === "center" && width ? x + (width - lineWidth) / 2 : x;
    page.drawText(line, { x: drawX, y: y - index * lineHeight, size, font, color: rgb(...color) });
  });
  return y - lines.length * lineHeight;
}
function box(page: PDFPage, x: number, y: number, width: number, height: number, fill: Color = WHITE, border: Color = BLACK): void {
  page.drawRectangle({ x, y, width, height, color: rgb(...fill), borderColor: rgb(...border), borderWidth: 0.7 });
}
function labelValue(page: PDFPage, regular: PDFFont, bold: PDFFont, label: string, value: string, x: number, y: number, width: number): number {
  drawText(page, bold, label, x, y, 7, GRAY);
  return drawText(page, regular, value || "-", x, y - 10, 8, BLACK, width);
}
function barcodeValues(value: string): number[] {
  const safeValue = cleanPdfText(value).slice(0, 80) || "ORDER";
  const values = [104, ...[...safeValue].map((character) => Math.min(94, Math.max(0, character.charCodeAt(0) - 32)))];
  const checksum = values.slice(1).reduce((total, code, index) => total + code * (index + 1), values[0]) % 103;
  return [...values, checksum, 106];
}
function drawCode128(page: PDFPage, value: string, x: number, y: number, width: number, height: number): void {
  const pattern = barcodeValues(value).map((code) => BARCODE_PATTERNS[code]).join("");
  const modules = [...pattern].reduce((total, unit) => total + Number(unit), 0);
  const scale = width / modules;
  let cursor = x;
  let black = true;
  for (const digit of pattern) {
    const segmentWidth = Number(digit) * scale;
    if (black) page.drawRectangle({ x: cursor, y, width: segmentWidth, height, color: rgb(...BLACK) });
    cursor += segmentWidth;
    black = !black;
  }
}
async function embedImage(pdf: PDFDocument, source: string): Promise<PDFImage | undefined> {
  if (!source.startsWith("http")) return undefined;
  try {
    const response = await fetch(source);
    if (!response.ok) return undefined;
    const bytes = await response.arrayBuffer();
    const type = response.headers.get("content-type") ?? "";
    return type.includes("png") ? pdf.embedPng(bytes) : pdf.embedJpg(bytes);
  } catch { return undefined; }
}
function assetUrl(source: string, request: Request): string {
  if (!source) return "";
  try { return new URL(source, request.url).toString(); } catch { return ""; }
}
function drawHeader(page: PDFPage, regular: PDFFont, bold: PDFFont, order: PackingSlipOrder, logo: PDFImage | undefined, width: number, height: number, margin: number): number {
  const headerHeight = 84;
  box(page, margin, height - margin - headerHeight, width - margin * 2, headerHeight, LIGHT_GRAY);
  const logoSize = 70;
  if (logo) {
    const scale = Math.min(logoSize / logo.width, logoSize / logo.height);
    const logoWidth = logo.width * scale;
    const logoHeight = logo.height * scale;
    page.drawImage(logo, { x: margin + 10 + (logoSize - logoWidth) / 2, y: height - margin - 7 - logoSize + (logoSize - logoHeight) / 2, width: logoWidth, height: logoHeight });
  }
  const companyX = margin + 100;
  drawText(page, bold, "ARAM NARPAVI HERBALS", companyX, height - margin - headerHeight / 2 - 8, 16);
  const detailsX = width - margin - 210;
  const detailY = height - margin - 12;
  const invoiceY = labelValue(page, regular, bold, "ORDER ID", order.orderId, detailsX, detailY, 92) - 3;
  labelValue(page, regular, bold, "INVOICE NUMBER", order.invoiceNumber, detailsX, invoiceY, 92);
  const rightX = width - margin - 100;
  const statusY = labelValue(page, regular, bold, "ORDER DATE", formatDate(order.createdAt), rightX, detailY, 86) - 3;
  labelValue(page, regular, bold, "ORDER STATUS", order.status, rightX, statusY, 86);
  return height - margin - headerHeight - 10;
}
function drawAddressBlocks(page: PDFPage, regular: PDFFont, bold: PDFFont, order: PackingSlipOrder, y: number, margin: number, contentWidth: number): number {
  const gap = 12;
  const width = (contentWidth - gap) / 2;
  const height = 118;
  box(page, margin, y - height, width, height);
  box(page, margin + width + gap, y - height, width, height);
  drawText(page, bold, "CUSTOMER ADDRESS", margin + 10, y - 15, 9);
  drawText(page, bold, "RETURN ADDRESS", margin + width + gap + 10, y - 15, 9);
  const customerLines = [
    order.customer.name,
    `Phone: ${order.customer.phone}`,
    [order.address.houseNo, order.address.street].filter(Boolean).join(", "),
    order.address.area,
    [order.address.city, order.address.district].filter(Boolean).join(", "),
    order.address.state,
    [order.address.pincode, order.address.country].filter(Boolean).join(", "),
  ].filter(Boolean);
  const returnLines = ["Aram Narpavi Herbals", "NO.1555/A", "Karattan Kulam Street", "Devikapuram", "Tiruvannamalai", "Tamil Nadu", "606902", "GSTIN: 33AABCU9603R1Z7", "Phone: +91 95853 04545"];
  customerLines.forEach((line, index) => drawText(page, regular, line, margin + 10, y - 30 - index * 10, 7.5, BLACK, width - 20));
  returnLines.forEach((line, index) => drawText(page, regular, line, margin + width + gap + 10, y - 30 - index * 10, 7.5, BLACK, width - 20));
  return y - height - 10;
}
function drawTableHeader(page: PDFPage, bold: PDFFont, x: number, y: number, widths: number[]): void {
  const titles = ["IMAGE", "PRODUCT DETAILS", "QUANTITY"];
  let currentX = x;
  titles.forEach((title, index) => { box(page, currentX, y - 20, widths[index], 20, LIGHT_GRAY); drawText(page, bold, title, currentX + (index === 2 ? 0 : 5), y - 13, 7, BLACK, index === 2 ? widths[index] : undefined, index === 2 ? "center" : "left"); currentX += widths[index]; });
}
function drawFooter(page: PDFPage, regular: PDFFont, bold: PDFFont, order: PackingSlipOrder, width: number, margin: number): void {
  const midpoint = width / 2;
  const footerTop = margin + 49;
  drawText(page, bold, "Packing Date", margin, footerTop, 7, GRAY);
  drawText(page, regular, formatDate(order.packedAt), margin, footerTop - 12, 8);
  drawText(page, bold, "Generated Date", midpoint, footerTop, 7, GRAY);
  drawText(page, regular, formatDate(), midpoint, footerTop - 12, 8);
  page.drawLine({ start: { x: margin, y: margin + 25 }, end: { x: width - margin, y: margin + 25 }, thickness: 0.5, color: rgb(...GRAY) });
  drawText(page, regular, "This packing slip is generated automatically for warehouse processing.", margin, margin + 12, 7, GRAY);
}
function normalizeOrder(raw: Record<string, unknown>, id: string, products: ProductLookup[]): PackingSlipOrder {
  const customer = asRecord(raw.customer); const address = asRecord(raw.address); const totals = asRecord(raw.totals);
  const productByKey = new Map(products.flatMap((product) => [[product.id, product], [product.slug, product], [product.name.toLowerCase(), product]]));
  const items = (Array.isArray(raw.items) ? raw.items : []).map((item, index) => {
    const record = asRecord(item);
    const name = asString(record.name, "Product");
    const product = productByKey.get(asString(record.id)) ?? productByKey.get(asString(record.productId)) ?? productByKey.get(name.toLowerCase());
    const images = asStrings(record.images);
    return {
      id: asString(record.id, `item-${index + 1}`),
      name,
      quantity: asNumber(record.quantity, 1),
      price: asNumber(record.price, asNumber(record.unitPrice)),
      image: asString(record.image, product?.image ?? images[0] ?? ""),
      images: images.length ? images : product?.images ?? [],
      variant: asString(record.variant, asString(record.variantName, product?.variant ?? "")),
      size: asString(record.size, asString(record.productSize, product?.size ?? "")),
      weight: asString(record.weight, asString(record.productWeight, product?.weight ?? "")),
    };
  });
  const subtotal = asNumber(totals.subtotal); const deliveryCharge = asNumber(totals.deliveryCharge); const gst = asNumber(totals.gst); const discount = asNumber(totals.discount);
  return { id: asString(raw.id, id), orderId: asString(raw.orderId, id), invoiceNumber: asString(raw.invoiceNumber, `INV-${id}`), customer: { uid: asString(customer.uid), name: asString(customer.name, "Customer"), email: asString(customer.email), phone: asString(customer.phone, asString(address.phone, "-")) }, address: { id: asString(address.id), fullName: asString(address.fullName), phone: asString(address.phone), houseNo: asString(address.houseNo), street: asString(address.street), area: asString(address.area), landmark: asString(address.landmark), city: asString(address.city), district: asString(address.district), state: asString(address.state), country: asString(address.country, "India"), pincode: asString(address.pincode), type: "Home", isDefault: false }, items, totals: { subtotal, deliveryCharge, gst, discount, coupon: asString(totals.coupon), grandTotal: asNumber(totals.grandTotal, subtotal + deliveryCharge + gst - discount) }, status: asString(raw.status, "Placed") as Order["status"], createdAt: parseDate(raw.createdAt), packedAt: parseDate(raw.packedAt) };
}
function parseProducts(documents: Array<{ id: string; data: () => Record<string, unknown> }>): ProductLookup[] {
  return documents.map((document) => {
    const product = document.data();
    return {
      id: document.id,
      slug: asString(product.slug),
      name: asString(product.name),
      image: asString(product.image),
      images: asStrings(product.images),
      variant: asString(product.variant, asString(product.variantName)),
      size: asString(product.size, asString(product.productSize)),
      weight: asString(product.weight, asString(product.productWeight)),
    };
  });
}

export async function GET(_request: Request, context: RouteContext<"/api/admin-packing-slip/[orderId]">) {
  try {
    const { orderId } = await context.params;
    const [orderSnapshot, productSnapshot] = await Promise.all([adminDb.collection("orders").doc(orderId).get(), adminDb.collection("products").get()]);
    if (!orderSnapshot.exists) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    const rawOrder = orderSnapshot.data();
    if (!rawOrder) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    const order = normalizeOrder(rawOrder as Record<string, unknown>, orderId, parseProducts(productSnapshot.docs));
    const pdf = await PDFDocument.create(); const regular = await pdf.embedFont(StandardFonts.Helvetica); const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const [pageWidth, pageHeight] = PageSizes.A4; const margin = 30; const contentWidth = pageWidth - margin * 2;
    const logoUrl = new URL("/logo/aram_logo.png", _request.url).toString();
    const logo = await embedImage(pdf, logoUrl);
    let page = pdf.addPage(PageSizes.A4); let y = drawAddressBlocks(page, regular, bold, order, drawHeader(page, regular, bold, order, logo, pageWidth, pageHeight, margin), margin, contentWidth);
    const barcodeWidth = 250; const barcodeX = (pageWidth - barcodeWidth) / 2;
    drawCode128(page, order.orderId, barcodeX, y - 42, barcodeWidth, 38); drawText(page, regular, order.orderId, barcodeX, y - 53, 8, BLACK, barcodeWidth, "center");
    const qrPayload = `Order ID: ${order.orderId}\nInvoice Number: ${order.invoiceNumber}\nCustomer Name: ${order.customer.name}\nPhone: ${order.customer.phone}\nGrand Total: ${formatCurrency(order.totals.grandTotal)}`;
    const qrData = await QRCode.toDataURL(qrPayload, { type: "image/png", errorCorrectionLevel: "M", margin: 1, width: 240 });
    const qrImage = await pdf.embedPng(Buffer.from(qrData.split(",")[1] ?? "", "base64")); const qrSize = 70;
    page.drawImage(qrImage, { x: pageWidth - margin - qrSize, y: y - 72, width: qrSize, height: qrSize });
    y -= 88;
    const widths = [88, 365, 82]; drawTableHeader(page, bold, margin, y, widths); y -= 20;
    for (const item of order.items) {
      const details = [["Variant", item.variant], ["Product Size", item.size], ["Product Weight", item.weight]].filter(([, value]) => Boolean(value)) as Array<[string, string]>;
      const nameLines = wrap(bold, item.name, 9, widths[1] - 16);
      const rowHeight = Math.max(80, 18 + (nameLines.length + details.length) * 12);
      if (y - rowHeight < 98) {
        drawFooter(page, regular, bold, order, pageWidth, margin);
        page = pdf.addPage(PageSizes.A4);
        y = pageHeight - margin;
        drawTableHeader(page, bold, margin, y, widths);
        y -= 20;
      }
      let x = margin; widths.forEach((columnWidth) => { box(page, x, y - rowHeight, columnWidth, rowHeight); x += columnWidth; });
      const image = await embedImage(pdf, assetUrl(item.image || item.images[0] || "", _request));
      if (image) {
        const imageSize = 70;
        const scale = Math.min(imageSize / image.width, imageSize / image.height);
        const drawnWidth = image.width * scale;
        const drawnHeight = image.height * scale;
        page.drawImage(image, { x: margin + (widths[0] - drawnWidth) / 2, y: y - (rowHeight + drawnHeight) / 2, width: drawnWidth, height: drawnHeight });
      }
      x = margin + widths[0];
      let detailY = drawText(page, bold, item.name, x + 8, y - 14, 9, BLACK, widths[1] - 16) - 1;
      details.forEach(([label, value]) => { detailY = drawText(page, regular, `${label}: ${value}`, x + 8, detailY, 7.5, GRAY, widths[1] - 16) - 1; });
      x += widths[1];
      drawText(page, bold, String(item.quantity), x, y - rowHeight / 2 + 3, 10, BLACK, widths[2], "center");
      y -= rowHeight;
    }
    const summaryHeight = 98;
    if (y - summaryHeight - 12 < 98) { drawFooter(page, regular, bold, order, pageWidth, margin); page = pdf.addPage(PageSizes.A4); y = pageHeight - margin; }
    const summaryX = pageWidth - margin - 220; box(page, summaryX, y - summaryHeight, 220, summaryHeight); drawText(page, bold, "ORDER SUMMARY", summaryX + 10, y - 14, 9);
    [["Subtotal", order.totals.subtotal], ["Delivery Charge", order.totals.deliveryCharge], ["Discount", -order.totals.discount], ["GST", order.totals.gst], ["Grand Total", order.totals.grandTotal]].forEach(([label, amount], index) => { const rowY = y - 29 - index * 13; drawText(page, index === 4 ? bold : regular, String(label), summaryX + 10, rowY, 7.5); drawText(page, index === 4 ? bold : regular, formatCurrency(Number(amount)), summaryX + 210, rowY, 7.5, BLACK, undefined, "right"); });
    y -= summaryHeight + 10;
    drawFooter(page, regular, bold, order, pageWidth, margin);
    const bytes = await pdf.save();
    return new NextResponse(Buffer.from(bytes), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="Packing-Slip-${order.orderId}.pdf"`, "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Unable to generate admin packing slip", error);
    return NextResponse.json({ error: "Unable to generate packing slip" }, { status: 500 });
  }
}

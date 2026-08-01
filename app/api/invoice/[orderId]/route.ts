import { Buffer } from "node:buffer";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import QRCode from "qrcode";
import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb, PageSizes, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";
import { adminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

export async function generateInvoicePdf(orderId: string): Promise<Buffer> {
  const response = await GET(new Request(`http://localhost/api/invoice/${orderId}`), {
    params: Promise.resolve({ orderId }),
  });

  if (!response.ok) {
    throw new Error(`Unable to generate invoice for order ${orderId}.`);
  }

  return Buffer.from(await response.arrayBuffer());
}

type InvoiceItem = {
  name: string;
  quantity: number;
  price: number;
};

type InvoiceTotals = {
  subtotal: number;
  deliveryCharge: number;
  gst: number;
  discount: number;
  grandTotal: number;
};

type InvoiceCustomer = {
  name: string;
  email: string;
  phone: string;
};

type InvoiceAddress = {
  fullName?: string;
  phone?: string;
  houseNo?: string;
  street?: string;
  area?: string;
  landmark?: string;
  city?: string;
  district?: string;
  state?: string;
  country?: string;
  pincode?: string;
};

type InvoiceOrder = {
  id: string;
  orderId: string;
  invoiceNumber: string;
  customer: InvoiceCustomer;
  address: InvoiceAddress;
  items: InvoiceItem[];
  totals: InvoiceTotals;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  createdAt?: Date;
  estimatedDelivery?: string;
};

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") {
    return value.trim() || fallback;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

function parseTimestamp(value: unknown): Date | undefined {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "object" && value !== null) {
    const timestamp = value as { seconds?: unknown; toDate?: () => Date };

    if (typeof timestamp.seconds === "number") {
      return new Date(timestamp.seconds * 1000);
    }

    if (typeof timestamp.seconds === "string") {
      const parsedSeconds = Number(timestamp.seconds);
      if (Number.isFinite(parsedSeconds)) {
        return new Date(parsedSeconds * 1000);
      }
    }

    if (typeof timestamp.toDate === "function") {
      return timestamp.toDate();
    }
  }

  return undefined;
}

function parseInvoiceOrder(rawOrder: Record<string, unknown>, fallbackOrderId: string): InvoiceOrder {
  const customerValue = typeof rawOrder.customer === "object" && rawOrder.customer !== null ? (rawOrder.customer as Record<string, unknown>) : {};
  const addressValue = typeof rawOrder.address === "object" && rawOrder.address !== null ? (rawOrder.address as Record<string, unknown>) : {};
  const totalsValue = typeof rawOrder.totals === "object" && rawOrder.totals !== null ? (rawOrder.totals as Record<string, unknown>) : {};
  const itemsValue = Array.isArray(rawOrder.items) ? rawOrder.items : [];

  const subtotal = asNumber(totalsValue.subtotal, 0);
  const deliveryCharge = asNumber(totalsValue.deliveryCharge, 0);
  const gst = asNumber(totalsValue.gst, 0);
  const discount = asNumber(totalsValue.discount, 0);
  const grandTotal = asNumber(totalsValue.grandTotal, subtotal + deliveryCharge + gst - discount);

  return {
    id: asString(rawOrder.id, fallbackOrderId),
    orderId: asString(rawOrder.orderId, fallbackOrderId),
    invoiceNumber: asString(rawOrder.invoiceNumber, `INV-${fallbackOrderId}`),
    customer: {
      name: asString(customerValue.name, "Customer"),
      email: asString(customerValue.email, "N/A"),
      phone: asString(customerValue.phone, "N/A"),
    },
    address: {
      fullName: asString(addressValue.fullName),
      phone: asString(addressValue.phone),
      houseNo: asString(addressValue.houseNo),
      street: asString(addressValue.street),
      area: asString(addressValue.area),
      landmark: asString(addressValue.landmark),
      city: asString(addressValue.city),
      district: asString(addressValue.district),
      state: asString(addressValue.state),
      country: asString(addressValue.country),
      pincode: asString(addressValue.pincode),
    },
    items: itemsValue.map((item) => {
      const itemRecord = typeof item === "object" && item !== null ? (item as Record<string, unknown>) : {};
      return {
        name: asString(itemRecord.name, "Product"),
        quantity: asNumber(itemRecord.quantity, 1),
        price: asNumber(itemRecord.price, asNumber(itemRecord.unitPrice, 0)),
      };
    }),
    totals: {
      subtotal,
      deliveryCharge,
      gst,
      discount,
      grandTotal,
    },
    paymentMethod: asString(rawOrder.paymentMethod, "Cash On Delivery"),
    paymentStatus: asString(rawOrder.paymentStatus, "Pending"),
    status: asString(rawOrder.status, "Placed"),
    createdAt: parseTimestamp(rawOrder.createdAt),
    estimatedDelivery: asString(rawOrder.estimatedDelivery, "To be confirmed"),
  };
}

function formatCurrency(value: number): string {
  return `Rs. ${value.toFixed(0)}`;
}

function formatDate(value: Date): string {
  return value.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function wrapText(font: PDFFont, text: string, maxWidth: number, size: number): string[] {
  if (font.widthOfTextAtSize(text, size) <= maxWidth) {
    return [text];
  }

  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (!currentLine || font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      currentLine = candidate;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function drawText(
  page: PDFPage,
  x: number,
  y: number,
  text: string,
  font: PDFFont,
  size: number,
  color: [number, number, number],
  maxWidth?: number,
  lineHeight = 14,
  align: "left" | "right" = "left"
): number {
  const lines = maxWidth ? wrapText(font, text, maxWidth, size) : [text];
  lines.forEach((line, index) => {
    const textWidth = font.widthOfTextAtSize(line, size);
    const drawX = align === "right" ? x - textWidth : x;
    page.drawText(line, {
      x: drawX,
      y: y - index * lineHeight,
      size,
      font,
      color: rgb(color[0], color[1], color[2]),
    });
  });
  return y - lines.length * lineHeight;
}

function drawRoundedCard(
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: [number, number, number],
  border: [number, number, number],
  borderWidth = 1,
  _radius = 10
): void {
  page.drawRectangle({
    x,
    y,
    width,
    height,
    borderColor: rgb(border[0], border[1], border[2]),
    borderWidth,
    color: rgb(fill[0], fill[1], fill[2]),
  });
}

function badgeColor(paymentMethod: string): [number, number, number] {
  if (paymentMethod.toLowerCase().includes("cash")) {
    return [0.96, 0.58, 0.15];
  }
  return [0.18, 0.58, 0.22];
}

function badgeStatusColor(status: string): [number, number, number] {
  const normalized = status.toLowerCase();
  if (normalized === "placed") return [0.11, 0.48, 0.84];
  if (normalized === "accepted") return [0.55, 0.30, 0.74];
  if (normalized === "processing") return [0.93, 0.58, 0.15];
  if (normalized === "shipped") return [0.08, 0.34, 0.58];
  if (normalized === "delivered") return [0.18, 0.58, 0.22];
  if (normalized === "cancelled") return [0.82, 0.23, 0.27];
  return [0.41, 0.41, 0.41];
}

function drawBadge(
  page: PDFPage,
  x: number,
  y: number,
  text: string,
  font: PDFFont,
  fill: [number, number, number],
  textColor: [number, number, number],
  width: number,
  height: number
): void {
  page.drawRectangle({
    x,
    y,
    width,
    height,
    color: rgb(fill[0], fill[1], fill[2]),
  });
  const textWidth = font.widthOfTextAtSize(text, 8);
  const textX = x + (width - textWidth) / 2;
  const textY = y + (height - 8) / 2 - 1;
  page.drawText(text, {
    x: textX,
    y: textY,
    size: 8,
    font,
    color: rgb(textColor[0], textColor[1], textColor[2]),
  });
}

function drawFooter(page: PDFPage, pageNumber: number, totalPages: number, width: number, margin: number, font: PDFFont, color: [number, number, number]): void {
  const footerText = "Thank you for shopping with Aram Narpavi Herbals.";
  const subText = "Nature's Purity, Tradition's Healing";
  const infoText = "This is a computer-generated invoice and does not require a signature.";
  drawText(page, margin, margin + 34, footerText, font, 9, color);
  drawText(page, margin, margin + 20, subText, font, 8, color);
  drawText(page, margin, margin + 8, infoText, font, 7, color);
  const pageLabel = `Page ${pageNumber} of ${totalPages}`;
  const pageLabelWidth = font.widthOfTextAtSize(pageLabel, 8);
  page.drawText(pageLabel, {
    x: width - margin - pageLabelWidth,
    y: margin + 8,
    size: 8,
    font,
    color: rgb(color[0], color[1], color[2]),
  });
}

function drawWatermark(page: PDFPage, image: PDFImage, width: number, height: number): void {
  const scale = Math.min(260 / image.width, 260 / image.height);
  const watermarkWidth = image.width * scale;
  const watermarkHeight = image.height * scale;
  page.drawImage(image, {
    x: (width - watermarkWidth) / 2,
    y: (height - watermarkHeight) / 2,
    width: watermarkWidth,
    height: watermarkHeight,
    opacity: 0.08,
  });
}

export async function GET(_request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const { orderId } = await params;
    const orderSnapshot = await adminDb.collection("orders").doc(orderId).get();

    if (!orderSnapshot.exists) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const rawOrder = orderSnapshot.data();
    if (!rawOrder) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const order = parseInvoiceOrder(rawOrder as Record<string, unknown>, orderId);
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const logoPath = join(process.cwd(), "public", "logo", "aram_logo.png");
    const logoBytes = readFileSync(logoPath);
    const logoImage = await pdfDoc.embedPng(logoBytes);

    const qrPayload = `Order Number: ${order.orderId}\nInvoice Number: ${order.invoiceNumber}\nWebsite: www.aramnarpavi.com`;
    const qrDataUrl = await QRCode.toDataURL(qrPayload, { type: "image/png", errorCorrectionLevel: "H", margin: 1, width: 280 });
    const qrBase64 = qrDataUrl.split(",")[1] ?? "";
    const qrImage = await pdfDoc.embedPng(Buffer.from(qrBase64, "base64"));

    const darkGreen: [number, number, number] = [0.08, 0.24, 0.14];
    const lightGreen: [number, number, number] = [0.94, 0.98, 0.94];
    const borderColor: [number, number, number] = [0.87, 0.91, 0.87];
    const gray: [number, number, number] = [0.40, 0.40, 0.40];
    const lightGray: [number, number, number] = [0.96, 0.96, 0.96];

    // Page layout constants
    const pageWidth = PageSizes.A4[0];
    const pageHeight = PageSizes.A4[1];
    const margin = 40;
    const contentWidth = pageWidth - margin * 2;
    const footerHeight = 50;
    const printableHeight = pageHeight - margin - footerHeight;

    // Column widths
    const snoWidth = 35;
    const productWidth = 230;
    const qtyWidth = 45;
    const unitPriceWidth = 90;
    const totalWidth = 90;
    const totalTableWidth = snoWidth + productWidth + qtyWidth + unitPriceWidth + totalWidth;

    // Column positions (left-aligned)
    const snoX = margin + 6;
    const productX = snoX + snoWidth;
    const qtyX = productX + productWidth;
    const unitPriceX = qtyX + qtyWidth;
    const totalX = unitPriceX + unitPriceWidth;

    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    drawWatermark(page, logoImage, pageWidth, pageHeight);

    // HEADER SECTION
    const logoDisplayWidth = 110;
    const logoDisplayHeight = (logoImage.height / logoImage.width) * logoDisplayWidth;
    page.drawImage(logoImage, {
      x: margin,
      y: pageHeight - margin - logoDisplayHeight,
      width: logoDisplayWidth,
      height: logoDisplayHeight,
    });

    drawText(page, margin, pageHeight - margin - logoDisplayHeight - 12, "Nature's Purity, Tradition's Healing", font, 8, gray);

    // Invoice title and details on the right
    const invoiceHeaderX = pageWidth - margin - 200;
    let headerY = pageHeight - margin;
    drawText(page, invoiceHeaderX, headerY, "INVOICE", boldFont, 20, darkGreen);
    headerY -= 20;
    drawText(page, invoiceHeaderX, headerY, `Invoice #: ${order.invoiceNumber}`, font, 8, gray);
    headerY -= 12;
    drawText(page, invoiceHeaderX, headerY, `Order #: ${order.orderId}`, font, 8, gray);
    headerY -= 12;
    drawText(page, invoiceHeaderX, headerY, `Date: ${formatDate(order.createdAt ?? new Date())}`, font, 8, gray);

    // QR Code
    const qrSize = 55;
    page.drawImage(qrImage, {
      x: pageWidth - margin - qrSize,
      y: pageHeight - margin - 90,
      width: qrSize,
      height: qrSize,
    });

    // COMPANY & CUSTOMER INFO SECTION
    let sectionY = pageHeight - margin - logoDisplayHeight - 40;

    // Company info card
    const companyCardHeight = 70;
    drawRoundedCard(page, margin, sectionY - companyCardHeight, contentWidth, companyCardHeight, lightGreen, borderColor, 1, 0);
    let cardY = sectionY - 12;
    drawText(page, margin + 12, cardY, "Aram Narpavi Herbals", boldFont, 10, darkGreen);
    cardY -= 12;
    drawText(page, margin + 12, cardY, "GSTIN: 33AABCU9603R1Z7", font, 7, gray);
    cardY -= 10;
    drawText(page, margin + 12, cardY, "Phone: +91 95853 04545 | Email: aramnarpavi@gmail.com", font, 7, gray);

    sectionY -= companyCardHeight + 8;

    // Bill To and Shipping Address (side by side)
    const addressCardPadding = 20;
    const addressCardGap = 20;
    const addressCardWidth = (contentWidth - addressCardGap) / 2;
    const addressCardHeight = 75;
    const billToX = margin;
    const shippingX = margin + addressCardWidth + addressCardGap;

    drawRoundedCard(page, billToX, sectionY - addressCardHeight, addressCardWidth, addressCardHeight, lightGreen, borderColor, 1, 0);
    let billY = sectionY - addressCardPadding;
    drawText(page, billToX + addressCardPadding, billY, "Bill To", boldFont, 9, darkGreen);
    billY -= 14;
    drawText(page, billToX + addressCardPadding, billY, order.customer.name, font, 8, darkGreen);
    billY -= 10;
    drawText(page, billToX + addressCardPadding, billY, order.customer.phone, font, 7, gray);
    billY -= 9;
    drawText(page, billToX + addressCardPadding, billY, order.customer.email, font, 7, gray);

    drawRoundedCard(page, shippingX, sectionY - addressCardHeight, addressCardWidth, addressCardHeight, lightGreen, borderColor, 1, 0);
    let shipY = sectionY - addressCardPadding;
    drawText(page, shippingX + addressCardPadding, shipY, "Shipping Address", boldFont, 9, darkGreen);
    shipY -= 14;
    drawText(page, shippingX + addressCardPadding, shipY, `${order.address.houseNo || "—"}, ${order.address.street || "—"}`, font, 7, gray, addressCardWidth - addressCardPadding * 2);
    shipY -= 10;
    drawText(page, shippingX + addressCardPadding, shipY, `${order.address.area || "—"}, ${order.address.city || "—"}`, font, 7, gray, addressCardWidth - addressCardPadding * 2);
    shipY -= 9;
    drawText(page, shippingX + addressCardPadding, shipY, `${order.address.state || "—"} ${order.address.pincode || "—"}`, font, 7, gray, addressCardWidth - addressCardPadding * 2);

    sectionY -= addressCardHeight + 8;

    // ORDER INFORMATION & PAYMENT STATUS SECTION
    const orderInfoHeight = 52;
    drawRoundedCard(page, margin, sectionY - orderInfoHeight, contentWidth, orderInfoHeight, [1, 1, 1], borderColor, 1, 0);

    let infoY = sectionY - 10;
    drawText(page, margin + 10, infoY, "Order Information", boldFont, 9, darkGreen);
    infoY -= 12;

    // Left column
    drawText(page, margin + 10, infoY, "Payment Method:", font, 7, gray);
    drawText(page, margin + 85, infoY, order.paymentMethod, boldFont, 8, darkGreen);

    // Right column
    drawText(page, margin + contentWidth / 2, infoY, "Order Status:", font, 7, gray);
    drawText(page, margin + contentWidth / 2 + 75, infoY, order.status, boldFont, 8, darkGreen);

    infoY -= 12;
    drawText(page, margin + 10, infoY, "Payment Status:", font, 7, gray);
    drawText(page, margin + 85, infoY, order.paymentStatus, boldFont, 8, darkGreen);

    drawText(page, margin + contentWidth / 2, infoY, "Est. Delivery:", font, 7, gray);
    drawText(page, margin + contentWidth / 2 + 75, infoY, order.estimatedDelivery ?? "To be confirmed", boldFont, 8, darkGreen);

    sectionY -= orderInfoHeight + 6;

    // PRODUCT TABLE SECTION
    const tableHeaderHeight = 26;
    const rowHeight = 16;
    const maxItemsPerPage = 8;
    const needsPageBreak = order.items.length > maxItemsPerPage;

    // Calculate available space for table on first page
    const availableHeight = sectionY - margin - footerHeight - (needsPageBreak ? 0 : 120); // Reserve space for totals if single page

    let currentPage = page;
    let currentPageY = sectionY - 12;
    let itemsOnCurrentPage = 0;
    let rowIndex = 0;

    // Draw table header
    const drawTableHeader = (p: PDFPage, y: number): number => {
      drawRoundedCard(
        p,
        margin,
        y - tableHeaderHeight,
        contentWidth,
        tableHeaderHeight,
        darkGreen,
        darkGreen,
        0,
        0
      );
     const headerTextY = y - 10;

drawText(p, snoX, headerTextY, "S.No", boldFont, 8, [1,1,1]);
drawText(p, productX, headerTextY, "Product", boldFont, 8, [1,1,1]);
drawText(p, qtyX, headerTextY, "Qty", boldFont, 8, [1,1,1]);
drawText(p, unitPriceX, headerTextY, "Unit Price", boldFont, 8, [1,1,1]);
drawText(
    p,
    totalX + totalWidth - 10,
    headerTextY,
    "Total",
    boldFont,
    8,
    [1,1,1],
    undefined,
    undefined,
    "right"
);
      return y - tableHeaderHeight - 2;
    };

    currentPageY = drawTableHeader(currentPage, currentPageY);

    for (const item of order.items) {
      // Check if we need a new page
      if (currentPageY - rowHeight < margin + footerHeight + 120) {
        if (itemsOnCurrentPage > 0) {
          // Create new page
          currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
          drawWatermark(currentPage, logoImage, pageWidth, pageHeight);
          currentPageY = pageHeight - margin - 30;
          currentPageY = drawTableHeader(currentPage, currentPageY);
          itemsOnCurrentPage = 0;
        }
      }

      const fill: [number, number, number] = rowIndex % 2 === 0 ? [1, 1, 1] : lightGray;
      drawRoundedCard(currentPage, margin, currentPageY - rowHeight + 2, contentWidth, rowHeight - 2, fill, [1, 1, 1], 0, 0);

      drawText(currentPage, snoX + 2, currentPageY - 10, String(rowIndex + 1), font, 7, darkGreen);
      drawText(currentPage, productX + 2, currentPageY - 10, item.name, font, 7, darkGreen, productWidth - 4);
      drawText(currentPage, qtyX + 2, currentPageY - 10, String(item.quantity), font, 7, darkGreen);

      const unitPriceText = formatCurrency(item.price);
      const totalPrice = item.quantity * item.price;
      const totalPriceText = formatCurrency(totalPrice);

      drawText(currentPage, unitPriceX + unitPriceWidth - 4, currentPageY - 10, unitPriceText, font, 7, darkGreen, undefined, undefined, "right");
      drawText(currentPage, totalX + totalWidth - 4, currentPageY - 10, totalPriceText, font, 7, darkGreen, undefined, undefined, "right");

      currentPageY -= rowHeight;
      itemsOnCurrentPage++;
      rowIndex++;
    }

    // TOTALS SECTION
    const totalsBoxWidth = 250;
    const totalsBoxHeight = 100;
    const tableRightEdge = pageWidth - margin;
    const totalsBoxX = tableRightEdge - totalsBoxWidth;

    // If on a new page, place totals at the top; otherwise, place just below items
    if (itemsOnCurrentPage === 0 && currentPage !== page) {
      // Already on a new page for totals
      currentPageY = pageHeight - margin - 40;
    }

    currentPageY -= 12; // Gap before totals
    const totalsBoxTopY = currentPageY - 10;

    drawRoundedCard(currentPage, totalsBoxX, totalsBoxTopY - totalsBoxHeight, totalsBoxWidth, totalsBoxHeight, [1, 1, 1], borderColor, 1, 0);

    let totalsY = totalsBoxTopY - 14;
    const labelX = totalsBoxX + 14;
    const valueX = totalsBoxX + totalsBoxWidth - 14;

    drawText(currentPage, labelX, totalsY, "Subtotal", font, 7, gray);
    drawText(currentPage, valueX, totalsY, formatCurrency(order.totals.subtotal), font, 7, darkGreen, undefined, undefined, "right");

    totalsY -= 12;
    drawText(currentPage, labelX, totalsY, "Shipping", font, 7, gray);
    drawText(currentPage, valueX, totalsY, formatCurrency(order.totals.deliveryCharge), font, 7, darkGreen, undefined, undefined, "right");

    totalsY -= 12;
    drawText(currentPage, labelX, totalsY, "GST", font, 7, gray);
    drawText(currentPage, valueX, totalsY, formatCurrency(order.totals.gst), font, 7, darkGreen, undefined, undefined, "right");

    totalsY -= 12;
    drawText(currentPage, labelX, totalsY, "Discount", font, 7, gray);
    drawText(currentPage, valueX, totalsY, `- ${formatCurrency(order.totals.discount)}`, font, 7, darkGreen, undefined, undefined, "right");

    // Separator line
    totalsY -= 10;
    currentPage.drawLine({
      start: { x: totalsBoxX + 12, y: totalsY },
      end: { x: totalsBoxX + totalsBoxWidth - 12, y: totalsY },
      thickness: 0.5,
      color: rgb(borderColor[0], borderColor[1], borderColor[2]),
    });

    // Grand Total bar
    totalsY -= 10;
    drawRoundedCard(currentPage, totalsBoxX, totalsY - 22, totalsBoxWidth, 22, darkGreen, darkGreen, 0, 0);
   const grandY = totalsY - 9;

drawText(
    currentPage,
    labelX,
    grandY,
    "Grand Total",
    boldFont,
    9,
    [1,1,1]
);

drawText(
    currentPage,
    valueX,
    grandY,
    formatCurrency(order.totals.grandTotal),
    boldFont,
    9,
    [1,1,1],
    undefined,
    undefined,
    "right"
);

    currentPageY -= totalsBoxHeight + 12;

    // CUSTOMER SUPPORT SECTION
    const supportHeight = 55;
    if (currentPageY - supportHeight < margin + footerHeight + 10) {
      // Move to new page
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      drawWatermark(currentPage, logoImage, pageWidth, pageHeight);
      currentPageY = pageHeight - margin - 30;
    }

    drawRoundedCard(currentPage, margin, currentPageY - supportHeight, contentWidth, supportHeight, lightGreen, borderColor, 1, 0);

    let supportY = currentPageY - 10;
    drawText(currentPage, margin + 12, supportY, "Customer Support", boldFont, 9, darkGreen);
    supportY -= 12;
    drawText(currentPage, margin + 12, supportY, "Phone: +91 95853 04545", font, 7, gray);
    supportY -= 9;
    drawText(currentPage, margin + 12, supportY, "Email: aramnarpavi@gmail.com | Website: www.aramnarpavi.com", font, 7, gray);
    supportY -= 8;
    drawText(currentPage, margin + 12, supportY, "Working Hours: Monday – Saturday, 9 AM – 6 PM", font, 7, gray);

    // Add footer to all pages
    const pages: PDFPage[] = pdfDoc.getPages();
    pages.forEach((p: PDFPage, index: number) => drawFooter(p, index + 1, pages.length, pageWidth, margin, font, gray));

    const pdfBytes = await pdfDoc.save();
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Invoice-${order.orderId}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: unknown) {
    console.error("========== INVOICE ERROR ==========");
    if (error instanceof Error) {
      console.error(error.message);
      console.error(error.stack);
    } else {
      console.error(error);
    }
    console.error("==================================");

    return NextResponse.json({ error: "Unable to generate invoice" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { generateInvoicePdf } from "@/app/api/invoice/[orderId]/route";
import { customerOrderTemplate } from "@/lib/email/customerOrderTemplate";
import { sendCustomerOrderEmail } from "@/lib/email/emailService";
import { adminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

type OrderItem = { name?: unknown; quantity?: unknown; price?: unknown };

const asString = (value: unknown, fallback = ""): string => typeof value === "string" && value.trim() ? value.trim() : fallback;
const asNumber = (value: unknown): number => typeof value === "number" && Number.isFinite(value) ? value : 0;

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json() as { orderId?: unknown };
    if (typeof orderId !== "string" || !orderId.trim()) {
      return NextResponse.json({ sent: false, message: "orderId is required" }, { status: 400 });
    }

    const snapshot = await adminDb.collection("orders").doc(orderId).get();
    if (!snapshot.exists) {
      return NextResponse.json({ sent: false, message: "Order not found" }, { status: 404 });
    }

    const order = snapshot.data();
    if (!order) {
      return NextResponse.json({ sent: false, message: "Order not found" }, { status: 404 });
    }

    const customer = (order.customer ?? {}) as Record<string, unknown>;
    const totals = (order.totals ?? {}) as Record<string, unknown>;
    const customerEmail = asString(customer.email);
    if (!customerEmail) {
      return NextResponse.json({ sent: false, message: "Customer email is unavailable" }, { status: 422 });
    }

    const invoiceNumber = asString(order.invoiceNumber, `INV-${orderId}`);
    const items = Array.isArray(order.items) ? order.items.map((item: OrderItem) => ({
      name: asString(item.name, "Product"),
      quantity: asNumber(item.quantity),
      price: asNumber(item.price),
    })) : [];
    const invoicePdf = await generateInvoicePdf(orderId);

    const { error } = await sendCustomerOrderEmail({
      to: customerEmail,
      bcc: process.env.ADMIN_EMAIL,
      subject: `Order confirmed — ${asString(order.orderId, orderId)}`,
      html: customerOrderTemplate({
        customerName: asString(customer.name, "Customer"),
        orderId: asString(order.orderId, orderId),
        invoiceNumber,
        paymentMethod: asString(order.paymentMethod, "Cash On Delivery"),
        grandTotal: asNumber(totals.grandTotal),
        items,
      }),
      invoiceFilename: `Invoice-${invoiceNumber}.pdf`,
      invoicePdf,
    });

    if (error) {
      console.error("Customer order email failed", { orderId, error });
      return NextResponse.json({ sent: false, message: "Unable to send order email" }, { status: 502 });
    }

    return NextResponse.json({ sent: true });
  } catch (error) {
    console.error("Customer order email failed", error);
    return NextResponse.json({ sent: false, message: "Unable to send order email" }, { status: 500 });
  }
}

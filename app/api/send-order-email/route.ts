import { Resend } from "resend";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Payload = {
  id?: string;
  orderId: string;
  customer: { name: string; email: string };
  items: { name: string; quantity: number; price: number }[];
  address: { fullName: string; houseNo: string; street: string; area: string; city: string; state: string; pincode: string };
  paymentMethod: string;
  totals: { grandTotal: number };
  orderDate: string;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Payload;
    const recipient = process.env.ADMIN_ORDER_EMAIL;

    if (!payload?.orderId || !payload.customer?.email) {
      return NextResponse.json({ sent: false, message: "Invalid order payload" }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY || !recipient) {
      return NextResponse.json({ sent: false, reason: "Email is not configured" }, { status: 202 });
    }

    const items = payload.items.map((item) => `<li>${item.name} × ${item.quantity} — ₹${item.price * item.quantity}</li>`).join("");
    const invoiceLink = process.env.NEXT_PUBLIC_SITE_URL && payload.id
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/invoice/${payload.id}`
      : undefined;
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: process.env.ORDER_EMAIL_FROM || "Aram Narpavi Orders <orders@resend.dev>",
      to: recipient,
      subject: `New order ${payload.orderId}`,
      html: `<main style="font-family:Arial,sans-serif;color:#173522;max-width:640px">
        <h1 style="color:#1E5631">Aram Narpavi Herbals</h1>
        <h2>New order received</h2>
        <p><b>Customer:</b> ${payload.customer.name} (${payload.customer.email})</p>
        <p><b>Order ID:</b> ${payload.orderId}<br/><b>Order date:</b> ${payload.orderDate}<br/><b>Payment:</b> ${payload.paymentMethod}<br/><b>Total:</b> ₹${payload.totals.grandTotal}</p>
        <h3>Items</h3>
        <ul>${items}</ul>
        <h3>Delivery address</h3>
        <p>${payload.address.fullName}<br/>${payload.address.houseNo}, ${payload.address.street}, ${payload.address.area}<br/>${payload.address.city}, ${payload.address.state} – ${payload.address.pincode}</p>
        ${invoiceLink ? `<p><a href="${invoiceLink}" style="color:#1E5631">Download invoice</a></p>` : ""}
      </main>`,
    });

    return NextResponse.json({ sent: true }, { status: 200 });
  } catch (error) {
    console.error("Order email error", error);
    return NextResponse.json({ sent: false, message: "Unable to send order email" }, { status: 500 });
  }
}

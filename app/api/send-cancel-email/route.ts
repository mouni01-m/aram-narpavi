import { Resend } from "resend";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Payload = {
  orderId: string;
  customer: { name: string; email: string };
  items: { name: string; quantity: number }[];
  totals: { grandTotal: number };
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

    const items = payload.items.map((item) => `<li>${item.name} × ${item.quantity}</li>`).join("");
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: process.env.ORDER_EMAIL_FROM || "Aram Narpavi Orders <orders@resend.dev>",
      to: recipient,
      subject: `Order cancelled: ${payload.orderId}`,
      html: `<main style="font-family:Arial,sans-serif;color:#173522;max-width:640px">
        <h1 style="color:#1E5631">Aram Narpavi Herbals</h1>
        <h2 style="color:#d32f2f">Order Cancelled</h2>
        <p><b>Customer:</b> ${payload.customer.name} (${payload.customer.email})</p>
        <p><b>Order ID:</b> ${payload.orderId}<br/><b>Refund Amount:</b> ₹${payload.totals.grandTotal}</p>
        <h3>Items Cancelled</h3>
        <ul>${items}</ul>
        <p style="color:#d32f2f"><b>This order has been cancelled by the customer.</b></p>
      </main>`,
    });

    return NextResponse.json({ sent: true }, { status: 200 });
  } catch (error) {
    console.error("Cancel order email error", error);
    return NextResponse.json({ sent: false, message: "Unable to send cancel email" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Payload = {
  orderId: string;
  customer: { name: string; phone: string };
  items: { name: string; quantity: number }[];
  totals: { grandTotal: number };
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Payload;
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_WHATSAPP_FROM;
    const to = process.env.ADMIN_WHATSAPP_NUMBER;

    if (!payload?.orderId || !payload.customer?.phone) {
      return NextResponse.json({ sent: false, message: "Invalid payload" }, { status: 400 });
    }

    if (!sid || !token || !from || !to) {
      return NextResponse.json({ sent: false, reason: "WhatsApp is not configured" }, { status: 202 });
    }

    const message = `Order Cancelled\nOrder: ${payload.orderId}\nCustomer: ${payload.customer.name} (${payload.customer.phone})\nProducts: ${payload.items.map((item) => `${item.name} x${item.quantity}`).join(", ")}\nRefund: ₹${payload.totals.grandTotal}`;
    const body = new URLSearchParams({
      To: to.startsWith("whatsapp:") ? to : `whatsapp:${to}`,
      From: from.startsWith("whatsapp:") ? from : `whatsapp:${from}`,
      Body: message,
    });
    const auth = Buffer.from(`${sid}:${token}`).toString("base64");
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!response.ok) {
      throw new Error(`Twilio error: ${response.statusText}`);
    }

    return NextResponse.json({ sent: true }, { status: 200 });
  } catch (error) {
    console.error("Cancel WhatsApp error", error);
    return NextResponse.json({ sent: false, message: "Unable to send WhatsApp message" }, { status: 500 });
  }
}

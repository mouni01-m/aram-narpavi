import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Payload = {
  orderId: string;
  customer: { name: string; phone: string };
  items: { name: string; quantity: number }[];
  address: { city: string; state: string; pincode: string };
  totals: { grandTotal: number };
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Payload;
    const to = process.env.TWILIO_WHATSAPP_TO;
    const from = process.env.TWILIO_WHATSAPP_FROM;
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;

    if (!payload?.orderId || !payload.customer?.phone) {
      return NextResponse.json({ sent: false, message: "Invalid WhatsApp payload" }, { status: 400 });
    }

    if (!to || !from || !sid || !token) {
      return NextResponse.json({ sent: false, reason: "WhatsApp is not configured" }, { status: 202 });
    }

    const message = `New Order Received\nOrder: ${payload.orderId}\nCustomer: ${payload.customer.name} (${payload.customer.phone})\nProducts: ${payload.items.map((item) => `${item.name} x${item.quantity}`).join(", ")}\nTotal: ₹${payload.totals.grandTotal}\nAddress: ${payload.address.city}, ${payload.address.state} ${payload.address.pincode}`;
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
      return NextResponse.json({ sent: false, message: "Unable to send WhatsApp notification" }, { status: 502 });
    }

    return NextResponse.json({ sent: true }, { status: 200 });
  } catch (error) {
    console.error("WhatsApp notification error", error);
    return NextResponse.json({ sent: false, message: "Unable to send WhatsApp notification" }, { status: 500 });
  }
}

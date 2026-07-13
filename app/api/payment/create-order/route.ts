import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const amount = Number(body?.amount ?? 0);
    const currency = typeof body?.currency === "string" ? body.currency : "INR";
    const orderId = typeof body?.orderId === "string" ? body.orderId : `AN-${Date.now()}`;

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const secret = process.env.RAZORPAY_SECRET;

    if (!keyId || !secret) {
      return NextResponse.json({ error: "Payment provider is not configured" }, { status: 503 });
    }

    const payload = Buffer.from(`${keyId}:${secret}`).toString("base64");
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${payload}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency,
        receipt: orderId,
        notes: { orderId },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data?.error?.description || "Unable to create payment order" }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      order: {
        id: data.id,
        currency: data.currency,
        amount: data.amount,
        receipt: data.receipt,
      },
    });
  } catch (error) {
    console.error("Razorpay create-order error", error);
    return NextResponse.json({ error: "Unable to create payment order" }, { status: 500 });
  }
}

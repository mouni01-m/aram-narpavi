import { NextResponse } from "next/server";
import crypto from "node:crypto";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = body ?? {};

    const secret = process.env.RAZORPAY_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "Payment provider is not configured" }, { status: 503 });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return NextResponse.json({ error: "Incomplete payment verification payload" }, { status: 400 });
    }

    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    const isValid = crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(razorpay_signature));

    if (!isValid) {
      return NextResponse.json({ verified: false, error: "Invalid signature" }, { status: 400 });
    }

    return NextResponse.json({ verified: true, orderId, paymentId: razorpay_payment_id });
  } catch (error) {
    console.error("Razorpay verify error", error);
    return NextResponse.json({ verified: false, error: "Unable to verify payment" }, { status: 500 });
  }
}

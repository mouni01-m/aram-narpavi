import { NextResponse } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const { orderId } = await params;
    const orderRef = doc(db, "orders", orderId);
    const orderSnapshot = await getDoc(orderRef);

    if (!orderSnapshot.exists()) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const order = orderSnapshot.data();
    const html = `<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Invoice ${order.orderId ?? orderId}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #173522; margin: 0; padding: 24px; }
            .card { border: 1px solid #dce9db; border-radius: 16px; padding: 24px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { text-align: left; padding: 8px 0; border-bottom: 1px solid #e5e5e5; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1 style="color:#1E5631; margin-bottom: 4px;">Aram Narpavi Herbals</h1>
            <p>GST: 33AABCU9603R1Z7</p>
            <h2>Invoice</h2>
            <p><strong>Invoice Number:</strong> ${order.invoiceNumber ?? orderId}</p>
            <p><strong>Order Number:</strong> ${order.orderId ?? orderId}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString("en-IN")}</p>
            <p><strong>Customer:</strong> ${order.customer?.name ?? "Customer"}</p>
            <p><strong>Address:</strong> ${order.address ? `${order.address.houseNo}, ${order.address.street}, ${order.address.area}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}` : ""}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod ?? "Cash On Delivery"}</p>
            <table>
              <thead>
                <tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr>
              </thead>
              <tbody>
                ${(order.items ?? []).map((item: { name: string; quantity: number; price: number }) => `<tr><td>${item.name}</td><td>${item.quantity}</td><td>₹${item.price}</td><td>₹${item.price * item.quantity}</td></tr>`).join("")}
              </tbody>
            </table>
            <p style="margin-top: 16px;"><strong>Tax:</strong> ₹${order.totals?.gst ?? 0}</p>
            <p><strong>Total:</strong> ₹${order.totals?.grandTotal ?? 0}</p>
          </div>
        </body>
      </html>`;

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Invoice route error", error);
    return NextResponse.json({ error: "Unable to generate invoice" }, { status: 500 });
  }
}

type CustomerOrderEmailItem = {
  name: string;
  quantity: number;
  price: number;
};

type CustomerOrderEmail = {
  customerName: string;
  orderId: string;
  invoiceNumber: string;
  paymentMethod: string;
  grandTotal: number;
  items: CustomerOrderEmailItem[];
};

const escapeHtml = (value: string): string => value.replace(/[&<>'"]/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "'": "&#39;",
  '"': "&quot;",
}[character] ?? character));

const formatCurrency = (value: number): string => `₹${value.toFixed(0)}`;

export function customerOrderTemplate(order: CustomerOrderEmail): string {
  const customerName = escapeHtml(order.customerName || "Customer");
  const itemRows = order.items.map((item) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #dfe9df;color:#173522;">${escapeHtml(item.name)}</td>
      <td style="padding:12px 8px;border-bottom:1px solid #dfe9df;color:#607065;text-align:center;">${item.quantity}</td>
      <td style="padding:12px 0;border-bottom:1px solid #dfe9df;color:#173522;text-align:right;">${formatCurrency(item.quantity * item.price)}</td>
    </tr>`).join("");

  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:24px;background:#f8f7f2;font-family:Arial,Helvetica,sans-serif;color:#173522;">
    <main style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #dfe9df;border-radius:16px;overflow:hidden;">
      <header style="padding:28px 32px;background:#173d24;color:#ffffff;">
        <p style="margin:0 0 6px;font-size:12px;letter-spacing:1.2px;text-transform:uppercase;color:#dcefdc;">Aram Narpavi Herbals</p>
        <h1 style="margin:0;font-size:25px;line-height:1.25;">Thank you for your order</h1>
      </header>
      <section style="padding:30px 32px;">
        <p style="margin:0 0 14px;font-size:16px;line-height:1.6;">Dear ${customerName},</p>
        <p style="margin:0 0 22px;font-size:15px;line-height:1.6;color:#607065;">Your order has been received and is being prepared with care. Your invoice is attached to this email.</p>
        <div style="padding:16px 18px;background:#eef8ed;border-radius:10px;color:#173522;">
          <p style="margin:0 0 8px;font-size:14px;"><strong>Order:</strong> ${escapeHtml(order.orderId)}</p>
          <p style="margin:0 0 8px;font-size:14px;"><strong>Invoice:</strong> ${escapeHtml(order.invoiceNumber)}</p>
          <p style="margin:0;font-size:14px;"><strong>Payment method:</strong> ${escapeHtml(order.paymentMethod)}</p>
        </div>
        <h2 style="margin:28px 0 8px;font-size:18px;color:#173d24;">Order summary</h2>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;font-size:14px;">
          <thead><tr><th align="left" style="padding:10px 0;border-bottom:2px solid #173d24;">Product</th><th align="center" style="padding:10px 8px;border-bottom:2px solid #173d24;">Qty</th><th align="right" style="padding:10px 0;border-bottom:2px solid #173d24;">Total</th></tr></thead>
          <tbody>${itemRows}</tbody>
        </table>
        <p style="margin:20px 0 0;text-align:right;font-size:17px;color:#173d24;"><strong>Grand Total: ${formatCurrency(order.grandTotal)}</strong></p>
        <p style="margin:28px 0 0;font-size:14px;line-height:1.6;color:#607065;">Need help with your order? Contact us at <a href="mailto:aramnarpavi@gmail.com" style="color:#1e5631;">aramnarpavi@gmail.com</a>.</p>
      </section>
      <footer style="padding:18px 32px;background:#eef8ed;color:#607065;font-size:12px;line-height:1.5;">Nature's Purity, Tradition's Healing</footer>
    </main>
  </body>
</html>`;
}

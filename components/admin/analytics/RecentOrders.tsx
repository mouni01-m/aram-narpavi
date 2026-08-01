import { formatDate, money } from "@/lib/analytics";
import type { AnalyticsOrder } from "@/types/analytics";

const statusTone: Record<string, string> = {
  delivered: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-700",
  placed: "bg-blue-50 text-blue-700",
  accepted: "bg-violet-50 text-violet-700",
  packed: "bg-amber-50 text-amber-700",
  shipped: "bg-cyan-50 text-cyan-700",
  "out for delivery": "bg-orange-50 text-orange-700",
};

export default function RecentOrders({ orders }: { orders: AnalyticsOrder[] }) {
  if (!orders.length) {
    return <div className="grid min-h-44 place-items-center rounded-xl border border-dashed border-[#1e5631]/15 bg-[#f8fbf7] px-5 text-center text-sm font-semibold text-[#607065]">Recent orders will appear here automatically.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead>
          <tr className="border-b border-[#1e5631]/10 text-xs font-extrabold uppercase text-[#607065]">
            <th className="pb-3">Customer</th>
            <th className="pb-3">Order ID</th>
            <th className="pb-3">Amount</th>
            <th className="pb-3">Status</th>
            <th className="pb-3">Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const tone = statusTone[order.status.toLowerCase()] ?? "bg-slate-50 text-slate-700";
            return (
              <tr key={order.id} className="border-b border-[#1e5631]/7 last:border-0">
                <td className="py-4">
                  <p className="font-bold text-[#173d24]">{order.customerName}</p>
                  <p className="text-xs text-[#607065]">{order.customerEmail || "-"}</p>
                </td>
                <td className="py-4 font-bold text-[#173d24]">{order.orderId}</td>
                <td className="py-4 font-bold text-[#173d24]">{money(order.amount)}</td>
                <td className="py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${tone}`}>{order.status}</span></td>
                <td className="py-4 text-[#607065]">{formatDate(order.createdAt)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

import { money } from "@/lib/analytics";
import type { CustomerPerformance } from "@/types/analytics";

export default function TopCustomers({ customers }: { customers: CustomerPerformance[] }) {
  if (!customers.length) {
    return <div className="grid min-h-44 place-items-center rounded-xl border border-dashed border-[#1e5631]/15 bg-[#f8fbf7] px-5 text-center text-sm font-semibold text-[#607065]">Top customers will appear once orders are placed.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead>
          <tr className="border-b border-[#1e5631]/10 text-xs font-extrabold uppercase text-[#607065]">
            <th className="pb-3">Customer</th>
            <th className="pb-3">Orders</th>
            <th className="pb-3">Spent</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id} className="border-b border-[#1e5631]/7 last:border-0">
              <td className="py-4">
                <p className="font-bold text-[#173d24]">{customer.customer}</p>
                <p className="text-xs text-[#607065]">{customer.email || "-"}</p>
              </td>
              <td className="py-4 font-bold text-[#173d24]">{customer.orders.toLocaleString("en-IN")}</td>
              <td className="py-4 font-bold text-[#173d24]">{money(customer.spent)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

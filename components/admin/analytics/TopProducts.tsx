import { money } from "@/lib/analytics";
import type { ProductPerformance } from "@/types/analytics";

export default function TopProducts({ products }: { products: ProductPerformance[] }) {
  if (!products.length) {
    return <div className="grid min-h-44 place-items-center rounded-xl border border-dashed border-[#1e5631]/15 bg-[#f8fbf7] px-5 text-center text-sm font-semibold text-[#607065]">Top products will be ranked after products start selling.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[620px] text-left text-sm">
        <thead>
          <tr className="border-b border-[#1e5631]/10 text-xs font-extrabold uppercase text-[#607065]">
            <th className="pb-3">Product</th>
            <th className="pb-3">Sales</th>
            <th className="pb-3">Revenue</th>
            <th className="pb-3">Reviews</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b border-[#1e5631]/7 last:border-0">
              <td className="py-4">
                <p className="font-bold text-[#173d24]">{product.product}</p>
                <p className="text-xs text-[#607065]">{product.category}</p>
              </td>
              <td className="py-4 font-bold text-[#173d24]">{product.sales.toLocaleString("en-IN")}</td>
              <td className="py-4 font-bold text-[#173d24]">{money(product.revenue)}</td>
              <td className="py-4 text-[#607065]">{product.reviews.toLocaleString("en-IN")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

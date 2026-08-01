import { Star } from "lucide-react";

import { formatDate } from "@/lib/analytics";
import type { AnalyticsReview } from "@/types/analytics";

const statusTone: Record<string, string> = {
  approved: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  rejected: "bg-red-50 text-red-700",
  hidden: "bg-slate-50 text-slate-700",
  reported: "bg-orange-50 text-orange-700",
};

export default function RecentReviews({ reviews }: { reviews: AnalyticsReview[] }) {
  if (!reviews.length) {
    return <div className="grid min-h-44 place-items-center rounded-xl border border-dashed border-[#1e5631]/15 bg-[#f8fbf7] px-5 text-center text-sm font-semibold text-[#607065]">Recent reviews will appear here after customers share feedback.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] text-left text-sm">
        <thead>
          <tr className="border-b border-[#1e5631]/10 text-xs font-extrabold uppercase text-[#607065]">
            <th className="pb-3">Customer</th>
            <th className="pb-3">Product</th>
            <th className="pb-3">Stars</th>
            <th className="pb-3">Status</th>
            <th className="pb-3">Date</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review) => (
            <tr key={`${review.productId}-${review.id}`} className="border-b border-[#1e5631]/7 last:border-0">
              <td className="py-4">
                <p className="font-bold text-[#173d24]">{review.customerName}</p>
                <p className="text-xs text-[#607065]">{review.customerEmail || "-"}</p>
              </td>
              <td className="py-4 font-semibold text-[#173d24]">{review.productName}</td>
              <td className="py-4">
                <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-bold text-yellow-700">
                  <Star className="size-3 fill-current" aria-hidden="true" />
                  {review.rating.toFixed(1)}
                </span>
              </td>
              <td className="py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusTone[review.status]}`}>{review.status}</span></td>
              <td className="py-4 text-[#607065]">{formatDate(review.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Download, Package } from "lucide-react";

function OrderSuccessContent() {
  const query = useSearchParams();

  return (
    <main className="mx-auto flex min-h-[65vh] max-w-3xl items-center px-4 py-12">
      <section className="w-full overflow-hidden rounded-3xl border border-[#1E5631]/12 bg-white text-center shadow-xl">
        <div className="bg-[#EAF5E4] px-6 py-10">
          <CheckCircle2 className="mx-auto size-16 text-[#4F8A3F]" />
          <p className="eyebrow mt-4">Order confirmed</p>
          <h1 className="mt-2 text-4xl font-bold text-[#1E5631]">Order placed successfully!</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm text-[#607065]">Thank you for choosing Aram Narpavi Herbals. We’ll keep you updated as your order moves.</p>
        </div>
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-center gap-3 rounded-xl bg-[#F8F7F2] p-4">
            <Package className="size-5 text-[#1E5631]" />
            <span className="text-sm">Order reference: <strong>{query.get("order") || "Available in My Orders"}</strong></span>
          </div>
          <p className="mt-5 text-sm text-[#607065]">Estimated delivery in 3–5 business days.</p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/#products" className="rounded-full bg-[#1E5631] px-5 py-3 text-sm font-bold text-white">Continue shopping</Link>
            <Link href="/orders" className="inline-flex items-center justify-center gap-2 rounded-full border border-[#1E5631]/20 px-5 py-3 text-sm font-bold"><Download className="size-4" />Download invoice</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<main className="mx-auto flex min-h-[65vh] max-w-3xl items-center px-4 py-12"><div className="h-72 w-full animate-pulse rounded-3xl bg-[#1E5631]/5" /></main>}>
      <OrderSuccessContent />
    </Suspense>
  );
}

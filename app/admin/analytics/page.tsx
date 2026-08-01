"use client";

import dynamic from "next/dynamic";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { collection, collectionGroup, onSnapshot, type Unsubscribe } from "firebase/firestore";
import { Download, RefreshCw } from "lucide-react";

import DateRangePicker from "@/components/admin/analytics/DateRangePicker";
import LoadingSkeleton from "@/components/admin/analytics/LoadingSkeleton";
import RecentOrders from "@/components/admin/analytics/RecentOrders";
import RecentReviews from "@/components/admin/analytics/RecentReviews";
import SummaryCards from "@/components/admin/analytics/SummaryCards";
import TopCustomers from "@/components/admin/analytics/TopCustomers";
import TopProducts from "@/components/admin/analytics/TopProducts";
import {
  buildAnalyticsSummary,
  formatDate,
  money,
  normalizeCustomerSnapshot,
  normalizeOrderSnapshot,
  normalizeProductSnapshot,
  normalizeReviewSnapshot,
} from "@/lib/analytics";
import { db } from "@/lib/firebase";
import type { AnalyticsDateRange, AnalyticsSnapshot } from "@/types/analytics";

const RevenueChart = dynamic(() => import("@/components/admin/analytics/RevenueChart"), {
  loading: () => <ChartLoading />,
});
const OrdersChart = dynamic(() => import("@/components/admin/analytics/OrdersChart"), {
  loading: () => <ChartLoading />,
});
const RatingChart = dynamic(() => import("@/components/admin/analytics/RatingChart"), {
  loading: () => <ChartLoading />,
});
const ReviewChart = dynamic(() => import("@/components/admin/analytics/ReviewChart"), {
  loading: () => <ChartLoading />,
});
const ProductChart = dynamic(() => import("@/components/admin/analytics/ProductChart"), {
  loading: () => <ChartLoading />,
});

const emptySnapshot: AnalyticsSnapshot = {
  orders: [],
  products: [],
  customers: [],
  reviews: [],
};

function ChartLoading() {
  return <div className="h-80 animate-pulse rounded-xl bg-[#f5f7f3]" />;
}

function SectionCard({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-[#1e5631]/10 bg-white p-5 shadow-[0_10px_30px_rgba(23,53,34,0.05)] sm:p-6 ${className}`}>
      <div className="mb-5 flex flex-col gap-1">
        <h2 className="text-lg font-extrabold tracking-normal text-[#173d24]">{title}</h2>
        {subtitle ? <p className="text-sm font-medium leading-6 text-[#607065]">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

function csvCell(value: string | number): string {
  return `"${String(value).replaceAll('"', '""')}"`;
}

export default function AnalyticsPage() {
  const [snapshot, setSnapshot] = useState<AnalyticsSnapshot>(emptySnapshot);
  const [range, setRange] = useState<AnalyticsDateRange>("30d");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const partial: AnalyticsSnapshot = emptySnapshot;
    const loaded = {
      orders: false,
      products: false,
      customers: false,
      reviews: false,
    };

    const markLoaded = (key: keyof typeof loaded) => {
      loaded[key] = true;
      if (Object.values(loaded).every(Boolean)) setLoading(false);
    };

    const fail = (message: string, listenError: Error) => {
      console.error(message, listenError);
      setError("Unable to load live analytics from Firestore. Check permissions and try again.");
      setLoading(false);
      setRefreshing(false);
    };

    const subscriptions: Unsubscribe[] = [
      onSnapshot(
        collection(db, "orders"),
        (querySnapshot) => {
          partial.orders = querySnapshot.docs.map(normalizeOrderSnapshot);
          setSnapshot((current) => ({ ...current, orders: partial.orders }));
          markLoaded("orders");
          setRefreshing(false);
        },
        (listenError) => fail("Orders analytics listener failed", listenError)
      ),
      onSnapshot(
        collection(db, "products"),
        (querySnapshot) => {
          partial.products = querySnapshot.docs.map(normalizeProductSnapshot);
          setSnapshot((current) => ({ ...current, products: partial.products }));
          markLoaded("products");
          setRefreshing(false);
        },
        (listenError) => fail("Products analytics listener failed", listenError)
      ),
      onSnapshot(
        collection(db, "users"),
        (querySnapshot) => {
          partial.customers = querySnapshot.docs.map(normalizeCustomerSnapshot);
          setSnapshot((current) => ({ ...current, customers: partial.customers }));
          markLoaded("customers");
          setRefreshing(false);
        },
        (listenError) => fail("Users analytics listener failed", listenError)
      ),
      onSnapshot(
        collectionGroup(db, "reviews"),
        (querySnapshot) => {
          partial.reviews = querySnapshot.docs.flatMap((document) => {
            const review = normalizeReviewSnapshot(document);
            return review ? [review] : [];
          });
          setSnapshot((current) => ({ ...current, reviews: partial.reviews }));
          markLoaded("reviews");
          setRefreshing(false);
        },
        (listenError) => fail("Reviews analytics listener failed", listenError)
      ),
    ];

    return () => {
      subscriptions.forEach((unsubscribe) => unsubscribe());
    };
  }, [reloadKey]);

  const summary = useMemo(() => buildAnalyticsSummary(snapshot, range), [snapshot, range]);

  const currentDate = useMemo(() => {
    return new Intl.DateTimeFormat("en-IN", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date());
  }, []);

  const handleRefresh = useCallback(() => {
    setError("");
    setRefreshing(true);
    setReloadKey((key) => key + 1);
  }, []);

  const handleExport = useCallback(() => {
    const rows = [
      ["Metric", "Value", "Detail"].map(csvCell).join(","),
      ...summary.metrics.map((metric) => [metric.label, metric.value, metric.detail].map(csvCell).join(",")),
      "",
      ["Order ID", "Customer", "Email", "Amount", "Status", "Date"].map(csvCell).join(","),
      ...summary.recentOrders.map((order) => [order.orderId, order.customerName, order.customerEmail, money(order.amount), order.status, formatDate(order.createdAt)].map(csvCell).join(",")),
      "",
      ["Product", "Sales", "Revenue", "Reviews"].map(csvCell).join(","),
      ...summary.topProducts.map((product) => [product.product, product.sales, money(product.revenue), product.reviews].map(csvCell).join(",")),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `aram-narpavi-analytics-${range}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [range, summary]);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6 lg:space-y-8">
      <section className="rounded-2xl bg-[#173d24] p-5 text-white shadow-xl shadow-[#173d24]/15 sm:p-7">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-bold text-[#cfe6c7]">{currentDate}</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-normal sm:text-4xl">Analytics</h1>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-white/75">
              Live ecommerce performance across revenue, orders, customers, products, inventory, ratings, and review moderation.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <DateRangePicker value={range} onChange={setRange} />
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#eaf5e4] px-4 text-sm font-extrabold text-[#173d24] transition hover:bg-white"
            >
              <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} aria-hidden="true" />
              Refresh
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 text-sm font-extrabold text-white transition hover:bg-white/20"
            >
              <Download className="size-4" aria-hidden="true" />
              Export CSV
            </button>
          </div>
        </div>
      </section>

      {error ? (
        <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800 sm:flex-row sm:items-center sm:justify-between">
          <span>{error}</span>
          <button type="button" onClick={handleRefresh} className="rounded-xl bg-red-100 px-4 py-2 font-extrabold text-red-800 transition hover:bg-red-200">
            Retry
          </button>
        </div>
      ) : null}

      <SummaryCards metrics={summary.metrics} />

      <section className="grid gap-6 xl:grid-cols-[1.45fr_.9fr]">
        <SectionCard title="Revenue Trend" subtitle="Area chart based on non-cancelled Firestore orders.">
          <Suspense fallback={<ChartLoading />}>
            <RevenueChart data={summary.revenueTrend} />
          </Suspense>
        </SectionCard>
        <SectionCard title="Orders" subtitle="Daily order volume for the selected period.">
          <Suspense fallback={<ChartLoading />}>
            <OrdersChart data={summary.orderTrend} />
          </Suspense>
        </SectionCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <SectionCard title="Rating Distribution" subtitle="Customer star ratings.">
          <RatingChart data={summary.ratingDistribution} />
        </SectionCard>
        <SectionCard title="Reviews Status" subtitle="Moderation split for pending, approved, rejected, and hidden reviews.">
          <ReviewChart data={summary.reviewStatus} />
        </SectionCard>
        <SectionCard title="Top Products" subtitle="Horizontal revenue ranking by product.">
          <ProductChart variant="products" data={summary.topProducts} />
        </SectionCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
        <SectionCard title="Sales by Category" subtitle="Category revenue from ordered product lines.">
          <ProductChart variant="category" data={summary.salesByCategory} />
        </SectionCard>
        <SectionCard title="Recent Orders" subtitle="Latest order activity from Firestore.">
          <RecentOrders orders={summary.recentOrders} />
        </SectionCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Recent Reviews" subtitle="Newest customer product reviews.">
          <RecentReviews reviews={summary.recentReviews} />
        </SectionCard>
        <SectionCard title="Top Products" subtitle="Products ranked by sales, revenue, and reviews.">
          <TopProducts products={summary.topProducts} />
        </SectionCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Top Customers" subtitle="Highest-spending customers from order history.">
          <TopCustomers customers={summary.topCustomers} />
        </SectionCard>
        <SectionCard title="Performance Watchlist" subtitle="Worst-selling and top-rated products for merchandising decisions.">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <h3 className="mb-3 text-sm font-extrabold text-[#173d24]">Worst Selling Products</h3>
              <TopProducts products={summary.worstProducts} />
            </div>
            <div>
              <h3 className="mb-3 text-sm font-extrabold text-[#173d24]">Top Rated Products</h3>
              <TopProducts products={summary.topRatedProducts} />
            </div>
          </div>
        </SectionCard>
      </section>
    </div>
  );
}

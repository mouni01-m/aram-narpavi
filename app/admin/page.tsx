"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Box,
  CircleDollarSign,
  Download,
  Eye,
  MessageSquareText,
  Package,
  Plus,
  Settings,
  ShoppingBag,
  Star,
  Truck,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { money, type Order } from "@/lib/order";
import { getOrders } from "@/services/orderService";

type FirestoreTime = { seconds?: unknown; toDate?: () => Date } | Date | number | string | undefined;
type ProductRecord = { id: string; name?: string; image?: string; images?: string[]; stock?: number; createdAt?: FirestoreTime };
type UserRecord = { id: string; name?: string; email?: string; photoURL?: string; createdAt?: FirestoreTime };
type ReviewRecord = { id: string; name?: string; customerName?: string; productName?: string; product?: string; productId?: string; rating?: number; comment?: string; createdAt?: FirestoreTime };
type Activity = { id: string; type: "order" | "product" | "review" | "customer" | "status"; title: string; detail: string; at: Date };

const statusColors: Record<string, string> = {
  Placed: "bg-blue-50 text-blue-700 ring-blue-600/20",
  Accepted: "bg-violet-50 text-violet-700 ring-violet-600/20",
  Packed: "bg-amber-50 text-amber-700 ring-amber-600/20",
  Shipped: "bg-cyan-50 text-cyan-700 ring-cyan-600/20",
  "Out for Delivery": "bg-orange-50 text-orange-700 ring-orange-600/20",
  Delivered: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Cancelled: "bg-rose-50 text-rose-700 ring-rose-600/20",
};

const chartColors = ["#1e5631", "#4f8a3f", "#e69500", "#0f766e", "#7c3aed", "#e11d48"];

function toDate(value: FirestoreTime): Date {
  if (value instanceof Date) return value;
  if (typeof value === "number") return new Date(value);
  if (typeof value === "string") return new Date(value);
  if (value?.toDate) return value.toDate();
  if (typeof value?.seconds === "number") return new Date(value.seconds * 1000);
  return new Date(0);
}

function dateLabel(value: FirestoreTime): string {
  const date = toDate(value);
  return date.getTime() ? date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
}

function timeAgo(value: Date): string {
  const difference = Math.max(0, Date.now() - value.getTime());
  const hours = Math.floor(difference / 3_600_000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function EmptyState({ message }: { message: string }) {
  return <div className="grid min-h-40 place-items-center rounded-2xl border border-dashed border-[#1e5631]/20 bg-[#f8fbf7] px-5 text-center text-sm font-medium text-[#607065]">{message}</div>;
}

function SectionCard({ title, subtitle, children, className = "" }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return <section className={`rounded-3xl border border-[#1e5631]/10 bg-white p-5 shadow-[0_10px_30px_rgba(23,53,34,0.05)] sm:p-6 ${className}`}>
    <div className="mb-5"><h2 className="text-lg font-extrabold tracking-tight text-[#173d24]">{title}</h2>{subtitle && <p className="mt-1 text-sm text-[#607065]">{subtitle}</p>}</div>
    {children}
  </section>;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [customers, setCustomers] = useState<UserRecord[]>([]);
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const nextOrders = await getOrders();
console.log("✅ Orders loaded");

const productSnapshot = await getDocs(collection(db, "products"));
console.log("✅ Products loaded");

const userSnapshot = await getDocs(collection(db, "users"));
console.log("✅ Users loaded");

const reviewSnapshot = await getDocs(collection(db, "reviews"));
console.log("✅ Reviews loaded");

      setOrders(nextOrders);
      setProducts(productSnapshot.docs.map((document) => ({ id: document.id, ...(document.data() as Omit<ProductRecord, "id">) })));
      setCustomers(userSnapshot.docs.map((document) => ({ id: document.id, ...(document.data() as Omit<UserRecord, "id">) })));
      setReviews(reviewSnapshot.docs.map((document) => ({ id: document.id, ...(document.data() as Omit<ReviewRecord, "id">) })));
    } catch (loadError) {
      console.error("Unable to load admin dashboard", loadError);
      setError("We could not load the latest dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadDashboard(), 0);
    return () => window.clearTimeout(timeout);
  }, [loadDashboard]);

  const sortedOrders = useMemo(() => [...orders].sort((left, right) => toDate(right.createdAt).getTime() - toDate(left.createdAt).getTime()), [orders]);
  const sortedProducts = useMemo(() => [...products].sort((left, right) => toDate(right.createdAt).getTime() - toDate(left.createdAt).getTime()), [products]);
  const sortedCustomers = useMemo(() => [...customers].sort((left, right) => toDate(right.createdAt).getTime() - toDate(left.createdAt).getTime()), [customers]);
  const sortedReviews = useMemo(() => [...reviews].sort((left, right) => toDate(right.createdAt).getTime() - toDate(left.createdAt).getTime()), [reviews]);

  const revenue = useMemo(() => orders.filter((order) => order.status !== "Cancelled").reduce((total, order) => total + Number(order.totals?.grandTotal ?? 0), 0), [orders]);
  const sales = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekStart = todayStart - 6 * 86_400_000;
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const totalSince = (start: number) => orders.filter((order) => order.status !== "Cancelled" && toDate(order.createdAt).getTime() >= start).reduce((total, order) => total + Number(order.totals?.grandTotal ?? 0), 0);
    return [{ label: "Daily", revenue: totalSince(todayStart) }, { label: "Weekly", revenue: totalSince(weekStart) }, { label: "Monthly", revenue: totalSince(monthStart) }];
  }, [orders]);
  const lowStockProducts = useMemo(() => products.filter((product) => Number(product.stock ?? 0) <= 10).sort((left, right) => Number(left.stock ?? 0) - Number(right.stock ?? 0)), [products]);
  const statusChart = useMemo(() => ["Placed", "Packed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"].map((status) => ({ name: status, value: orders.filter((order) => order.status === status).length })), [orders]);
  const activities = useMemo<Activity[]>(() => [
    ...sortedOrders.slice(0, 5).map((order) => ({ id: `order-${order.id}`, type: order.status === "Delivered" || order.status === "Cancelled" ? "status" as const : "order" as const, title: order.status === "Delivered" || order.status === "Cancelled" ? "Order status updated" : "New order", detail: `${order.orderId} · ${order.customer?.name || "Customer"}`, at: toDate(order.createdAt) })),
    ...sortedProducts.slice(0, 3).map((product) => ({ id: `product-${product.id}`, type: "product" as const, title: "Product added", detail: product.name || "New product", at: toDate(product.createdAt) })),
    ...sortedReviews.slice(0, 3).map((review) => ({ id: `review-${review.id}`, type: "review" as const, title: "Review received", detail: review.name || review.customerName || "Customer review", at: toDate(review.createdAt) })),
    ...sortedCustomers.slice(0, 3).map((customer) => ({ id: `customer-${customer.id}`, type: "customer" as const, title: "Customer registered", detail: customer.name || customer.email || "New customer", at: toDate(customer.createdAt) })),
  ].filter((activity) => activity.at.getTime()).sort((left, right) => right.at.getTime() - left.at.getTime()).slice(0, 8), [sortedOrders, sortedProducts, sortedReviews, sortedCustomers]);

  const kpis: { title: string; value: string | number; subtitle: string; icon: LucideIcon; color: string }[] = [
    { title: "Total Orders", value: orders.length, subtitle: "All orders received", icon: ShoppingBag, color: "bg-emerald-50 text-emerald-700" },
    { title: "Pending Orders", value: orders.filter((order) => ["Placed", "Accepted", "Packed"].includes(order.status)).length, subtitle: "Need your attention", icon: Package, color: "bg-amber-50 text-amber-700" },
    { title: "Delivered Orders", value: orders.filter((order) => order.status === "Delivered").length, subtitle: "Successfully fulfilled", icon: Truck, color: "bg-sky-50 text-sky-700" },
    { title: "Cancelled Orders", value: orders.filter((order) => order.status === "Cancelled").length, subtitle: "Cancelled to date", icon: Box, color: "bg-rose-50 text-rose-700" },
    { title: "Revenue", value: money(revenue), subtitle: "Excluding cancelled orders", icon: CircleDollarSign, color: "bg-violet-50 text-violet-700" },
    { title: "Customers", value: customers.length, subtitle: "Registered customers", icon: Users, color: "bg-indigo-50 text-indigo-700" },
    { title: "Products", value: products.length, subtitle: "Active catalogue items", icon: Package, color: "bg-teal-50 text-teal-700" },
    { title: "Reviews", value: reviews.length, subtitle: "Customer feedback", icon: Star, color: "bg-orange-50 text-orange-700" },
  ];

  const exportOrders = () => {
    const heading = "Order ID,Customer,Email,Amount,Payment,Status,Date";
    const rows = sortedOrders.map((order) => [order.orderId, order.customer?.name || "", order.customer?.email || "", order.totals?.grandTotal || 0, order.paymentMethod || "", order.status || "", dateLabel(order.createdAt)].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","));
    const blob = new Blob([[heading, ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "aram-narpavi-orders.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="space-y-6 animate-pulse"><div className="h-24 rounded-3xl bg-[#1e5631]/8" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <div key={index} className="h-36 rounded-3xl bg-white shadow-sm" />)}</div><div className="grid gap-6 xl:grid-cols-2"><div className="h-96 rounded-3xl bg-white" /><div className="h-96 rounded-3xl bg-white" /></div></div>;

  return <div className="space-y-6 lg:space-y-8">
    <div className="flex flex-col justify-between gap-4 rounded-3xl bg-[#173d24] p-6 text-white shadow-xl shadow-[#173d24]/15 sm:flex-row sm:items-end sm:p-8">
      <div><p className="text-sm font-semibold text-[#cfe6c7]">Live business overview</p><h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">Welcome back, Admin</h1><p className="mt-2 max-w-xl text-sm leading-6 text-white/70">Monitor sales, orders, inventory, customers, and feedback in one place.</p></div>
      <button type="button" onClick={() => void loadDashboard()} className="rounded-xl bg-[#eaf5e4] px-4 py-2.5 text-sm font-bold text-[#173d24] transition hover:-translate-y-0.5 hover:bg-white">Refresh data</button>
    </div>

    {error && <div role="alert" className="flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><span>{error}</span><button type="button" onClick={() => void loadDashboard()} className="font-bold underline">Try again</button></div>}

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{kpis.map(({ title, value, subtitle, icon: Icon, color }) => <article key={title} className="group rounded-3xl border border-[#1e5631]/8 bg-white p-5 shadow-[0_10px_30px_rgba(23,53,34,0.05)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_35px_rgba(23,53,34,0.12)]"><div className="flex items-start justify-between gap-3"><span className={`grid size-11 place-items-center rounded-2xl ${color}`}><Icon className="size-5" /></span><span className="size-2 rounded-full bg-[#4f8a3f] opacity-0 transition group-hover:opacity-100" /></div><p className="mt-5 text-2xl font-extrabold tracking-tight text-[#173d24]">{value}</p><p className="mt-1 text-sm font-bold text-[#173d24]">{title}</p><p className="mt-1 text-xs text-[#607065]">{subtitle}</p></article>)}</section>

    <section className="grid gap-6 xl:grid-cols-[1.55fr_.95fr]">
      <SectionCard title="Revenue Overview" subtitle="Calculated from completed and active Firestore orders."><div className="grid gap-3 sm:grid-cols-4">{[...sales, { label: "Total", revenue }].map((sale) => <div key={sale.label} className="rounded-2xl bg-[#f5f7f3] p-4"><p className="text-xs font-bold uppercase tracking-wide text-[#607065]">{sale.label} Revenue</p><p className="mt-2 text-xl font-extrabold text-[#173d24]">{money(sale.revenue)}</p></div>)}</div><div className="mt-6 h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={sales} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}><XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#607065", fontSize: 12 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "#607065", fontSize: 12 }} tickFormatter={(value) => `₹${value}`} /><Tooltip formatter={(value) => money(Number(value))} cursor={{ fill: "#eaf5e4" }} contentStyle={{ borderRadius: 14, borderColor: "#dfe9df" }} /><Bar dataKey="revenue" fill="#1e5631" radius={[8, 8, 0, 0]} maxBarSize={54} /></BarChart></ResponsiveContainer></div></SectionCard>
      <SectionCard title="Order Status" subtitle="Current order distribution."><div className="h-72">{orders.length ? <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={statusChart} dataKey="value" nameKey="name" innerRadius={62} outerRadius={96} paddingAngle={3}>{statusChart.map((entry, index) => <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />)}</Pie><Tooltip formatter={(value, name) => [value, name]} contentStyle={{ borderRadius: 14, borderColor: "#dfe9df" }} /></PieChart></ResponsiveContainer> : <EmptyState message="Order status data will appear here as orders arrive." />}</div>{orders.length > 0 && <div className="flex flex-wrap gap-x-4 gap-y-2">{statusChart.map((item, index) => <span key={item.name} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#607065]"><span className="size-2 rounded-full" style={{ backgroundColor: chartColors[index % chartColors.length] }} />{item.name} ({item.value})</span>)}</div>}</SectionCard>
    </section>

    <SectionCard title="Recent Orders" subtitle="The 10 latest customer orders."><div className="overflow-x-auto"><table className="w-full min-w-[800px] text-left text-sm"><thead><tr className="border-b border-[#1e5631]/10 text-xs uppercase tracking-wide text-[#607065]"><th className="pb-3 font-bold">Order ID</th><th className="pb-3 font-bold">Customer</th><th className="pb-3 font-bold">Amount</th><th className="pb-3 font-bold">Payment</th><th className="pb-3 font-bold">Status</th><th className="pb-3 font-bold">Date</th><th className="pb-3 text-right font-bold">Actions</th></tr></thead><tbody>{sortedOrders.slice(0, 10).map((order) => <tr key={order.id} className="border-b border-[#1e5631]/7 last:border-0"><td className="py-4 font-bold text-[#173d24]">{order.orderId}</td><td className="py-4"><p className="font-semibold text-[#173d24]">{order.customer?.name || "Customer"}</p><p className="text-xs text-[#607065]">{order.customer?.email || "—"}</p></td><td className="py-4 font-bold text-[#173d24]">{money(Number(order.totals?.grandTotal ?? 0))}</td><td className="py-4 text-[#607065]">{order.paymentMethod || "—"}</td><td className="py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${statusColors[order.status] ?? "bg-slate-50 text-slate-700 ring-slate-600/20"}`}>{order.status}</span></td><td className="py-4 text-[#607065]">{dateLabel(order.createdAt)}</td><td className="py-4"><div className="flex justify-end gap-2"><Link href={`/admin/orders?order=${order.id}`} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-bold text-[#1e5631] transition hover:bg-[#eaf5e4]"><Eye className="size-4" />View</Link><a href={`/api/invoice/${order.id}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-bold text-[#1e5631] transition hover:bg-[#eaf5e4]"><Download className="size-4" />Invoice</a></div></td></tr>)}</tbody></table>{!sortedOrders.length && <EmptyState message="No orders have been received yet." />}</div></SectionCard>

    <section className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
      <SectionCard title="Low Stock Products" subtitle="Products with 10 units or fewer."><div className="overflow-x-auto"><table className="w-full min-w-[540px] text-left text-sm"><thead><tr className="border-b border-[#1e5631]/10 text-xs uppercase tracking-wide text-[#607065]"><th className="pb-3 font-bold">Image</th><th className="pb-3 font-bold">Product</th><th className="pb-3 font-bold">Stock</th><th className="pb-3 font-bold">Status</th></tr></thead><tbody>{lowStockProducts.map((product) => { const stock = Number(product.stock ?? 0); const image = product.image || product.images?.[0]; const status = stock === 0 ? "Out of Stock" : stock <= 10 ? "Low" : "Healthy"; return <tr key={product.id} className="border-b border-[#1e5631]/7 last:border-0"><td className="py-3"><span className="grid size-10 place-items-center overflow-hidden rounded-xl bg-[#eaf5e4] text-[#1e5631]">{image ? <img src={image} alt="" className="size-full object-cover" /> : <Package className="size-4" />}</span></td><td className="py-3 font-semibold text-[#173d24]">{product.name || "Untitled product"}</td><td className="py-3 font-bold text-[#173d24]">{stock}</td><td className="py-3"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${status === "Out of Stock" ? "bg-rose-50 text-rose-700" : status === "Low" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{status}</span></td></tr>; })}</tbody></table>{!lowStockProducts.length && <EmptyState message="All products are stocked above the low-stock threshold." />}</div></SectionCard>
      <SectionCard title="Recent Customers" subtitle="Latest registered users."><div className="space-y-4">{sortedCustomers.slice(0, 5).map((customer) => <div key={customer.id} className="flex items-center gap-3"><span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-[#eaf5e4] text-sm font-extrabold text-[#1e5631]">{customer.photoURL ? <img src={customer.photoURL} alt="" className="size-full object-cover" /> : (customer.name || customer.email || "C").slice(0, 1).toUpperCase()}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-[#173d24]">{customer.name || "Customer"}</span><span className="block truncate text-xs text-[#607065]">{customer.email || "No email"}</span></span><span className="shrink-0 text-xs text-[#607065]">{dateLabel(customer.createdAt)}</span></div>)}{!sortedCustomers.length && <EmptyState message="Customer registrations will appear here." />}</div></SectionCard>
    </section>

    <section className="grid gap-6 xl:grid-cols-[1.05fr_.95fr]">
      <SectionCard title="Latest Reviews" subtitle="Most recent customer feedback."><div className="space-y-4">{sortedReviews.slice(0, 5).map((review) => <article key={review.id} className="rounded-2xl bg-[#f8fbf7] p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-bold text-[#173d24]">{review.name || review.customerName || "Customer"}</p><p className="text-xs text-[#607065]">{review.productName || review.product || review.productId || "Product review"}</p></div><span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700"><Star className="size-3 fill-current" />{Number(review.rating ?? 0).toFixed(1)}</span></div><p className="mt-3 line-clamp-2 text-sm leading-6 text-[#607065]">{review.comment || "No comment provided."}</p></article>)}{!sortedReviews.length && <EmptyState message="Customer reviews will appear here." />}</div></SectionCard>
      <SectionCard title="Recent Activity" subtitle="Events generated from your live business data."><div className="space-y-4">{activities.map((activity) => { const Icon = activity.type === "order" ? ShoppingBag : activity.type === "product" ? Package : activity.type === "review" ? MessageSquareText : activity.type === "customer" ? UserPlus : Truck; return <div key={activity.id} className="flex gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#eaf5e4] text-[#1e5631]"><Icon className="size-4" /></span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><p className="text-sm font-bold text-[#173d24]">{activity.title}</p><span className="shrink-0 text-xs text-[#607065]">{timeAgo(activity.at)}</span></div><p className="truncate text-xs text-[#607065]">{activity.detail}</p></div></div>; })}{!activities.length && <EmptyState message="Activity will appear as your store begins receiving data." />}</div></SectionCard>
    </section>

    <SectionCard title="Quick Actions" subtitle="Common store-management tasks."><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"><Link href="/admin/products" className="inline-flex items-center gap-3 rounded-2xl border border-[#1e5631]/10 bg-[#f8fbf7] p-4 font-bold text-[#173d24] transition hover:-translate-y-0.5 hover:border-[#4f8a3f]/40 hover:bg-[#eaf5e4]"><span className="grid size-10 place-items-center rounded-xl bg-[#1e5631] text-white"><Plus className="size-5" /></span>Add Product</Link><Link href="/admin/orders" className="inline-flex items-center gap-3 rounded-2xl border border-[#1e5631]/10 bg-[#f8fbf7] p-4 font-bold text-[#173d24] transition hover:-translate-y-0.5 hover:border-[#4f8a3f]/40 hover:bg-[#eaf5e4]"><span className="grid size-10 place-items-center rounded-xl bg-[#1e5631] text-white"><ShoppingBag className="size-5" /></span>View Orders</Link><Link href="/admin/customers" className="inline-flex items-center gap-3 rounded-2xl border border-[#1e5631]/10 bg-[#f8fbf7] p-4 font-bold text-[#173d24] transition hover:-translate-y-0.5 hover:border-[#4f8a3f]/40 hover:bg-[#eaf5e4]"><span className="grid size-10 place-items-center rounded-xl bg-[#1e5631] text-white"><Users className="size-5" /></span>Manage Customers</Link><button type="button" onClick={exportOrders} className="inline-flex items-center gap-3 rounded-2xl border border-[#1e5631]/10 bg-[#f8fbf7] p-4 text-left font-bold text-[#173d24] transition hover:-translate-y-0.5 hover:border-[#4f8a3f]/40 hover:bg-[#eaf5e4]"><span className="grid size-10 place-items-center rounded-xl bg-[#1e5631] text-white"><Download className="size-5" /></span>Export Orders</button><Link href="/admin/analytics" className="inline-flex items-center gap-3 rounded-2xl border border-[#1e5631]/10 bg-[#f8fbf7] p-4 font-bold text-[#173d24] transition hover:-translate-y-0.5 hover:border-[#4f8a3f]/40 hover:bg-[#eaf5e4]"><span className="grid size-10 place-items-center rounded-xl bg-[#1e5631] text-white"><BarChart3 className="size-5" /></span>Analytics</Link><Link href="/admin/settings" className="inline-flex items-center gap-3 rounded-2xl border border-[#1e5631]/10 bg-[#f8fbf7] p-4 font-bold text-[#173d24] transition hover:-translate-y-0.5 hover:border-[#4f8a3f]/40 hover:bg-[#eaf5e4]"><span className="grid size-10 place-items-center rounded-xl bg-[#1e5631] text-white"><Settings className="size-5" /></span>Settings</Link></div></SectionCard>
  </div>;
}

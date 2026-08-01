"use client";

import {
  Boxes,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Package,
  ShoppingBag,
  Star,
  Truck,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

import type {
  AnalyticsCustomer,
  AnalyticsDateRange,
  AnalyticsMetric,
  AnalyticsOrder,
  AnalyticsOrderItem,
  AnalyticsProduct,
  AnalyticsReview,
  AnalyticsReviewStatus,
  AnalyticsSnapshot,
  AnalyticsSummary,
  CustomerPerformance,
  FirestoreDateValue,
  NamedValue,
  ProductPerformance,
  TrendPoint,
} from "@/types/analytics";

const DAY_MS = 86_400_000;
const CANCELLED_STATUS = "cancelled";
const PENDING_ORDER_STATUSES = new Set(["placed", "accepted", "packed", "shipped", "out for delivery"]);
const REVIEW_STATUSES: AnalyticsReviewStatus[] = ["pending", "approved", "rejected", "hidden"];

export function toDate(value: FirestoreDateValue | unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? null : new Date(parsed);
  }
  if (typeof value === "object" && value !== null) {
    if ("toDate" in value && typeof value.toDate === "function") return value.toDate();
    if ("toMillis" in value && typeof value.toMillis === "function") return new Date(value.toMillis());
    if ("seconds" in value && typeof value.seconds === "number") return new Date(value.seconds * 1000);
  }
  return null;
}

export function money(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

export function compactNumber(value: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1, notation: "compact" }).format(value || 0);
}

export function formatDate(value: Date | null, includeYear = true): string {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    ...(includeYear ? { year: "numeric" } : {}),
  }).format(value);
}

export function dateRangeStart(range: AnalyticsDateRange, now = new Date()): Date | null {
  if (range === "all") return null;
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - days + 1);
  return start;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function statusKey(status: string): string {
  return status.trim().toLowerCase();
}

function normalizeOrderItems(value: unknown): AnalyticsOrderItem[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    const row = isRecord(item) ? item : {};
    return {
      productId: asString(row.productId, asString(row.id, asString(row.slug))),
      slug: asString(row.slug, asString(row.productId, asString(row.id))),
      name: asString(row.name, "Product"),
      category: asString(row.category, "Uncategorized"),
      quantity: Math.max(0, asNumber(row.quantity, 1)),
      price: asNumber(row.price, asNumber(row.sellingPrice, asNumber(row.mrp))),
    };
  });
}

export function normalizeOrderSnapshot(document: QueryDocumentSnapshot<DocumentData>): AnalyticsOrder {
  const data = document.data();
  const customer = isRecord(data.customer) ? data.customer : {};
  const totals = isRecord(data.totals) ? data.totals : {};
  return {
    id: document.id,
    orderId: asString(data.orderId, document.id),
    customerId: asString(customer.uid, asString(data.uid)),
    customerName: asString(customer.name, "Customer"),
    customerEmail: asString(customer.email),
    amount: asNumber(totals.grandTotal, asNumber(data.amount, asNumber(data.total))),
    status: asString(data.status, "Placed"),
    paymentStatus: asString(data.paymentStatus, "Pending"),
    createdAt: toDate(data.createdAt),
    items: normalizeOrderItems(data.items),
  };
}

export function normalizeProductSnapshot(document: QueryDocumentSnapshot<DocumentData>): AnalyticsProduct {
  const data = document.data();
  const rating = isRecord(data.rating) ? data.rating : {};
  const price = asNumber(data.sellingPrice, asNumber(data.price));
  return {
    id: document.id,
    name: asString(data.name, document.id),
    slug: asString(data.slug, document.id),
    category: asString(data.category, "Uncategorized"),
    price,
    stock: asNumber(data.stock),
    lowStockLimit: asNumber(data.lowStockLimit, 5),
    ratingAverage: asNumber(rating.average),
    ratingCount: asNumber(rating.count),
    active: asBoolean(data.active, true),
    createdAt: toDate(data.createdAt),
  };
}

export function normalizeCustomerSnapshot(document: QueryDocumentSnapshot<DocumentData>): AnalyticsCustomer {
  const data = document.data();
  return {
    id: document.id,
    name: asString(data.name, asString(data.displayName, "Customer")),
    email: asString(data.email),
    role: asString(data.role, "customer"),
    createdAt: toDate(data.createdAt),
  };
}

export function normalizeReviewSnapshot(document: QueryDocumentSnapshot<DocumentData>): AnalyticsReview | null {
  const data = document.data();
  const parentProduct = document.ref.parent.parent;
  const productId = parentProduct?.id ?? asString(data.productId);
  if (!productId) return null;
  const status = asString(data.status, "pending").toLowerCase();
  return {
    id: document.id,
    productId,
    productName: asString(data.productName, productId),
    customerName: asString(data.customerName, asString(data.name, "Customer")),
    customerEmail: asString(data.customerEmail, asString(data.email)),
    rating: Math.min(5, Math.max(0, asNumber(data.rating))),
    status: status === "approved" || status === "rejected" || status === "hidden" || status === "reported" ? status : "pending",
    createdAt: toDate(data.createdAt),
  };
}

export function filterSnapshotByRange(snapshot: AnalyticsSnapshot, range: AnalyticsDateRange): AnalyticsSnapshot {
  const start = dateRangeStart(range);
  if (!start) return snapshot;
  const inRange = (date: Date | null) => Boolean(date && date.getTime() >= start.getTime());
  return {
    orders: snapshot.orders.filter((order) => inRange(order.createdAt)),
    products: snapshot.products,
    customers: snapshot.customers.filter((customer) => inRange(customer.createdAt)),
    reviews: snapshot.reviews.filter((review) => inRange(review.createdAt)),
  };
}

function revenueOrders(orders: AnalyticsOrder[]): AnalyticsOrder[] {
  return orders.filter((order) => statusKey(order.status) !== CANCELLED_STATUS);
}

function sameCalendarDay(left: Date | null, right: Date): boolean {
  return Boolean(left && left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate());
}

function sameMonth(left: Date | null, right: Date): boolean {
  return Boolean(left && left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth());
}

function buildDailyTrend(orders: AnalyticsOrder[], days: number): TrendPoint[] {
  const now = new Date();
  return Array.from({ length: days }, (_, index) => {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1 - index));
    const nextDay = new Date(day.getTime() + DAY_MS);
    const dayOrders = revenueOrders(orders).filter((order) => order.createdAt && order.createdAt >= day && order.createdAt < nextDay);
    return {
      label: new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(day),
      revenue: dayOrders.reduce((total, order) => total + order.amount, 0),
      orders: dayOrders.length,
    };
  });
}

function buildMonthlyTrend(orders: AnalyticsOrder[]): TrendPoint[] {
  const now = new Date();
  return Array.from({ length: 12 }, (_, index) => {
    const month = new Date(now.getFullYear(), now.getMonth() - (11 - index), 1);
    const monthOrders = revenueOrders(orders).filter((order) => order.createdAt && sameMonth(order.createdAt, month));
    return {
      label: new Intl.DateTimeFormat("en-IN", { month: "short" }).format(month),
      revenue: monthOrders.reduce((total, order) => total + order.amount, 0),
      orders: monthOrders.length,
    };
  });
}

function buildProductPerformance(snapshot: AnalyticsSnapshot): ProductPerformance[] {
  const productMap = new Map<string, ProductPerformance>();
  snapshot.products.forEach((product) => {
    productMap.set(product.id, {
      id: product.id,
      product: product.name,
      category: product.category,
      sales: 0,
      revenue: 0,
      reviews: snapshot.reviews.filter((review) => review.productId === product.id).length || product.ratingCount,
      rating: product.ratingAverage,
    });
  });

  revenueOrders(snapshot.orders).forEach((order) => {
    order.items.forEach((item) => {
      const key = item.productId || item.slug || item.name;
      const current = productMap.get(key) ?? {
        id: key,
        product: item.name,
        category: item.category,
        sales: 0,
        revenue: 0,
        reviews: snapshot.reviews.filter((review) => review.productId === key).length,
        rating: 0,
      };
      current.sales += item.quantity;
      current.revenue += item.quantity * item.price;
      productMap.set(key, current);
    });
  });

  return Array.from(productMap.values());
}

function buildCustomerPerformance(orders: AnalyticsOrder[]): CustomerPerformance[] {
  const customers = new Map<string, CustomerPerformance>();
  revenueOrders(orders).forEach((order) => {
    const id = order.customerId || order.customerEmail || order.customerName || order.id;
    const current = customers.get(id) ?? {
      id,
      customer: order.customerName,
      email: order.customerEmail,
      orders: 0,
      spent: 0,
    };
    current.orders += 1;
    current.spent += order.amount;
    customers.set(id, current);
  });
  return Array.from(customers.values()).sort((first, second) => second.spent - first.spent);
}

function countByName(names: string[], resolver: (name: string) => number): NamedValue[] {
  return names.map((name) => ({ name, value: resolver(name) }));
}

function summaryMetrics(snapshot: AnalyticsSnapshot): AnalyticsMetric[] {
  const now = new Date();
  const validOrders = revenueOrders(snapshot.orders);
  const totalRevenue = validOrders.reduce((total, order) => total + order.amount, 0);
  const todayRevenue = validOrders.filter((order) => sameCalendarDay(order.createdAt, now)).reduce((total, order) => total + order.amount, 0);
  const monthRevenue = validOrders.filter((order) => sameMonth(order.createdAt, now)).reduce((total, order) => total + order.amount, 0);
  const pendingOrders = snapshot.orders.filter((order) => PENDING_ORDER_STATUSES.has(statusKey(order.status))).length;
  const deliveredOrders = snapshot.orders.filter((order) => statusKey(order.status) === "delivered").length;
  const cancelledOrders = snapshot.orders.filter((order) => statusKey(order.status) === CANCELLED_STATUS).length;
  const nonAdminCustomers = snapshot.customers.filter((customer) => customer.role !== "admin");
  const customerOrderCounts = new Map<string, number>();
  snapshot.orders.forEach((order) => {
    const id = order.customerId || order.customerEmail;
    if (id) customerOrderCounts.set(id, (customerOrderCounts.get(id) ?? 0) + 1);
  });
  const newCustomers = nonAdminCustomers.filter((customer) => sameMonth(customer.createdAt, now)).length;
  const returningCustomers = Array.from(customerOrderCounts.values()).filter((count) => count > 1).length;
  const inStock = snapshot.products.filter((product) => product.stock > product.lowStockLimit).length;
  const lowStock = snapshot.products.filter((product) => product.stock > 0 && product.stock <= product.lowStockLimit).length;
  const outOfStock = snapshot.products.filter((product) => product.stock <= 0).length;
  const averageRating = snapshot.reviews.length ? snapshot.reviews.reduce((total, review) => total + review.rating, 0) / snapshot.reviews.length : 0;

  return [
    { label: "Total Revenue", value: money(totalRevenue), detail: "All non-cancelled orders", icon: CircleDollarSign, tone: "bg-[#eaf5e4] text-[#1e5631]" },
    { label: "Today's Revenue", value: money(todayRevenue), detail: "Revenue booked today", icon: CircleDollarSign, tone: "bg-emerald-50 text-emerald-700" },
    { label: "This Month Revenue", value: money(monthRevenue), detail: "Current calendar month", icon: CircleDollarSign, tone: "bg-lime-50 text-lime-700" },
    { label: "Total Orders", value: snapshot.orders.length.toLocaleString("en-IN"), detail: "All order statuses", icon: ShoppingBag, tone: "bg-slate-50 text-slate-700" },
    { label: "Pending Orders", value: pendingOrders.toLocaleString("en-IN"), detail: "Awaiting fulfillment", icon: Clock3, tone: "bg-amber-50 text-amber-700" },
    { label: "Delivered Orders", value: deliveredOrders.toLocaleString("en-IN"), detail: "Completed deliveries", icon: Truck, tone: "bg-teal-50 text-teal-700" },
    { label: "Cancelled Orders", value: cancelledOrders.toLocaleString("en-IN"), detail: "Cancelled orders", icon: XCircle, tone: "bg-red-50 text-red-700" },
    { label: "Total Customers", value: nonAdminCustomers.length.toLocaleString("en-IN"), detail: "Registered shoppers", icon: Users, tone: "bg-green-50 text-green-700" },
    { label: "New Customers", value: newCustomers.toLocaleString("en-IN"), detail: "Joined this month", icon: UserPlus, tone: "bg-sky-50 text-sky-700" },
    { label: "Returning Customers", value: returningCustomers.toLocaleString("en-IN"), detail: "More than one order", icon: Users, tone: "bg-cyan-50 text-cyan-700" },
    { label: "Total Products", value: snapshot.products.length.toLocaleString("en-IN"), detail: "Catalogue products", icon: Boxes, tone: "bg-[#f5f7f3] text-[#1e5631]" },
    { label: "In Stock", value: inStock.toLocaleString("en-IN"), detail: "Above low-stock limit", icon: Package, tone: "bg-emerald-50 text-emerald-700" },
    { label: "Low Stock", value: lowStock.toLocaleString("en-IN"), detail: "At or below limit", icon: Clock3, tone: "bg-orange-50 text-orange-700" },
    { label: "Out of Stock", value: outOfStock.toLocaleString("en-IN"), detail: "Needs restocking", icon: XCircle, tone: "bg-rose-50 text-rose-700" },
    { label: "Total Reviews", value: snapshot.reviews.length.toLocaleString("en-IN"), detail: "Customer feedback", icon: Star, tone: "bg-yellow-50 text-yellow-700" },
    { label: "Pending Reviews", value: snapshot.reviews.filter((review) => review.status === "pending").length.toLocaleString("en-IN"), detail: "Awaiting moderation", icon: Clock3, tone: "bg-amber-50 text-amber-700" },
    { label: "Approved Reviews", value: snapshot.reviews.filter((review) => review.status === "approved").length.toLocaleString("en-IN"), detail: "Visible reviews", icon: CheckCircle2, tone: "bg-green-50 text-green-700" },
    { label: "Rejected Reviews", value: snapshot.reviews.filter((review) => review.status === "rejected").length.toLocaleString("en-IN"), detail: "Rejected feedback", icon: XCircle, tone: "bg-red-50 text-red-700" },
    { label: "Hidden Reviews", value: snapshot.reviews.filter((review) => review.status === "hidden").length.toLocaleString("en-IN"), detail: "Hidden from storefront", icon: XCircle, tone: "bg-stone-50 text-stone-700" },
    { label: "Average Rating", value: averageRating.toFixed(1), detail: "Across all reviews", icon: Star, tone: "bg-yellow-50 text-yellow-700" },
  ];
}

export function buildAnalyticsSummary(rawSnapshot: AnalyticsSnapshot, range: AnalyticsDateRange): AnalyticsSummary {
  const snapshot = filterSnapshotByRange(rawSnapshot, range);
  const products = buildProductPerformance(snapshot);
  const ratingDistribution = countByName(["5", "4", "3", "2", "1"], (name) => snapshot.reviews.filter((review) => Math.round(review.rating) === Number(name)).length);
  const reviewStatus = countByName(REVIEW_STATUSES, (name) => snapshot.reviews.filter((review) => review.status === name).length);
  const salesByCategoryMap = new Map<string, number>();
  revenueOrders(snapshot.orders).forEach((order) => {
    order.items.forEach((item) => {
      salesByCategoryMap.set(item.category, (salesByCategoryMap.get(item.category) ?? 0) + item.quantity * item.price);
    });
  });

  return {
    metrics: summaryMetrics(snapshot),
    revenueTrend: range === "all" ? buildMonthlyTrend(snapshot.orders) : buildDailyTrend(snapshot.orders, range === "7d" ? 7 : range === "30d" ? 30 : 90),
    orderTrend: buildDailyTrend(snapshot.orders, range === "7d" ? 7 : 14),
    ratingDistribution,
    reviewStatus,
    topProducts: [...products].sort((first, second) => second.revenue - first.revenue).slice(0, 8),
    worstProducts: [...products].filter((product) => product.sales > 0).sort((first, second) => first.revenue - second.revenue).slice(0, 5),
    topRatedProducts: [...products].filter((product) => product.rating > 0).sort((first, second) => second.rating - first.rating).slice(0, 5),
    salesByCategory: Array.from(salesByCategoryMap.entries()).map(([name, value]) => ({ name, value })).sort((first, second) => second.value - first.value).slice(0, 8),
    recentOrders: [...snapshot.orders].sort((first, second) => (second.createdAt?.getTime() ?? 0) - (first.createdAt?.getTime() ?? 0)).slice(0, 10),
    recentReviews: [...snapshot.reviews].sort((first, second) => (second.createdAt?.getTime() ?? 0) - (first.createdAt?.getTime() ?? 0)).slice(0, 8),
    topCustomers: buildCustomerPerformance(snapshot.orders).slice(0, 8),
    lastUpdated: new Date(),
  };
}

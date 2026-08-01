import type { LucideIcon } from "lucide-react";

export type AnalyticsDateRange = "7d" | "30d" | "90d" | "all";

export type FirestoreDateValue =
  | Date
  | number
  | string
  | { seconds?: number; nanoseconds?: number; toDate?: () => Date; toMillis?: () => number }
  | null
  | undefined;

export type AnalyticsOrderStatus =
  | "Placed"
  | "Accepted"
  | "Packed"
  | "Shipped"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled"
  | string;

export type AnalyticsReviewStatus = "pending" | "approved" | "rejected" | "hidden" | "reported";

export type AnalyticsOrderItem = {
  productId: string;
  slug: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
};

export type AnalyticsOrder = {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  status: AnalyticsOrderStatus;
  paymentStatus: string;
  createdAt: Date | null;
  items: AnalyticsOrderItem[];
};

export type AnalyticsProduct = {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  stock: number;
  lowStockLimit: number;
  ratingAverage: number;
  ratingCount: number;
  active: boolean;
  createdAt: Date | null;
};

export type AnalyticsCustomer = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date | null;
};

export type AnalyticsReview = {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  status: AnalyticsReviewStatus;
  createdAt: Date | null;
};

export type AnalyticsSnapshot = {
  orders: AnalyticsOrder[];
  products: AnalyticsProduct[];
  customers: AnalyticsCustomer[];
  reviews: AnalyticsReview[];
};

export type AnalyticsMetric = {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone: string;
};

export type TrendPoint = {
  label: string;
  revenue: number;
  orders: number;
};

export type NamedValue = {
  name: string;
  value: number;
};

export type ProductPerformance = {
  id: string;
  product: string;
  category: string;
  sales: number;
  revenue: number;
  reviews: number;
  rating: number;
};

export type CustomerPerformance = {
  id: string;
  customer: string;
  email: string;
  orders: number;
  spent: number;
};

export type AnalyticsSummary = {
  metrics: AnalyticsMetric[];
  revenueTrend: TrendPoint[];
  orderTrend: TrendPoint[];
  ratingDistribution: NamedValue[];
  reviewStatus: NamedValue[];
  topProducts: ProductPerformance[];
  worstProducts: ProductPerformance[];
  topRatedProducts: ProductPerformance[];
  salesByCategory: NamedValue[];
  recentOrders: AnalyticsOrder[];
  recentReviews: AnalyticsReview[];
  topCustomers: CustomerPerformance[];
  lastUpdated: Date;
};

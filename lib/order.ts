import type { CartItem } from "@/types/product";
import type { Address } from "@/lib/user";

export const ORDER_STATUSES = ["Placed", "Accepted", "Packed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type PaymentMethod = "Cash On Delivery" | "UPI" | "Google Pay" | "PhonePe" | "Paytm" | "Credit Card" | "Debit Card" | "Net Banking" | "Razorpay";
export type OrderTotals = { subtotal: number; deliveryCharge: number; gst: number; discount: number; coupon: string; grandTotal: number };
export type OrderCustomer = { uid: string; name: string; email: string; phone: string };
export type Order = { id: string; orderId: string; invoiceNumber: string; customer: OrderCustomer; address: Address; items: CartItem[]; totals: OrderTotals; paymentMethod: PaymentMethod; paymentStatus: "Pending" | "Paid"; status: OrderStatus; createdAt?: { seconds: number }; updatedAt?: { seconds: number }; estimatedDelivery: string };
export const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
export const addressText = (address: Address) => [address.houseNo, address.street, address.area, address.landmark, address.city, address.district, address.state, address.pincode, address.country].filter(Boolean).join(", ");

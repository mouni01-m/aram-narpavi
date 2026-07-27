"use client";

import { X, User, MapPin, CreditCard, Package } from "lucide-react";
import type { Order } from "@/lib/order";
import StatusBadge from "./StatusBadge";
import {
  CheckCircle2,
  Circle,
} from "lucide-react";

interface Props {
  order: Order | null;
  open: boolean;
  onClose: () => void;
}

export default function OrderDetailsModal({
  order,
  open,
  onClose,
}: Props) {
  if (!open || !order) return null;

  const openPackingSlip = (print = false) => {
    const packingSlipWindow = window.open(`/api/admin-packing-slip/${order.id}`, "_blank");
    if (print && packingSlipWindow) {
      packingSlipWindow.addEventListener("load", () => packingSlipWindow.print(), { once: true });
    }
  };

  const timeline = [
  "Placed",
  "Accepted",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

const currentIndex = timeline.indexOf(order.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5">

      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

        {/* Header */}

        <div className="flex items-center justify-between border-b p-6">

          <div>

            <h2 className="text-2xl font-bold text-[#1E5631]">
              Order Details
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {order.orderId}
            </p>

          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <X />
          </button>

        </div>

        <div className="space-y-8 p-6">

          {/* Order Info */}

          <div className="grid gap-6 md:grid-cols-2">

            <div className="rounded-xl border p-5">

              <h3 className="mb-4 flex items-center gap-2 font-bold text-[#1E5631]">
                <User size={18} />
                Customer
              </h3>

              <p>
                <strong>Name:</strong> {order.customer.name}
              </p>

              <p>
                <strong>Email:</strong> {order.customer.email}
              </p>

              <p>
                <strong>Phone:</strong> {order.customer.phone}
              </p>

            </div>

            <div className="rounded-xl border p-5">

              <h3 className="mb-4 flex items-center gap-2 font-bold text-[#1E5631]">
                <MapPin size={18} />
                Shipping Address
              </h3>

              <p>{order.customer.name}</p>

              <p>{order.address.phone}</p>

              <p>{order.address.houseNo}</p>

              {order.address.street && (
                <p>{order.address.street}</p>
              )}

              <p>
                {order.address.area}, {
order.address.city}, {
order.address.district}, {
order.address.state},  {
order.address.pincode},{" "}
                
              </p>

              <p>{order.address.pincode}</p>

            </div>

          </div>

          {/* Payment */}

          <div className="rounded-xl border p-5">

            <h3 className="mb-4 flex items-center gap-2 font-bold text-[#1E5631]">
              <CreditCard size={18} />
              Payment
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">

              <p>
                <strong>Method:</strong>{" "}
                {order.paymentMethod}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {order.paymentStatus}
              </p>

              <p>
                <strong>Invoice:</strong>{" "}
                {order.invoiceNumber}
              </p>

              <div>
                <strong>Status:</strong>{" "}
                <StatusBadge status={order.status} />
              </div>

            </div>

          </div>

          {/* Products */}
            {/* Ordered Products */}
<div className="rounded-2xl border border-[#1F5631]/20 p-6">
  <h3 className="mb-5 flex items-center gap-2 text-2xl font-bold text-[#1F5631]">
    <Package className="h-6 w-6" />
    Ordered Products
  </h3>

  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="border-b bg-[#F6FBF7]">
        <tr className="text-left text-sm font-semibold uppercase tracking-wide text-[#1F5631]">
          <th className="px-4 py-4">Product</th>
          <th className="px-4 py-4 text-center">Qty</th>
          <th className="px-4 py-4 text-right">Price</th>
          <th className="px-4 py-4 text-right">Total</th>
        </tr>
      </thead>

      <tbody>
        {order.items.map((item, index) => (
          <tr
            key={index}
            className="border-b last:border-none hover:bg-gray-50"
          >
            <td className="px-4 py-4">
              <div className="flex items-center gap-4">

                <img
                  src={
                    item.image ||
                    item.images?.[0] ||
                    "/placeholder-product.png"
                  }
                  alt={item.name}
                  className="h-16 w-16 rounded-lg border object-cover"
                />

                <div>
                  <p className="font-semibold text-[#1F5631]">
                    {item.name}
                  </p>

    
                </div>

              </div>
            </td>

            <td className="px-4 py-4 text-center font-semibold">
              {item.quantity}
            </td>

            <td className="px-4 py-4 text-right">
              ₹{item.price.toLocaleString()}
            </td>

            <td className="px-4 py-4 text-right font-bold text-[#1F5631]">
              ₹{(item.price * item.quantity).toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
         {/* Order Summary */}
{/* Order Summary */}
<div className="mt-6 rounded-2xl border border-[#1F5631]/20 bg-[#FAFCFA] p-6">

  <h3 className="mb-5 text-2xl font-bold text-[#1F5631]">
    Order Summary
  </h3>

  <div className="space-y-4">

    <div className="flex justify-between">
      <span className="text-gray-600">Subtotal</span>
      <span className="font-medium">
        ₹{order.totals.subtotal.toLocaleString()}
      </span>
    </div>

    <div className="flex justify-between">
      <span className="text-gray-600">Delivery Charge</span>
      <span className="font-medium">
        ₹{order.totals.deliveryCharge.toLocaleString()}
      </span>
    </div>

    <div className="flex justify-between">
      <span className="text-gray-600">GST</span>
      <span className="font-medium">
        ₹{order.totals.gst.toLocaleString()}
      </span>
    </div>

    <div className="flex justify-between">
      <span className="text-gray-600">Discount</span>
      <span className="font-medium text-red-600">
        -₹{order.totals.discount.toLocaleString()}
      </span>
    </div>

    {order.totals.coupon && (
      <div className="flex justify-between">
        <span className="text-gray-600">Coupon</span>
        <span className="rounded bg-green-100 px-2 py-1 text-sm text-green-700">
          {order.totals.coupon}
        </span>
      </div>
    )}

    <hr />

    <div className="flex justify-between text-xl font-bold text-[#1F5631]">
      <span>Grand Total</span>
      <span>
        ₹{order.totals.grandTotal.toLocaleString()}
      </span>
    </div>

  </div>
</div>

{/* Order Timeline */}
<div className="mt-6 rounded-2xl border border-[#1F5631]/20 p-6">

  <h3 className="mb-6 text-2xl font-bold text-[#1F5631]">
    Order Timeline
  </h3>

  <div className="space-y-4">

    {timeline.map((step, index) => {

      const completed =
        currentIndex >= index &&
        order.status !== "Cancelled";

      return (

        <div
          key={step}
          className="flex items-center gap-4"
        >

          {completed ? (

            <CheckCircle2
              className="text-green-600"
              size={24}
            />

          ) : (

            <Circle
              className="text-gray-400"
              size={24}
            />

          )}

          <div>

            <p
              className={`font-semibold ${
                completed
                  ? "text-[#1F5631]"
                  : "text-gray-500"
              }`}
            >
              {step}
            </p>

          </div>

        </div>

      );
    })}

    {order.status === "Cancelled" && (

      <div className="mt-4 rounded-lg bg-red-50 p-4">

        <p className="font-semibold text-red-700">
          ❌ This order has been cancelled.
        </p>

      </div>

    )}

  </div>

</div>

{/* Action Buttons */}
<div className="mt-8 flex flex-wrap justify-end gap-3 border-t pt-6">

  <button
    onClick={() => openPackingSlip()}
    className="rounded-lg border border-[#1F5631] px-5 py-3 font-semibold text-[#1F5631] transition hover:bg-[#1F5631] hover:text-white"
  >
    📄 Download Packing Slip
  </button>

  <button
    onClick={() => openPackingSlip(true)}
    className="rounded-lg border border-blue-600 px-5 py-3 font-semibold text-blue-600 transition hover:bg-blue-600 hover:text-white"
  >
    🖨 Print Packing Slip
  </button>

  <button
    onClick={async () => {
      try {
        await fetch("/api/send-order-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: order.id,
          }),
        });

        alert("Invoice email sent successfully.");
      } catch {
        alert("Failed to send email.");
      }
    }}
    className="rounded-lg border border-green-600 px-5 py-3 font-semibold text-green-600 transition hover:bg-green-600 hover:text-white"
  >
    ✉ Email Invoice
  </button>

  <button
    onClick={() => {
      const phone = order.customer.phone.replace(/\D/g, "");

      const message =
        `Hello ${order.customer.name},%0A` +
        `Your order ${order.orderId} is currently ${order.status}.`;

      window.open(
        `https://wa.me/91${phone}?text=${message}`,
        "_blank"
      );
    }}
    className="rounded-lg border border-green-700 px-5 py-3 font-semibold text-green-700 transition hover:bg-green-700 hover:text-white"
  >
    📱 WhatsApp
  </button>

</div>
          
            </div>


      </div>

    </div>
  );
}

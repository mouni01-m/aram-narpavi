"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Download, PackageSearch, XCircle } from "lucide-react";
import { cancelOrder, getOrders } from "@/services/orderService";
import { money, CANCELLABLE_STATUSES, type Order } from "@/lib/order";

export function OrderList({ uid }: { uid: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState<{ orderId: string; orderId_: string } | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [toast, setToast] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    console.log("UID:", uid);
    try {
      const fetched = await getOrders(uid);
      console.log("Orders fetched:", fetched);
      setOrders(fetched);
    } catch (error) {
      console.error("getOrders failed:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCancelOrder = async () => {
    if (!cancelModal) return;

    setCancelling(true);
    try {
      const order = orders.find((o) => o.id === cancelModal.orderId);
      if (!order) return;

      await cancelOrder(cancelModal.orderId);

      // Send notifications
      await Promise.allSettled([
        fetch("/api/send-cancel-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: order.orderId,
            customer: order.customer,
            items: order.items,
            totals: order.totals,
          }),
        }),
        fetch("/api/send-cancel-whatsapp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: order.orderId,
            customer: order.customer,
            items: order.items,
            totals: order.totals,
          }),
        }),
      ]);

      setCancelModal(null);
      setToast("Order cancelled successfully");
      window.setTimeout(() => setToast(""), 2200);
      void load();
    } catch (error) {
      console.error("Error cancelling order:", error);
      setToast("Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  if (loading)
    return <div className="h-48 animate-pulse rounded-2xl bg-[#1E5631]/5" />;

  if (!orders.length)
    return (
      <div className="rounded-2xl border border-dashed border-[#1E5631]/20 p-10 text-center">
        <PackageSearch className="mx-auto size-9 text-[#4F8A3F]" />
        <h2 className="mt-3 text-2xl font-bold text-[#1E5631]">No orders yet</h2>
        <Link
          className="mt-4 inline-block rounded-full bg-[#1E5631] px-5 py-2.5 text-sm font-bold text-white"
          href="/#products"
        >
          Start shopping
        </Link>
      </div>
    );

  return (
    <>
      {toast && (
        <div className="mb-4 rounded-lg bg-[#EAF5E4] px-4 py-3 text-sm font-semibold text-[#1E5631]">
          {toast}
        </div>
      )}

      <div className="space-y-4">
        {orders.map((order) => (
          <article
            key={order.id}
            className="rounded-2xl border border-[#1E5631]/12 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-[#607065]">
                  ORDER ID · {order.orderId}
                </p>
                <h2 className="mt-1 text-xl font-bold text-[#1E5631]">
                  {order.items.map((item) => item.name).join(", ")}
                </h2>
                <p className="mt-1 text-sm text-[#607065]">
                  {order.items.length} item{order.items.length !== 1 ? "s" : ""} ·{" "}
                  {order.estimatedDelivery
                    ? `Estimated delivery ${order.estimatedDelivery}`
                    : "Processing your delivery"}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                  order.status === "Cancelled"
                    ? "bg-gray-100 text-gray-600"
                    : "bg-[#EAF5E4] text-[#1E5631]"
                }`}
              >
                {order.status}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#1E5631]/10 pt-4">
              <strong>{money(order.totals.grandTotal)}</strong>
              <div className="flex gap-2">
                <a
                  href={`/api/invoice/${order.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#1E5631]/20 px-3 py-2 text-xs font-bold"
                >
                  <Download className="size-3.5" />
                  Invoice
                </a>
                {order.status === "Cancelled" ? (
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-2 text-xs font-bold text-gray-600">
                    Cancelled
                  </span>
                ) : CANCELLABLE_STATUSES.includes(order.status as any) ? (
                  <button
                    onClick={() =>
                      setCancelModal({ orderId: order.id, orderId_: order.orderId })
                    }
                    className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-50"
                  >
                    <XCircle className="size-3.5" />
                    Cancel Order
                  </button>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Cancel Modal */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-[#1E5631]">
              Cancel this order?
            </h2>
            <p className="mt-3 text-sm text-[#173522]/65">
              Are you sure you want to cancel this order? This action cannot be
              undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setCancelModal(null)}
                disabled={cancelling}
                className="flex-1 rounded-lg border border-[#1E5631]/20 px-4 py-2.5 text-sm font-semibold text-[#1E5631] transition hover:bg-[#F8F7F2] disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {cancelling ? "Cancelling..." : "Yes, Cancel Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


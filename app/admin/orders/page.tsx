"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import OrdersTable from "./OrdersTable";
import OrderToolbar from "./OrderToolbar";
import OrderDetailsModal from "./OrderDetailsModal";

import {
  getOrders,
  updateStatus,
  cancelOrder,
} from "@/services/orderService";

import type { Order, OrderStatus } from "@/lib/order";

export default function OrdersPage() {

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] =
    useState<Order | null>(null);

  const [openModal, setOpenModal] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("");

  /* -----------------------------
      LOAD ORDERS
  ------------------------------*/

  const loadOrders = useCallback(async () => {

    try {

      setLoading(true);

      const data = await getOrders();

      data.sort((a, b) => {

        const aTime =
          a.createdAt?.seconds ?? 0;

        const bTime =
          b.createdAt?.seconds ?? 0;

        return bTime - aTime;

      });

      setOrders(data);

    } catch (err) {

      console.error(err);

      toast.error("Unable to load orders.");

    } finally {

      setLoading(false);

    }

  }, []);

  useEffect(() => {

    const timeout = window.setTimeout(() => void loadOrders(), 0);

    return () => window.clearTimeout(timeout);

  }, [loadOrders]);

  /* -----------------------------
      SEARCH + FILTER
  ------------------------------*/

  const filteredOrders = useMemo(() => {

    return orders.filter((order) => {

      const keyword = search.toLowerCase();

      const matchesSearch =

        order.orderId.toLowerCase().includes(keyword)

        ||

        order.customer.name
          .toLowerCase()
          .includes(keyword)

        ||

        order.customer.email
          .toLowerCase()
          .includes(keyword)

        ||

        order.customer.phone
          .toLowerCase()
          .includes(keyword);

      const matchesStatus =

        !statusFilter ||

        order.status === statusFilter;

      return matchesSearch && matchesStatus;

    });

  }, [
    orders,
    search,
    statusFilter,
  ]);

  /* -----------------------------
      REFRESH
  ------------------------------*/

  async function handleRefresh() {

    await loadOrders();

    toast.success("Orders refreshed.");

  }

  /* -----------------------------
    VIEW ORDER
------------------------------*/

function handleView(order: Order) {
  setSelectedOrder(order);
  setOpenModal(true);
}

function handleCloseModal() {
  setOpenModal(false);
  setSelectedOrder(null);
}

/* -----------------------------
    UPDATE STATUS
------------------------------*/

async function handleStatusChange(
  order: Order,
  status: OrderStatus
) {
  if (order.status === status) return;

  try {
    await updateStatus(order.id, status);

    setOrders((prev) =>
      prev.map((o) =>
        o.id === order.id
          ? {
              ...o,
              status,
            }
          : o
      )
    );

    if (selectedOrder?.id === order.id) {
      setSelectedOrder({
        ...selectedOrder,
        status,
      });
    }

    toast.success(`Order marked as "${status}"`);

  } catch (error) {

    console.error(error);

    toast.error("Unable to update order.");

  }
}

/* -----------------------------
    CANCEL ORDER
------------------------------*/

async function handleCancel(order: Order) {

  const confirmed = window.confirm(
    `Cancel Order ${order.orderId}?`
  );

  if (!confirmed) return;

  try {

    await cancelOrder(order.id);

    setOrders((prev) =>
      prev.map((o) =>
        o.id === order.id
          ? {
              ...o,
              status: "Cancelled",
            }
          : o
      )
    );

    if (selectedOrder?.id === order.id) {

      setSelectedOrder({
        ...selectedOrder,
        status: "Cancelled",
      });

    }

    toast.success("Order cancelled.");

  } catch (error) {

    console.error(error);

    toast.error("Unable to cancel order.");

  }

}

/* -----------------------------
    EXPORT CSV
------------------------------*/

function handleExport() {

  if (filteredOrders.length === 0) {

    toast.error("No orders to export.");

    return;

  }

  const rows = [
    [
      "Order ID",
      "Customer",
      "Email",
      "Phone",
      "Amount",
      "Payment",
      "Status",
      "Date",
    ],
  ];

  filteredOrders.forEach((order) => {

    rows.push([
      order.orderId,
      order.customer.name,
      order.customer.email,
      order.customer.phone,
      order.totals.grandTotal.toString(),
      order.paymentMethod,
      order.status,
      order.estimatedDelivery,
    ]);

  });

  const csv = rows
    .map((row) => row.join(","))
    .join("\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;

  link.download = `Orders-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);

  toast.success("Orders exported.");

}
/* -----------------------------
    STATS
------------------------------*/

const totalRevenue = filteredOrders.reduce(
  (sum, order) =>
    order.status !== "Cancelled"
      ? sum + order.totals.grandTotal
      : sum,
  0
);

const placedOrders = filteredOrders.filter(
  (o) => o.status === "Placed"
).length;

const deliveredOrders = filteredOrders.filter(
  (o) => o.status === "Delivered"
).length;

const cancelledOrders = filteredOrders.filter(
  (o) => o.status === "Cancelled"
).length;

/* -----------------------------
    LOADING
------------------------------*/

if (loading) {
  return (
    <div className="flex h-[70vh] items-center justify-center">
      <div className="text-lg font-semibold text-[#1E5631]">
        Loading Orders...
      </div>
    </div>
  );
}

/* -----------------------------
    PAGE
------------------------------*/

return (
  <div className="space-y-8">

    {/* Header */}

    <div>
      <h1 className="text-3xl font-bold text-[#1E5631]">
        Orders Management
      </h1>

      <p className="mt-2 text-gray-500">
        Manage customer orders, invoices and delivery status.
      </p>
    </div>

    {/* Statistics */}

    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">
          Total Orders
        </p>

        <h2 className="mt-2 text-3xl font-bold">
          {filteredOrders.length}
        </h2>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">
          Placed
        </p>

        <h2 className="mt-2 text-3xl font-bold text-blue-600">
          {placedOrders}
        </h2>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">
          Delivered
        </p>

        <h2 className="mt-2 text-3xl font-bold text-green-600">
          {deliveredOrders}
        </h2>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">
          Revenue
        </p>

        <h2 className="mt-2 text-3xl font-bold text-[#1E5631]">
          ₹{totalRevenue}
        </h2>

        <p className="mt-2 text-sm text-red-500">
          Cancelled: {cancelledOrders}
        </p>
      </div>

    </div>

    {/* Toolbar */}

    <OrderToolbar
      search={search}
      setSearch={setSearch}
      status={statusFilter}
      setStatus={setStatusFilter}
      onRefresh={handleRefresh}
      onExport={handleExport}
    />

    {/* Orders Table */}

    <OrdersTable
      orders={filteredOrders}
      onView={handleView}
      onCancel={handleCancel}
      onStatusChange={handleStatusChange}
    />

    {/* Details Modal */}

    <OrderDetailsModal
      order={selectedOrder}
      open={openModal}
      onClose={handleCloseModal}
    />

  </div>
);

}

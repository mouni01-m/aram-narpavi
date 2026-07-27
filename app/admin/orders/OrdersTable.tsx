"use client";

import Link from "next/link";
import {
  Eye,
  Download,
  XCircle,
} from "lucide-react";

import type { Order } from "@/lib/order";
import StatusBadge from "./StatusBadge";

interface Props {
  orders: Order[];

  onView: (order: Order) => void;

  onCancel: (order: Order) => void;

  onStatusChange: (
    order: Order,
    status: Order["status"]
  ) => void;
}

const statuses = [
  "Placed",
  "Accepted",
  "Processing",
  "Packed",
  "Shipped",
  "Delivered",
  "Cancelled",
] as const;

export default function OrdersTable({
  orders,
  onView,
  onCancel,
  onStatusChange,
}: Props) {
  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-20 text-center text-gray-500">
        No Orders Found
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm">

      <div className="overflow-x-auto">

        <table className="min-w-full">

          <thead className="bg-[#1E5631] text-white">
            <tr>
              <th className="px-5 py-4 text-left">Order ID</th>
              <th className="px-5 py-4 text-left">Customer</th>
              <th className="px-5 py-4 text-left">Phone</th>
              <th className="px-5 py-4 text-center">Amount</th>
              <th className="px-5 py-4 text-center">Payment</th>
              <th className="px-5 py-4 text-center">Status</th>
              <th className="px-5 py-4 text-center">
                Update
              </th>
              <th className="px-5 py-4 text-center">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>

            {orders.map((order) => (

              <tr
                key={order.id}
                className="border-b transition hover:bg-green-50"
              >
                <td className="px-5 py-4 font-semibold">
                  {order.orderId}
                </td>

                <td className="px-5 py-4">
                  <div>
                    <p className="font-semibold">
                      {order.customer.name}
                    </p>

                    <p className="text-sm text-gray-500">
                      {order.customer.email}
                    </p>
                  </div>
                </td>

                <td className="px-5 py-4">
                  {order.customer.phone}
                </td>

                <td className="px-5 py-4 text-center font-semibold">
                  ₹{order.totals.grandTotal}
                </td>

                <td className="px-5 py-4 text-center">
                  {order.paymentMethod}
                </td>

                <td className="px-5 py-4 text-center">
                  <StatusBadge
                    status={order.status}
                  />
                </td>

                <td className="px-5 py-4">

                  <select
                    value={order.status}
                    onChange={(e) =>
                      onStatusChange(
                        order,
                        e.target.value as Order["status"]
                      )
                    }
                    className="rounded-lg border px-2 py-2 text-sm"
                  >
                    {statuses.map((status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status}
                      </option>
                    ))}
                  </select>

                </td>

                <td className="px-5 py-4">

                  <div className="flex justify-center gap-2">

                    <button
                      onClick={() => onView(order)}
                      className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100"
                    >
                      <Eye size={18} />
                    </button>

                  <Link
  href={`/api/admin-packing-slip/${order.id}`}
  target="_blank"
  className="rounded-lg bg-green-50 p-2 text-green-600 hover:bg-green-100"
  title="Download Packing Slip"
>
  <Download size={18} />
</Link>

                    
                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}
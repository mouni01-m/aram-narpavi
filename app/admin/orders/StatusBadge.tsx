"use client";

interface Props {
  status: string;
}

const styles: Record<string, string> = {
  Placed: "bg-blue-100 text-blue-700",

  Accepted: "bg-indigo-100 text-indigo-700",

  Processing: "bg-yellow-100 text-yellow-700",

  Packed: "bg-orange-100 text-orange-700",

  Shipped: "bg-cyan-100 text-cyan-700",

  Delivered: "bg-green-100 text-green-700",

  Cancelled: "bg-red-100 text-red-700",
};

export default function StatusBadge({ status }: Props) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] ??
        "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}
"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { TrendPoint } from "@/types/analytics";

export default function OrdersChart({ data }: { data: TrendPoint[] }) {
  const hasData = data.some((point) => point.orders > 0);

  if (!hasData) {
    return <div className="grid h-80 place-items-center rounded-xl border border-dashed border-[#1e5631]/15 bg-[#f8fbf7] px-5 text-center text-sm font-semibold text-[#607065]">Order volume will appear as customers place orders.</div>;
  }

  return (
    <div className="h-80" role="img" aria-label="Orders bar chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 12, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="#e8efe6" vertical={false} />
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#607065", fontSize: 12 }} minTickGap={14} />
          <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{ fill: "#607065", fontSize: 12 }} />
          <Tooltip contentStyle={{ borderColor: "#dfe9df", borderRadius: 12 }} />
          <Bar dataKey="orders" fill="#4f8a3f" radius={[8, 8, 0, 0]} maxBarSize={42} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

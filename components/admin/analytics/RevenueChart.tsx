"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { compactNumber, money } from "@/lib/analytics";
import type { TrendPoint } from "@/types/analytics";

function EmptyChart({ message }: { message: string }) {
  return <div className="grid h-full min-h-72 place-items-center rounded-xl border border-dashed border-[#1e5631]/15 bg-[#f8fbf7] px-5 text-center text-sm font-semibold text-[#607065]">{message}</div>;
}

export default function RevenueChart({ data }: { data: TrendPoint[] }) {
  const hasData = data.some((point) => point.revenue > 0);

  if (!hasData) return <EmptyChart message="Revenue trend will appear as paid or active orders arrive." />;

  return (
    <div className="h-80" role="img" aria-label="Revenue trend area chart">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 12, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1e5631" stopOpacity={0.28} />
              <stop offset="95%" stopColor="#1e5631" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e8efe6" vertical={false} />
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#607065", fontSize: 12 }} minTickGap={18} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "#607065", fontSize: 12 }} tickFormatter={(value) => compactNumber(Number(value))} />
          <Tooltip formatter={(value) => money(Number(value))} contentStyle={{ borderColor: "#dfe9df", borderRadius: 12 }} />
          <Area type="monotone" dataKey="revenue" stroke="#1e5631" strokeWidth={3} fill="url(#revenueFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

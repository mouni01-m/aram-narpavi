"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { NamedValue } from "@/types/analytics";

const colors = ["#e69500", "#1e5631", "#dc2626", "#64748b"];

export default function ReviewChart({ data }: { data: NamedValue[] }) {
  const hasData = data.some((point) => point.value > 0);

  if (!hasData) {
    return <div className="grid h-72 place-items-center rounded-xl border border-dashed border-[#1e5631]/15 bg-[#f8fbf7] px-5 text-center text-sm font-semibold text-[#607065]">Review moderation status appears after customer feedback arrives.</div>;
  }

  return (
    <div className="h-72" role="img" aria-label="Review status donut chart">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} nameKey="name" dataKey="value" innerRadius={62} outerRadius={96} paddingAngle={3}>
            {data.map((point, index) => (
              <Cell key={point.name} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderColor: "#dfe9df", borderRadius: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { NamedValue } from "@/types/analytics";

const colors = ["#1e5631", "#4f8a3f", "#e69500", "#f97316", "#dc2626"];

export default function RatingChart({ data }: { data: NamedValue[] }) {
  const hasData = data.some((point) => point.value > 0);

  if (!hasData) {
    return <div className="grid h-72 place-items-center rounded-xl border border-dashed border-[#1e5631]/15 bg-[#f8fbf7] px-5 text-center text-sm font-semibold text-[#607065]">Rating distribution appears after reviews are submitted.</div>;
  }

  return (
    <div className="h-72" role="img" aria-label="Rating distribution pie chart">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} nameKey="name" dataKey="value" outerRadius={95} label={({ name }) => `${name} star`}>
            {data.map((point, index) => (
              <Cell key={point.name} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value, name) => [value, `${name} star`]} contentStyle={{ borderColor: "#dfe9df", borderRadius: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

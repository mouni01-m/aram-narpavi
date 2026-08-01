"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { compactNumber, money } from "@/lib/analytics";
import type { NamedValue, ProductPerformance } from "@/types/analytics";

type ProductChartProps =
  | { variant: "products"; data: ProductPerformance[] }
  | { variant: "category"; data: NamedValue[] };

export default function ProductChart(props: ProductChartProps) {
  const chartData = props.variant === "products"
    ? props.data.map((product) => ({ name: product.product, value: product.revenue }))
    : props.data;
  const hasData = chartData.some((point) => point.value > 0);

  if (!hasData) {
    return <div className="grid h-80 place-items-center rounded-xl border border-dashed border-[#1e5631]/15 bg-[#f8fbf7] px-5 text-center text-sm font-semibold text-[#607065]">Product sales data will appear as orders include catalogue items.</div>;
  }

  return (
    <div className="h-80" role="img" aria-label={props.variant === "products" ? "Top products horizontal bar chart" : "Sales by category bar chart"}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout={props.variant === "products" ? "vertical" : "horizontal"} margin={{ top: 12, right: 18, left: props.variant === "products" ? 40 : -14, bottom: 0 }}>
          <CartesianGrid stroke="#e8efe6" horizontal={props.variant !== "products"} vertical={props.variant === "products"} />
          {props.variant === "products" ? (
            <>
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#607065", fontSize: 12 }} tickFormatter={(value) => compactNumber(Number(value))} />
              <YAxis type="category" dataKey="name" width={110} axisLine={false} tickLine={false} tick={{ fill: "#607065", fontSize: 12 }} />
            </>
          ) : (
            <>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#607065", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#607065", fontSize: 12 }} tickFormatter={(value) => compactNumber(Number(value))} />
            </>
          )}
          <Tooltip formatter={(value) => money(Number(value))} contentStyle={{ borderColor: "#dfe9df", borderRadius: 12 }} />
          <Bar dataKey="value" fill="#1e5631" radius={props.variant === "products" ? [0, 8, 8, 0] : [8, 8, 0, 0]} maxBarSize={44} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

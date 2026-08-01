"use client";

import { CalendarDays } from "lucide-react";

import type { AnalyticsDateRange } from "@/types/analytics";

const ranges: { label: string; value: AnalyticsDateRange }[] = [
  { label: "7D", value: "7d" },
  { label: "30D", value: "30d" },
  { label: "90D", value: "90d" },
  { label: "All", value: "all" },
];

export default function DateRangePicker({
  value,
  onChange,
}: {
  value: AnalyticsDateRange;
  onChange: (range: AnalyticsDateRange) => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-[#1e5631]/10 bg-white p-1 shadow-sm" aria-label="Date range">
      <span className="hidden size-9 place-items-center rounded-lg bg-[#eaf5e4] text-[#1e5631] sm:grid">
        <CalendarDays className="size-4" aria-hidden="true" />
      </span>
      {ranges.map((range) => (
        <button
          key={range.value}
          type="button"
          aria-pressed={value === range.value}
          onClick={() => onChange(range.value)}
          className={`h-9 rounded-lg px-3 text-xs font-extrabold transition ${
            value === range.value ? "bg-[#1e5631] text-white shadow-sm" : "text-[#607065] hover:bg-[#eaf5e4] hover:text-[#173d24]"
          }`}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}

"use client";

import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  change?: string;
  positive?: boolean;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  color = "#1E5631",
  change,
  positive = true,
}: StatCardProps) {
  return (
    <div className="rounded-2xl bg-white border border-green-100 shadow-sm p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <h2 className="mt-2 text-3xl font-bold text-[#1E5631]">
            {value}
          </h2>

          {change && (
            <div
              className={`mt-3 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                positive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {positive ? (
                <TrendingUp size={14} />
              ) : (
                <TrendingDown size={14} />
              )}

              {change}
            </div>
          )}
        </div>

        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl text-white"
          style={{
            backgroundColor: color,
          }}
        >
          <Icon size={30} />
        </div>
      </div>
    </div>
  );
}
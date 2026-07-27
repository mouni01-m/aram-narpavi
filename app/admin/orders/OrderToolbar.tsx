"use client";

import { Search, RefreshCw, Download } from "lucide-react";

interface Props {
  search: string;
  setSearch: (value: string) => void;

  status: string;
  setStatus: (value: string) => void;

  onRefresh: () => void;
  onExport: () => void;
}

export default function OrderToolbar({
  search,
  setSearch,
  status,
  setStatus,
  onRefresh,
  onExport,
}: Props) {
  return (
    <div className="mb-6 rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        {/* Search */}
        <div className="relative w-full lg:w-96">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Order ID, Customer..."
            className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 outline-none transition focus:border-[#1E5631]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#1E5631]"
          >
            <option value="">All Status</option>
            <option value="Placed">Placed</option>
            <option value="Accepted">Accepted</option>
            <option value="Processing">Processing</option>
            <option value="Packed">Packed</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 transition hover:bg-gray-50"
          >
            <RefreshCw size={18} />
            Refresh
          </button>

          {/* Export */}
          <button
            onClick={onExport}
            className="flex items-center gap-2 rounded-xl bg-[#1E5631] px-5 py-3 text-white transition hover:bg-[#174526]"
          >
            <Download size={18} />
            Export
          </button>

        </div>
      </div>
    </div>
  );
}
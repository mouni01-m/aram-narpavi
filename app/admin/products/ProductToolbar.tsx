"use client";

import { memo } from "react";
import { ArrowDownUp, Plus, RefreshCw, Search } from "lucide-react";
export type StockFilter = "" | "instock" | "low" | "out";
export type ProductSort = "newest" | "oldest" | "price-asc" | "price-desc" | "stock" | "name";

interface Props {
  search: string;
  setSearch: (value: string) => void;

  category: string;
  setCategory: (value: string) => void;
  categories: string[];

  stockFilter: StockFilter;
  setStockFilter: (value: string) => void;

  sort: ProductSort;
  setSort: (value: ProductSort) => void;

  onAdd: () => void;
  onRefresh: () => void;
  refreshing?: boolean;
  disabled?: boolean;
}

function ProductToolbar({
  search,
  setSearch,
  category,
  setCategory,
  categories,
  stockFilter,
  setStockFilter,
  sort,
  setSort,
  onAdd,
  onRefresh,
  refreshing = false,
  disabled = false,
}: Props) {
  return (
    <div className="mb-6 rounded-2xl border bg-white p-5 shadow-sm">

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        {/* Search */}

        <div className="relative w-full lg:w-96">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search products by name, category, slug, or SKU"
            className="w-full rounded-xl border py-3 pl-10 pr-4 outline-none transition focus:border-[#1E5631]"
          />
        </div>

        {/* Filters */}

        <div className="flex flex-wrap items-center gap-3">

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter products by category"
            className="rounded-xl border px-4 py-3 outline-none focus:border-[#1E5631]"
          >
            <option value="">All Categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            aria-label="Filter products by stock"
            className="rounded-xl border px-4 py-3 outline-none focus:border-[#1E5631]"
          >
            <option value="">All Stock</option>
            <option value="instock">In Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>

          <div className="relative">
            <ArrowDownUp size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as ProductSort)}
              aria-label="Sort products"
              className="rounded-xl border py-3 pl-9 pr-4 outline-none focus:border-[#1E5631]"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="price-asc">Price Low to High</option>
              <option value="price-desc">Price High to Low</option>
              <option value="stock">Stock</option>
              <option value="name">Name</option>
            </select>
          </div>

          <button
            onClick={onRefresh}
            disabled={disabled || refreshing}
            className="flex items-center gap-2 rounded-xl border px-4 py-3 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Refresh products"
          >
            <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing" : "Refresh"}
          </button>

          <button
            onClick={onAdd}
            className="flex items-center gap-2 rounded-xl bg-[#1E5631] px-5 py-3 text-white hover:bg-[#164427]"
            aria-label="Add product"
          >
            <Plus size={18} />
            Add Product
          </button>

        </div>

      </div>

    </div>
  );
}

export default memo(ProductToolbar);

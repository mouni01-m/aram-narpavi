"use client";
/* eslint-disable @next/next/no-img-element */

import { memo, useState, type ReactNode } from "react";
import { Copy, Eye, FilePenLine, PackageOpen, Power, Star, Trash2 } from "lucide-react";
import type { Product } from "@/lib/product";

type ProductTableProps = {
  products: Product[];
  page: number;
  totalPages: number;
  totalProducts: number;
  onPageChange: (page: number) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onView: (product: Product) => void;
  onDuplicate: (product: Product) => void;
  onToggleActive: (product: Product) => void;
  onToggleFeatured: (product: Product) => void;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value || 0);
}

function stockLabel(product: Product) {
  if (product.stock <= 0) return { label: "Out of Stock", className: "bg-red-50 text-red-700" };
  if (product.stock <= product.lowStockLimit) return { label: "Low Stock", className: "bg-orange-50 text-orange-700" };
  return { label: "Healthy Stock", className: "bg-[#EAF5E4] text-[#1E5631]" };
}

function ProductImage({ product }: { product: Product }) {
  const [failed, setFailed] = useState(false);
  const image = product.images?.[0];
  const imageUrl = image?.url || "/images/product-placeholder.png";

  if (failed) {
    return (
      <div className="grid size-14 place-items-center rounded-lg border border-[#1E5631]/10 bg-[#F8FBF6] text-[#4F8A3F]">
        <PackageOpen className="size-5" aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={image.alt || product.name}
      loading="lazy"
      onError={() => setFailed(true)}
      className="size-14 rounded-lg border border-[#1E5631]/10 object-cover"
    />
  );
}

function ProductTable({
  products,
  page,
  totalPages,
  totalProducts,
  onPageChange,
  onEdit,
  onDelete,
  onView,
  onDuplicate,
  onToggleActive,
  onToggleFeatured,
}: ProductTableProps) {
  if (totalProducts === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white py-20 text-center text-gray-500">
        No products found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[1120px]">
          <thead className="bg-[#1E5631] text-white">
            <tr>
              <th className="px-5 py-4 text-left text-sm font-bold">Image</th>
              <th className="px-5 py-4 text-left text-sm font-bold">Product Name</th>
              <th className="px-5 py-4 text-left text-sm font-bold">Category</th>
              <th className="px-5 py-4 text-center text-sm font-bold">Selling Price</th>
              <th className="px-5 py-4 text-center text-sm font-bold">MRP</th>
              <th className="px-5 py-4 text-center text-sm font-bold">Stock</th>
              <th className="px-5 py-4 text-center text-sm font-bold">Status</th>
              <th className="px-5 py-4 text-center text-sm font-bold">Featured</th>
              <th className="px-5 py-4 text-center text-sm font-bold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => {
              const stock = stockLabel(product);

              return (
                <tr key={product.id} className="border-b border-[#1E5631]/10 transition hover:bg-green-50">
                  <td className="px-5 py-4">
                    <ProductImage product={product} />
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-700">{product.name}</p>
                    <p className="mt-1 text-xs text-[#607065]">{product.sku || product.slug || "No SKU"}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-[#47584d]">{product.category || "Uncategorized"}</td>
                  <td className="px-5 py-4 text-center font-semibold text-[#173522]">{formatCurrency(product.price)}</td>
                  <td className="px-5 py-4 text-center text-sm text-[#607065]">{formatCurrency(product.mrp)}</td>
                  <td className="px-5 py-4 text-center">
                    <span className={`inline-flex min-w-28 justify-center rounded-full px-3 py-1 text-xs font-semibold ${stock.className}`}>
                      {stock.label}
                    </span>
                    <p className="mt-1 text-xs font-semibold text-[#607065]">{product.stock}</p>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${product.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {product.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${product.featured ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
                      {product.featured ? "Featured" : "Standard"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-center gap-2">
                      <ActionButton label="View product" onClick={() => onView(product)} className="bg-blue-50 text-blue-600 hover:bg-blue-100"><Eye size={17} /></ActionButton>
                      <ActionButton label="Edit product" onClick={() => onEdit(product)} className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100"><FilePenLine size={17} /></ActionButton>
                      <ActionButton label="Duplicate product" onClick={() => onDuplicate(product)} className="bg-[#EAF5E4] text-[#1E5631] hover:bg-[#D7ECD2]"><Copy size={17} /></ActionButton>
                      <ActionButton label={product.active ? "Disable product" : "Enable product"} onClick={() => onToggleActive(product)} className="bg-gray-100 text-gray-700 hover:bg-gray-200"><Power size={17} /></ActionButton>
                      <ActionButton label={product.featured ? "Remove featured product" : "Feature product"} onClick={() => onToggleFeatured(product)} className="bg-amber-50 text-amber-700 hover:bg-amber-100"><Star size={17} /></ActionButton>
                      <ActionButton label="Delete product" onClick={() => onDelete(product)} className="bg-red-50 text-red-600 hover:bg-red-100"><Trash2 size={17} /></ActionButton>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-[#1E5631]/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-[#607065]">
          Page {page} of {totalPages}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => onPageChange(page - 1)} disabled={page === 1} className="rounded-xl border px-4 py-2 text-sm font-bold text-[#173522] disabled:cursor-not-allowed disabled:opacity-45">Previous</button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
            <button
              key={pageNumber}
              onClick={() => onPageChange(pageNumber)}
              aria-current={page === pageNumber ? "page" : undefined}
              className={`grid size-10 place-items-center rounded-xl text-sm font-bold ${page === pageNumber ? "bg-[#1E5631] text-white" : "border text-[#173522] hover:bg-[#F3F7F1]"}`}
            >
              {pageNumber}
            </button>
          ))}
          <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages} className="rounded-xl border px-4 py-2 text-sm font-bold text-[#173522] disabled:cursor-not-allowed disabled:opacity-45">Next</button>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ label, onClick, className, children }: { label: string; onClick: () => void; className: string; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className={`grid size-9 place-items-center rounded-lg transition ${className}`}>
      {children}
    </button>
  );
}

export default memo(ProductTable);

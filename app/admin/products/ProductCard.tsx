"use client";

import Image from "next/image";
import { Eye, Edit, Trash2, Package } from "lucide-react";

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  image: string;
  active: boolean;
}

interface Props {
  product: Product;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export default function ProductCard({
  product,
  onView,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="rounded-2xl border bg-white shadow-sm hover:shadow-lg transition overflow-hidden">

      <div className="relative h-56 w-full bg-gray-100">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>

      <div className="p-5">

        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800">
              {product.name}
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              {product.category}
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              product.active
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {product.active ? "Active" : "Inactive"}
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between">

          <div>
            <p className="text-2xl font-bold text-[#1E5631]">
              ₹{product.price}
            </p>

            <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
              <Package size={16} />
              Stock : {product.stock}
            </div>
          </div>

        </div>

        <div className="mt-6 flex gap-3">

          <button
            onClick={() => onView(product)}
            className="flex-1 rounded-xl border border-blue-200 py-2 text-blue-600 hover:bg-blue-50"
          >
            <Eye className="mx-auto" size={18} />
          </button>

          <button
            onClick={() => onEdit(product)}
            className="flex-1 rounded-xl border border-yellow-200 py-2 text-yellow-600 hover:bg-yellow-50"
          >
            <Edit className="mx-auto" size={18} />
          </button>

          <button
            onClick={() => onDelete(product)}
            className="flex-1 rounded-xl border border-red-200 py-2 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="mx-auto" size={18} />
          </button>

        </div>

      </div>

    </div>
  );
}
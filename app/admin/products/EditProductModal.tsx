"use client";

import { ProductFormModal } from "./AddProductModal";
import type { Product } from "@/lib/product";

type EditProductModalProps = {
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
};

export default function EditProductModal({ product, onClose, onSaved }: EditProductModalProps) {
  return product ? <ProductFormModal key={product.id} product={product} onClose={onClose} onSaved={onSaved} /> : null;
}

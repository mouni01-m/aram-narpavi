import { Timestamp } from "firebase/firestore";

/* =========================================
   Product Image
========================================= */

export interface ProductImage {
  id?: string;
  url: string;
  alt?: string;
}

/* =========================================
   Product Review Summary
========================================= */

export interface ProductRating {
  average: number;
  count: number;
}

/* =========================================
   Product
========================================= */

export interface Product {
  id: string;

  /* Basic Information */
  name: string;
  slug: string;
  category: string;
  description: string;

  /* Images */
  images: ProductImage[];

  /* Pricing */
  price: number;
  mrp: number;
  discount: number;

  /* Inventory */
  stock: number;
  lowStockLimit: number;

  /* Product Details */
  weight: string;
  sku: string;
  usageInstructions: string[];
  storageInstructions: string[];

  /* Herbal Information */
  ingredients: string[];
  benefits: string[];
  usage: string;

  /* Status */
  active: boolean;
  featured: boolean;
  bestseller: boolean;

  /* Ratings */
  rating: ProductRating;

  /* SEO */
  metaTitle?: string;
  metaDescription?: string;
  seo: Record<string, string>;

  /* Dates */
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

/* =========================================
   Product Form (Used in Admin)
========================================= */

export interface ProductFormData {
  name: string;
  slug: string;
  category: string;
  description: string;

  images: ProductImage[];

  price: number;
  mrp: number;
  discount: number;

  stock: number;
  lowStockLimit: number;

  weight: string;
  sku: string;

  ingredients: string[];
  benefits: string[];
  usage: string;
  usageInstructions: string[];
  storageInstructions: string[];

  active: boolean;
  featured: boolean;
  bestseller: boolean;

  metaTitle?: string;
  metaDescription?: string;
  seo: Record<string, string>;
}

/* =========================================
   Product Category
========================================= */

export const PRODUCT_CATEGORIES = [
  "Health Mix",
  "Herbal Malt",
  "Honey",
  "Herbal Soap",
  "Herbal Oil",
  "Pain Relief",
  "Spices",
  "Herbal Powder",
  "Personal Care",
  "Others",
] as const;

export type ProductCategory =
  (typeof PRODUCT_CATEGORIES)[number];

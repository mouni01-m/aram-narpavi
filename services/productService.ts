"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  Timestamp,
  updateDoc,
  type DocumentData,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import type { Product } from "@/lib/product";

const PRODUCTS_COLLECTION = "products";
const PLACEHOLDER_IMAGE = "/images/product-placeholder.png";

type FirestoreProductData = {
  name?: unknown;
  slug?: unknown;
  category?: unknown;
  description?: unknown;
  images?: unknown;
  image?: unknown;
  sellingPrice?: unknown;
  price?: unknown;
  mrp?: unknown;
  discount?: unknown;
  stock?: unknown;
  lowStockLimit?: unknown;
  weight?: unknown;
  sku?: unknown;
  ingredients?: unknown;
  benefits?: unknown;
  usage?: unknown;
  usageInstructions?: unknown;
  storageInstructions?: unknown;
  active?: unknown;
  featured?: unknown;
  bestseller?: unknown;
  rating?: unknown;
  metaTitle?: unknown;
  metaDescription?: unknown;
  seo?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function asTimestamp(value: unknown) {
  return value instanceof Timestamp ? value : undefined;
}

function normalizeImages(data: FirestoreProductData) {
  if (Array.isArray(data.images)) {
    const images = data.images
      .map((image) => {
        if (typeof image === "string") return { url: image, alt: asString(data.name, "Product image") };
        if (isRecord(image)) {
          const url = asString(image.url);
          const id = asString(image.id);
          return url ? { ...(id ? { id } : {}), url, alt: asString(image.alt, asString(data.name, "Product image")) } : null;
        }
        return null;
      })
      .filter((image): image is { id?: string; url: string; alt: string } => Boolean(image));

    if (images.length > 0) return images;
  }

  const image = asString(data.image, PLACEHOLDER_IMAGE);
  return [{ url: image || PLACEHOLDER_IMAGE, alt: asString(data.name, "Product image") }];
}

function normalizeSeo(value: unknown) {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string")
  );
}

export function normalizeProductSnapshot(snapshot: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>): Product {
  const data = snapshot.data() as FirestoreProductData;
  const sellingPrice = asNumber(data.sellingPrice, asNumber(data.price, 0));
  const mrp = asNumber(data.mrp, asNumber(data.price, 0));
  const usageInstructions = asStringArray(data.usageInstructions);
  const usage = asString(data.usage, usageInstructions.join("\n"));
  const seo = normalizeSeo(data.seo);

  return {
    id: snapshot.id,
    name: asString(data.name, snapshot.id),
    slug: asString(data.slug, snapshot.id),
    category: asString(data.category, "Uncategorized"),
    description: asString(data.description),
    images: normalizeImages(data),
    price: sellingPrice,
    mrp,
    discount: asNumber(data.discount, mrp > 0 ? Math.max(0, Math.round(((mrp - sellingPrice) / mrp) * 100)) : 0),
    stock: asNumber(data.stock, 0),
    lowStockLimit: asNumber(data.lowStockLimit, 5),
    weight: String(asNumber(data.weight, 0) || asString(data.weight, "0")),
    sku: asString(data.sku, "N/A"),
    ingredients: asStringArray(data.ingredients),
    benefits: asStringArray(data.benefits),
    usage,
    usageInstructions,
    storageInstructions: asStringArray(data.storageInstructions),
    active: asBoolean(data.active, true),
    featured: asBoolean(data.featured, false),
    bestseller: asBoolean(data.bestseller, false),
    rating: isRecord(data.rating) ? { average: asNumber(data.rating.average, 0), count: asNumber(data.rating.count, 0) } : { average: 0, count: 0 },
    metaTitle: asString(data.metaTitle, asString(seo.title, "")),
    metaDescription: asString(data.metaDescription, asString(seo.description, "")),
    seo,
    createdAt: asTimestamp(data.createdAt),
    updatedAt: asTimestamp(data.updatedAt),
  };
}

/* ===========================
   Get All Products
=========================== */

export async function getProducts(): Promise<Product[]> {
  const snapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
  const products = snapshot.docs.map(normalizeProductSnapshot);

  if (process.env.NODE_ENV === "development") {
    console.log(`Fetched ${products.length} products`);
    console.log("Product IDs:", snapshot.docs.map((productDoc) => productDoc.id));
  }

  return products;
}

/* ===========================
   Get Single Product
=========================== */

export async function getProduct(
  id: string
): Promise<Product | null> {
  const snap = await getDoc(doc(db, PRODUCTS_COLLECTION, id));

  if (!snap.exists()) return null;

  return normalizeProductSnapshot(snap);
}

/* ===========================
   Add Product
=========================== */

export async function addProduct(
  product: Omit<Product, "id">
) {
  const payload = {
    ...product,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  return await addDoc(
    collection(db, PRODUCTS_COLLECTION),
    payload
  );
}

/* ===========================
   Update Product
=========================== */

export async function updateProduct(
  id: string,
  data: Partial<Product>
) {
  await updateDoc(
    doc(db, PRODUCTS_COLLECTION, id),
    {
      ...data,
      updatedAt: serverTimestamp(),
    }
  );
}

/* ===========================
   Delete Product
=========================== */

export async function deleteProduct(
  id: string
) {
  await deleteDoc(
    doc(db, PRODUCTS_COLLECTION, id)
  );
}

/* ===========================
   Toggle Active / Inactive
=========================== */

export async function toggleProductStatus(
  id: string,
  active: boolean
) {
  await updateDoc(
    doc(db, PRODUCTS_COLLECTION, id),
    {
      active,
      updatedAt: serverTimestamp(),
    }
  );
}

/* ===========================
   Update Stock
=========================== */

export async function updateProductStock(
  id: string,
  stock: number
) {
  await updateDoc(
    doc(db, PRODUCTS_COLLECTION, id),
    {
      stock,
      updatedAt: serverTimestamp(),
    }
  );
}

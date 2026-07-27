"use client";

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Product } from "@/types/product";

export async function addToWishlist(uid: string, product: Product) {
  await setDoc(
    doc(db, "users", uid, "wishlist", product.slug),
    {
      ...product,
      createdAt: Date.now(),
    }
  );
}

export async function removeFromWishlist(uid: string, slug: string) {
  await deleteDoc(
    doc(db, "users", uid, "wishlist", slug)
  );
}

export async function getWishlist(uid: string): Promise<Product[]> {
  const snapshot = await getDocs(
    collection(db, "users", uid, "wishlist")
  );

  return snapshot.docs.map((wishlistDoc) => ({
    ...(wishlistDoc.data() as Product),
    id: wishlistDoc.id,
  }));
}

export async function getValidWishlist(uid: string, validSlugs: string[]): Promise<Product[]> {
  const valid = new Set(validSlugs);
  const wishlist = await getWishlist(uid);
  return wishlist.filter((product) => valid.has(product.slug));
}

export async function removeDeletedWishlistItems(uid: string, validSlugs: string[]) {
  const valid = new Set(validSlugs);
  const snapshot = await getDocs(
    collection(db, "users", uid, "wishlist")
  );

  await Promise.all(snapshot.docs.map(async (wishlistDoc) => {
    const product = {
      ...(wishlistDoc.data() as Product),
      id: wishlistDoc.id,
    };

    if (!valid.has(product.slug)) {
      await deleteDoc(doc(db, "users", uid, "wishlist", wishlistDoc.id));
    }
  }));
}

export async function isWishlisted(
  uid: string,
  slug: string
): Promise<boolean> {
  const snapshot = await getDoc(
    doc(db, "users", uid, "wishlist", slug)
  );

  return snapshot.exists();
}

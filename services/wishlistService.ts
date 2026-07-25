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

export async function addToWishlist(uid: string, product: any) {
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

export async function getWishlist(uid: string) {
  const snapshot = await getDocs(
    collection(db, "users", uid, "wishlist")
  );

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
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
"use client";

import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { CartItem } from "@/types/product";

type CartDocument = {
  items?: unknown;
};

function isCartItem(value: unknown): value is CartItem {
  return typeof value === "object" && value !== null && "id" in value && "slug" in value && "quantity" in value;
}

export function listenToCart(uid: string, onItems: (items: CartItem[]) => void, onError: (error: Error) => void) {
  return onSnapshot(
    doc(db, "users", uid, "private", "cart"),
    (snapshot) => {
      const data = snapshot.data() as CartDocument | undefined;
      const items = Array.isArray(data?.items) ? data.items.filter(isCartItem) : [];
      onItems(items);
    },
    onError
  );
}

export async function saveCart(uid: string, items: CartItem[]) {
  await setDoc(doc(db, "users", uid, "private", "cart"), { items, updatedAt: serverTimestamp() }, { merge: true });
}

"use client";

import { collection, deleteDoc, doc, getDocs, serverTimestamp, updateDoc } from "firebase/firestore";

import { db } from "@/lib/firebase";
import type { CustomerProfile } from "@/lib/user";

export type AdminCustomerUpdate = Pick<CustomerProfile, "name" | "phone" | "photoURL"> & {
  status?: "active" | "blocked";
  adminNotes?: string;
  defaultAddressId?: string;
};

export type AdminCustomerProfile = CustomerProfile & {
  status?: "active" | "blocked";
  adminNotes?: string;
  defaultAddressId?: string;
  emailVerified?: boolean;
  updatedAt?: unknown;
};

export async function getAdminCustomers(): Promise<AdminCustomerProfile[]> {
  const snapshot = await getDocs(collection(db, "users"));

  return snapshot.docs.map((customerDoc) => ({
    ...(customerDoc.data() as AdminCustomerProfile),
    uid: customerDoc.id,
  }));
}

export async function updateAdminCustomer(uid: string, updates: Partial<AdminCustomerUpdate>) {
  await updateDoc(doc(db, "users", uid), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteAdminCustomer(uid: string) {
  await deleteDoc(doc(db, "users", uid));
}

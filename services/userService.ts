import { deleteDoc, doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { CustomerProfile } from "@/lib/user";
import {
  collection,
  getDocs,
} from "firebase/firestore";

import type { Address } from "@/lib/user";

export async function getUserAddresses(uid: string): Promise<Address[]> {
  const snapshot = await getDocs(
    collection(db, "users", uid, "addresses")
  );

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Address[];
}

export async function getUserProfile(uid: string) {
  const snapshot = await getDoc(doc(db, "users", uid));
  return snapshot.exists() ? (snapshot.data() as CustomerProfile) : null;
}

export async function createUserProfile(profile: CustomerProfile) {
  await setDoc(doc(db, "users", profile.uid), { ...profile, createdAt: serverTimestamp(), lastLogin: serverTimestamp() });
}

export async function updateUserProfile(uid: string, updates: Partial<CustomerProfile>) {
  await updateDoc(doc(db, "users", uid), { ...updates, lastLogin: serverTimestamp() });
}

export async function ensureUserProfile(profile: CustomerProfile) {
  await setDoc(doc(db, "users", profile.uid), { ...profile, lastLogin: serverTimestamp(), createdAt: serverTimestamp() }, { merge: true });
}

export async function deleteUserProfile(uid: string) {
  await deleteDoc(doc(db, "users", uid));
}

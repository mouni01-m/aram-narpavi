import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { CustomerProfile } from "@/lib/user";

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

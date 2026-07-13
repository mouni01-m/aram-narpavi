import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Address } from "@/lib/user";
const userRef = (uid: string) => doc(db, "users", uid);
export async function saveAddress(uid: string, address: Address, existing: Address[]) {
  const addresses = address.isDefault ? existing.map((item) => ({ ...item, isDefault: false, ...(item.id === address.id ? address : {}) })) : existing.some((item) => item.id === address.id) ? existing.map((item) => item.id === address.id ? address : item) : [...existing, address];
  await updateDoc(userRef(uid), { addresses }); return addresses;
}
export async function removeAddress(uid: string, id: string, addresses: Address[]) { await updateDoc(userRef(uid), { addresses: addresses.filter((address) => address.id !== id) }); }
export async function setDefaultAddress(uid: string, id: string, addresses: Address[]) { const next = addresses.map((address) => ({ ...address, isDefault: address.id === id })); await updateDoc(userRef(uid), { addresses: next }); return next; }

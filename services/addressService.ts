import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Address } from "@/lib/user";

type StoredAddress = {
  fullName: string;
  phone: string;
  house: string;
  street: string;
  area: string;
  landmark: string;
  city: string;
  district: string;
  state: string;
  country: string;
  pincode: string;
  addressType: Address["type"];
  isDefault: boolean;
};

const addressCollection = (uid: string) => {
  if (!uid) throw new Error("Please sign in to manage your addresses.");
  return collection(db, "users", uid, "addresses");
};

const addressDocument = (uid: string, addressId: string) => {
  if (!addressId) throw new Error("The selected address could not be found.");
  return doc(addressCollection(uid), addressId);
};

const toStoredAddress = (address: Address): StoredAddress => ({
  fullName: address.fullName.trim(),
  phone: address.phone.trim(),
  house: address.houseNo.trim(),
  street: address.street.trim(),
  area: address.area.trim(),
  landmark: address.landmark.trim(),
  city: address.city.trim(),
  district: address.district.trim(),
  state: address.state.trim(),
  country: address.country.trim(),
  pincode: address.pincode.trim(),
  addressType: address.type,
  isDefault: address.isDefault,
});

const fromStoredAddress = (id: string, data: Record<string, unknown>): Address => ({
  id,
  fullName: typeof data.fullName === "string" ? data.fullName : "",
  phone: typeof data.phone === "string" ? data.phone : "",
  // The fallbacks make previously saved legacy addresses readable during migration.
  houseNo: typeof data.house === "string" ? data.house : typeof data.houseNo === "string" ? data.houseNo : "",
  street: typeof data.street === "string" ? data.street : "",
  area: typeof data.area === "string" ? data.area : "",
  landmark: typeof data.landmark === "string" ? data.landmark : "",
  city: typeof data.city === "string" ? data.city : "",
  district: typeof data.district === "string" ? data.district : "",
  state: typeof data.state === "string" ? data.state : "",
  country: typeof data.country === "string" ? data.country : "",
  pincode: typeof data.pincode === "string" ? data.pincode : "",
  type: data.addressType === "Office" || data.addressType === "Other" ? data.addressType : data.type === "Office" || data.type === "Other" ? data.type : "Home",
  isDefault: data.isDefault === true,
});

export async function getAddresses(uid: string): Promise<Address[]> {
  const snapshot = await getDocs(addressCollection(uid));
  const addresses = snapshot.docs.map((item) => fromStoredAddress(item.id, item.data()));
  return addresses.sort((first, second) => Number(second.isDefault) - Number(first.isDefault));
}

export async function addAddress(uid: string, address: Address): Promise<Address> {
  const addresses = addressCollection(uid);
  const reference = doc(addresses);
  const storedAddress = toStoredAddress(address);
  const existing = await getDocs(addresses);
  const shouldBeDefault = storedAddress.isDefault || existing.empty;
  const batch = writeBatch(db);

  if (shouldBeDefault) {
    existing.docs.forEach((item) => batch.update(item.ref, { isDefault: false, updatedAt: serverTimestamp() }));
  }
  batch.set(reference, {
    ...storedAddress,
    isDefault: shouldBeDefault,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await batch.commit();

  return { ...address, id: reference.id, isDefault: shouldBeDefault };
}

export async function updateAddress(uid: string, address: Address): Promise<void> {
  const reference = addressDocument(uid, address.id);
  const storedAddress = toStoredAddress(address);

  if (storedAddress.isDefault) {
    await setDefaultAddress(uid, address.id, storedAddress);
    return;
  }

  await updateDoc(reference, { ...storedAddress, updatedAt: serverTimestamp() });
}

export async function deleteAddress(uid: string, addressId: string): Promise<void> {
  await deleteDoc(addressDocument(uid, addressId));
}

export async function setDefaultAddress(uid: string, addressId: string, addressUpdates?: StoredAddress): Promise<void> {
  const addresses = addressCollection(uid);
  const selected = addressDocument(uid, addressId);
  const existing = await getDocs(addresses);
  const target = existing.docs.find((item) => item.id === addressId);
  if (!target) throw new Error("The selected address could not be found.");
  const batch = writeBatch(db);

  existing.docs.forEach((item) => {
    if (item.id !== addressId && item.data().isDefault === true) {
      batch.update(item.ref, { isDefault: false, updatedAt: serverTimestamp() });
    }
  });
  batch.update(selected, {
    ...(addressUpdates ?? {}),
    isDefault: true,
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
}

export function getAddressErrorMessage(error: unknown): string {
  const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
  if (code.includes("permission-denied")) return "You do not have permission to manage addresses for this account.";
  if (code.includes("unavailable") || code.includes("network")) return "We could not reach Firestore. Check your internet connection and try again.";
  if (code.includes("failed-precondition")) return "Firestore is currently unavailable. Please try again shortly.";
  if (error instanceof Error && error.message) return error.message;
  return "We could not update your address. Please try again.";
}

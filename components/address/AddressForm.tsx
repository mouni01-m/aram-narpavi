"use client";

import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import type { Address } from "@/lib/user";

const empty = (): Address => ({ id: "", fullName: "", phone: "", houseNo: "", street: "", area: "", landmark: "", city: "", district: "", state: "Tamil Nadu", country: "India", pincode: "", type: "Home", isDefault: false });

export function AddressForm({ initial, onSave, onCancel }: { initial?: Address; onSave: (address: Address) => Promise<void>; onCancel: () => void }) {
  const [address, setAddress] = useState<Address>(initial ?? empty());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (key: keyof Address, value: string | boolean) => setAddress((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving) return;

    const required = [address.fullName, address.phone, address.houseNo, address.street, address.area, address.city, address.district, address.state, address.country, address.pincode];
    if (required.some((value) => !value.trim())) {
      setError("Please complete all required address fields.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(address.phone.trim())) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    if (!/^\d{6}$/.test(address.pincode.trim())) {
      setError("Enter a valid 6-digit pincode.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await onSave(address);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "We could not save your address. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const fields: { key: keyof Address; label: string; required?: boolean }[] = [{ key: "fullName", label: "Full name", required: true }, { key: "phone", label: "Phone number", required: true }, { key: "houseNo", label: "House no. / building", required: true }, { key: "street", label: "Street", required: true }, { key: "area", label: "Area / locality", required: true }, { key: "landmark", label: "Landmark" }, { key: "city", label: "City", required: true }, { key: "district", label: "District", required: true }, { key: "state", label: "State", required: true }, { key: "country", label: "Country", required: true }, { key: "pincode", label: "Pincode", required: true }];

  return <form onSubmit={submit} className="mt-5 rounded-2xl border border-[#1E5631]/15 bg-[#F8F7F2] p-4 sm:p-5"><div className="grid gap-3 sm:grid-cols-2">{fields.map(({ key, label, required }) => <label key={key} className="text-xs font-bold text-[#173522]">{label}<input required={required} value={String(address[key])} onChange={(event) => set(key, event.target.value)} className="mt-1.5 w-full rounded-lg border border-[#1E5631]/15 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-[#4F8A3F]" /></label>)}</div><fieldset className="mt-4"><legend className="text-xs font-bold">Address type</legend><div className="mt-2 flex flex-wrap gap-3">{(["Home", "Office", "Other"] as const).map((type) => <label key={type} className="flex items-center gap-1.5 text-sm"><input type="radio" checked={address.type === type} onChange={() => set("type", type)} />{type}</label>)}</div></fieldset><label className="mt-4 flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={address.isDefault} onChange={(event) => set("isDefault", event.target.checked)} />Make this my default address</label>{error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}<div className="mt-5 flex gap-3"><button disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-[#1E5631] px-5 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">{saving && <LoaderCircle className="size-4 animate-spin" />}{saving ? "Saving..." : "Save address"}</button><button type="button" disabled={saving} onClick={onCancel} className="rounded-full border border-[#1E5631]/20 px-5 py-2.5 text-sm font-bold disabled:opacity-60">Cancel</button></div></form>;
}

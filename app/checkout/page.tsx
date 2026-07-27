"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, LoaderCircle, MapPin, Pencil, Plus, ShieldCheck, Star, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCartStore } from "@/store/cartStore";
import { AddressForm } from "@/components/address/AddressForm";
import { PaymentMethods } from "@/components/payment/PaymentMethods";
import { addAddress, deleteAddress, getAddressErrorMessage, getAddresses, setDefaultAddress, updateAddress } from "@/services/addressService";
import { createOrder } from "@/services/orderService";
import { addressText, money, type PaymentMethod } from "@/lib/order";
import type { Address } from "@/lib/user";

const card = "rounded-2xl border border-[#1E5631]/12 bg-white p-5 shadow-sm sm:p-6";
type RazorpayResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; email: string; contact: string };
  notes: { orderId: string };
  theme: { color: string };
  handler: (response: RazorpayResponse) => void;
  modal: { ondismiss: () => void };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const { items, clearCart } = useCartStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [selected, setSelected] = useState("");
  const [editing, setEditing] = useState<Address>();
  const [formOpen, setFormOpen] = useState(false);
  const [payment, setPayment] = useState<PaymentMethod>("Cash On Delivery");
  const [coupon, setCoupon] = useState("");
  const [notice, setNotice] = useState("");
  const [addressError, setAddressError] = useState("");
  const [addressSuccess, setAddressSuccess] = useState("");
  const [settingDefault, setSettingDefault] = useState("");
  const [deleting, setDeleting] = useState("");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login?next=/checkout");
  }, [loading, router, user]);

  const loadAddresses = async (uid: string) => {
    setAddressesLoading(true);
    setAddressError("");
    try {
      const next = await getAddresses(uid);
      setAddresses(next);
      setSelected((current) => next.some((address) => address.id === current) ? current : next.find((address) => address.isDefault)?.id ?? next[0]?.id ?? "");
      return next;
    } catch (error) {
      setAddresses([]);
      setSelected("");
      setAddressError(getAddressErrorMessage(error));
      return [];
    } finally {
      setAddressesLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    const timeout = window.setTimeout(() => void loadAddresses(user.uid), 0);
    return () => window.clearTimeout(timeout);
  // Loading addresses is intentionally tied to the authenticated account only.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  useEffect(() => {
    if (!addressSuccess) return;
    const timeout = window.setTimeout(() => setAddressSuccess(""), 3500);
    return () => window.clearTimeout(timeout);
  }, [addressSuccess]);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryCharge = subtotal >= 500 ? 0 : 49;
    const discount = coupon.trim().toUpperCase() === "HERBAL10" ? Math.round(subtotal * .1) : 0;
    const gst = Math.round((subtotal - discount) * .05);
    return { subtotal, deliveryCharge, gst, discount, coupon: discount ? "HERBAL10" : "", grandTotal: subtotal + deliveryCharge + gst - discount };
  }, [coupon, items]);

  const selectedAddress = addresses.find((address) => address.id === selected) ?? addresses.find((address) => address.isDefault) ?? addresses[0];

  const save = async (address: Address) => {
    if (!user) throw new Error("Please sign in to save an address.");
    setAddressError("");
    const saved = address.id ? (await updateAddress(user.uid, address), address) : await addAddress(user.uid, address);
    const next = await loadAddresses(user.uid);
    setSelected(next.find((item) => item.isDefault)?.id ?? saved.id);
    setFormOpen(false);
    setEditing(undefined);
    setAddressSuccess(address.id ? "Address updated successfully." : "Address saved successfully.");
  };

  const remove = async (id: string) => {
    if (!user || !confirm("Remove this saved address?")) return;
    setDeleting(id);
    setAddressError("");
    try {
      await deleteAddress(user.uid, id);
      await loadAddresses(user.uid);
      setAddressSuccess("Address deleted successfully.");
    } catch (error) {
      setAddressError(getAddressErrorMessage(error));
    } finally {
      setDeleting("");
    }
  };

  const makeDefault = async (id: string) => {
    if (!user) {
      setAddressError("Please sign in to manage your addresses.");
      return;
    }
    setSettingDefault(id);
    setAddressError("");
    try {
      await setDefaultAddress(user.uid, id);
      await loadAddresses(user.uid);
      setSelected(id);
      setAddressSuccess("Default address updated.");
    } catch (error) {
      setAddressError(getAddressErrorMessage(error));
    } finally {
      setSettingDefault("");
    }
  };

  const placeOrder = async () => {
    if (!user || !selectedAddress) {
      setNotice("Please choose a delivery address.");
      return;
    }
    if (!items.length) {
      setNotice("Your cart is empty.");
      return;
    }
    setPlacing(true);
    setNotice("");
    try {
      const customer = { uid: user.uid, name: profile?.name || user.displayName || selectedAddress.fullName, email: user.email || profile?.email || "", phone: profile?.phone || selectedAddress.phone };
      const result = await createOrder({ customer, address: selectedAddress, items, totals, paymentMethod: payment });
      if (payment !== "Cash On Delivery") {
        const scriptReady = await loadRazorpayScript();
        if (!scriptReady || !window.Razorpay) throw new Error("Payment gateway could not load. Please try again.");
        const paymentOrderResponse = await fetch("/api/payment/create-order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: totals.grandTotal, orderId: result.id }) });
        const paymentOrder = await paymentOrderResponse.json() as { order?: { id: string; amount: number; currency: string }; error?: string };
        if (!paymentOrderResponse.ok || !paymentOrder.order) throw new Error(paymentOrder.error || "Unable to start payment.");
        const gatewayOrder = paymentOrder.order;
        const Razorpay = window.Razorpay;
        const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
        if (!Razorpay || !razorpayKey) throw new Error("Payment gateway is not configured.");
        await new Promise<void>((resolve, reject) => {
          const razorpay = new Razorpay({
            key: razorpayKey,
            amount: gatewayOrder.amount,
            currency: gatewayOrder.currency,
            name: "Aram Narpavi Herbals",
            description: result.orderId,
            order_id: gatewayOrder.id,
            prefill: { name: customer.name, email: customer.email, contact: customer.phone },
            notes: { orderId: result.id },
            theme: { color: "#1E5631" },
            handler: async (response) => {
              const verification = await fetch("/api/payment/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...response, orderId: result.id }) });
              const verified = await verification.json() as { verified?: boolean; error?: string };
              if (!verification.ok || !verified.verified) reject(new Error(verified.error || "Payment verification failed."));
              else resolve();
            },
            modal: { ondismiss: () => reject(new Error("Payment was cancelled.")) },
          });
          razorpay.open();
        });
      }
      clearCart();
      const payload = { ...result, customer, address: selectedAddress, items, totals, paymentMethod: payment, orderDate: new Date().toLocaleString("en-IN") };
      const [emailResult] = await Promise.allSettled([
        fetch("/api/send-order-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: result.id }) }),
        fetch("/api/send-whatsapp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }),
      ]);
      if (emailResult.status === "rejected" || !emailResult.value.ok) {
        console.error("Order confirmation email could not be sent", emailResult);
      }
      router.replace(`/order-success?order=${result.id}`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "We could not place your order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (loading || !user) return <main className="mx-auto max-w-7xl px-4 py-12"><div className="h-96 animate-pulse rounded-2xl bg-[#1E5631]/5" /></main>;

  return <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
    {addressSuccess && <div role="status" className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-[#1E5631] px-4 py-3 text-sm font-bold text-white shadow-lg"><CheckCircle2 className="size-4" />{addressSuccess}</div>}
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Secure checkout</p><h1 className="mt-2 text-4xl font-bold text-[#1E5631] sm:text-5xl">Almost home.</h1><p className="mt-2 text-sm text-[#607065]">Review your delivery and complete your order securely.</p></div><span className="flex items-center gap-2 rounded-full bg-[#EAF5E4] px-4 py-2 text-sm font-bold text-[#1E5631]"><ShieldCheck className="size-4" />Safe & secure checkout</span></div>
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px]"><div className="space-y-6">
      <section className={card}><p className="eyebrow">1 · Customer details</p><h2 className="mt-1 text-2xl font-bold text-[#1E5631]">Your contact details</h2><div className="mt-5 grid gap-3 sm:grid-cols-3">{[["Name", profile?.name || user.displayName || "Customer"], ["Email", user.email || profile?.email || "—"], ["Mobile", profile?.phone || "Add via profile"]].map(([label, value]) => <div key={label} className="rounded-xl bg-[#F8F7F2] p-3"><p className="text-xs font-bold text-[#607065]">{label}</p><p className="mt-1 break-words text-sm font-semibold">{value}</p></div>)}</div></section>
      <section className={card}><div className="flex items-start justify-between gap-4"><div><p className="eyebrow">2 · Delivery address</p><h2 className="mt-1 text-2xl font-bold text-[#1E5631]">Where should we deliver?</h2></div><button onClick={() => { setEditing(undefined); setFormOpen(true); }} className="inline-flex items-center gap-1.5 rounded-full bg-[#1E5631] px-4 py-2 text-sm font-bold text-white"><Plus className="size-4" />Add new</button></div>
        {addressError && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{addressError}</p>}
        {addressesLoading ? <div className="mt-5 flex items-center gap-2 text-sm text-[#607065]"><LoaderCircle className="size-4 animate-spin" />Loading saved addresses...</div> : addresses.length ? <div className="mt-5 grid gap-3">{addresses.map((address) => <label key={address.id} className={`relative flex cursor-pointer gap-3 rounded-xl border p-4 ${selected === address.id ? "border-[#1E5631] bg-[#EAF5E4]/60" : "border-[#1E5631]/12"}`}><input className="mt-1 accent-[#1E5631]" type="radio" checked={selected === address.id} onChange={() => setSelected(address.id)} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><strong>{address.fullName}</strong><span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-extrabold uppercase text-[#1E5631]">{address.type}</span>{address.isDefault && <span className="rounded-full bg-[#EAF5E4] px-2 py-0.5 text-[10px] font-extrabold uppercase text-[#1E5631]">Default</span>}</div><p className="mt-1 text-sm text-[#607065]">{addressText(address)}</p><p className="mt-1 text-sm font-semibold">{address.phone}</p></div><div className="flex shrink-0 gap-1"><button type="button" aria-label={`Edit ${address.fullName}'s address`} onClick={(event) => { event.preventDefault(); setEditing(address); setFormOpen(true); }} className="p-1.5 text-[#1E5631]"><Pencil className="size-4" /></button>{!address.isDefault && <button type="button" disabled={settingDefault === address.id} aria-label={`Set ${address.fullName}'s address as default`} onClick={(event) => { event.preventDefault(); void makeDefault(address.id); }} className="p-1.5 text-[#1E5631] disabled:opacity-60">{settingDefault === address.id ? <LoaderCircle className="size-4 animate-spin" /> : <Star className="size-4" />}</button>}<button type="button" disabled={deleting === address.id} aria-label={`Delete ${address.fullName}'s address`} onClick={(event) => { event.preventDefault(); void remove(address.id); }} className="p-1.5 text-red-700 disabled:opacity-60">{deleting === address.id ? <LoaderCircle className="size-4 animate-spin" /> : <Trash2 className="size-4" />}</button></div></label>)}</div> : <div className="mt-5 rounded-xl bg-[#F8F7F2] p-5 text-sm text-[#607065]"><MapPin className="mb-2 size-5 text-[#4F8A3F]" />No saved addresses.</div>}
        {formOpen && <AddressForm initial={editing} onSave={save} onCancel={() => { setFormOpen(false); setEditing(undefined); }} />}
      </section>
      <section className={card}><p className="eyebrow">3 · Payment method</p><h2 className="mt-1 text-2xl font-bold text-[#1E5631]">How would you like to pay?</h2><PaymentMethods value={payment} onChange={setPayment} /></section>
    </div><aside className="space-y-5 lg:sticky lg:top-24 lg:h-fit"><section className={card}><p className="eyebrow">Order summary</p><h2 className="mt-1 text-2xl font-bold text-[#1E5631]">Your bag</h2><div className="mt-5 max-h-72 space-y-4 overflow-y-auto">{items.map((item) => <div key={item.id} className="flex gap-3"><div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-[#EAF5E4]"><Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{item.name}</p><p className="text-xs text-[#607065]">{item.category} · Qty {item.quantity}</p><p className="mt-1 text-sm font-bold text-[#1E5631]">{money(item.price * item.quantity)}</p></div></div>)}</div><div className="mt-5 border-t border-[#1E5631]/10 pt-4"><div className="flex gap-2"><input value={coupon} onChange={(event) => setCoupon(event.target.value)} placeholder="Coupon code" className="min-w-0 flex-1 rounded-lg border border-[#1E5631]/15 px-3 py-2 text-sm uppercase" /><button onClick={() => setCoupon(coupon.trim())} className="rounded-lg bg-[#EAF5E4] px-3 text-xs font-bold text-[#1E5631]">Apply</button></div><p className="mt-2 text-xs text-[#607065]">Try HERBAL10 for 10% off.</p></div><dl className="mt-4 space-y-2 text-sm"><div className="flex justify-between"><dt>Subtotal</dt><dd>{money(totals.subtotal)}</dd></div><div className="flex justify-between"><dt>Delivery</dt><dd>{totals.deliveryCharge ? money(totals.deliveryCharge) : "Free"}</dd></div><div className="flex justify-between"><dt>GST</dt><dd>{money(totals.gst)}</dd></div>{totals.discount > 0 && <div className="flex justify-between font-bold text-[#4F8A3F]"><dt>Discount</dt><dd>−{money(totals.discount)}</dd></div>}<div className="flex justify-between border-t border-[#1E5631]/12 pt-3 text-lg font-extrabold text-[#1E5631]"><dt>Grand total</dt><dd>{money(totals.grandTotal)}</dd></div></dl>{notice && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{notice}</p>}<button disabled={placing || !items.length} onClick={() => void placeOrder()} className="mt-5 w-full rounded-full bg-[#1E5631] px-5 py-3.5 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">{placing ? "Placing your order..." : `Place order · ${money(totals.grandTotal)}`}</button></section></aside></div>
  </main>;
}

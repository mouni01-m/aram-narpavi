"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Heart, LogOut, MapPin, MessageSquareText, Package, ShoppingBag, UserRound } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { updateUserProfile, getUserAddresses } from "@/services/userService";
import { getWishlist, removeFromWishlist } from "@/services/wishlistService";
import { useCartStore } from "@/store/cartStore";
import type { Address } from "@/lib/user";
import { OrderList } from "@/components/orders/OrderList";
import type { Product } from "@/types/product";

const tabs = [
  { id: "profile", label: "Profile Information", icon: UserRound },
  { id: "addresses", label: "Saved Addresses", icon: MapPin },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "orders", label: "Orders", icon: Package },
  { id: "reviews", label: "Reviews", icon: MessageSquareText },
];

function ProfilePageContent() {
  const { user, profile, loading, logout, refreshProfile } = useAuth();
  const addToCart = useCartStore((state) => state.addToCart);
  const query = useSearchParams();
  const requested = query.get("tab");

  const [tab, setTab] = useState(() =>
    requested && tabs.some((item) => item.id === requested) ? requested : "profile"
  );
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [cartToast, setCartToast] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", gender: "", dob: "" });
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);

  useEffect(() => {
    if (!user) return;

    getUserAddresses(user.uid).then(setAddresses).catch(console.error);
    getWishlist(user.uid).then(setWishlist).catch(console.error);
  }, [user]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;

    setSaving(true);
    setNotice("");

    try {
      await updateUserProfile(user.uid, form);
      await refreshProfile();
      setEditing(false);
      setNotice("Your profile has been updated.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="h-64 animate-pulse rounded-lg bg-[#1E5631]/5" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto flex min-h-[55vh] max-w-xl items-center px-4 py-16 sm:px-6">
        <div>
          <p className="eyebrow">Account</p>
          <h1 className="mt-3 text-4xl font-bold text-[#1E5631]">
            Your profile is waiting.
          </h1>
          <p className="mt-4 text-[#173522]/65">
            Sign in from the Account button in the navigation to view orders, saved items, addresses, and reviews.
          </p>
        </div>
      </main>
    );
  }

  const emptyCopy: Record<string, string> = {
    addresses: "You have not saved an address yet.",
    wishlist: "Your wishlist is currently empty.",
    orders: "You have not placed an order yet.",
    reviews: "You have not written any reviews yet.",
  };

  const values = editing
    ? form
    : {
        name: profile?.name ?? "",
        phone: profile?.phone ?? "",
        gender: profile?.gender ?? "",
        dob: profile?.dob ?? "",
      };

  const moveToCart = async (item: Product) => {
    if (!user) return;

    try {
      addToCart(item, 1);
      await removeFromWishlist(user.uid, item.slug);
      setWishlist((prev) => prev.filter((p) => p.slug !== item.slug));
      setCartToast("Added to cart");
      window.setTimeout(() => setCartToast(""), 2200);
      window.dispatchEvent(new Event("open-cart"));
      window.dispatchEvent(new Event("wishlist-updated"));
    } catch (error) {
      console.error("Error moving to cart:", error);
    }
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <div className="mb-8">
        <p className="eyebrow">My account</p>
        <h1 className="mt-2 text-4xl font-bold text-[#1E5631]">
          Hello, {profile?.name || user.displayName || "Customer"}
        </h1>
        <p className="mt-2 text-sm text-[#173522]/65">
          Manage your details and shopping activity.
        </p>
      </div>

      <div className="grid gap-7 lg:grid-cols-[245px_1fr]">
        <aside className="h-fit border-b border-[#1E5631]/12 pb-4 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-5">
          <nav className="flex gap-2 overflow-x-auto lg:flex-col">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setTab(id);
                  setEditing(false);
                }}
                className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition ${
                  tab === id
                    ? "bg-[#EAF5E4] text-[#1E5631]"
                    : "text-[#173522]/65 hover:bg-white hover:text-[#1E5631]"
                }`}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
            <button
              onClick={() => void logout()}
              className="flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-red-700 hover:bg-red-50"
            >
              <LogOut className="size-4" />
              Logout
            </button>
          </nav>
        </aside>

        <section className="min-w-0 rounded-lg border border-[#1E5631]/12 bg-white/70 p-5 shadow-sm sm:p-7">
          {tab === "profile" ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#1E5631]">
                  Profile Information
                </h2>
                <p className="mt-3 text-[#173522]/60">
                  Update your profile details and contact information.
                </p>
              </div>

              {notice && (
                <p className="rounded-lg bg-[#EAF5E4] px-3 py-2 text-sm text-[#1E5631]">
                  {notice}
                </p>
              )}

              <form onSubmit={save} className="grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-semibold">
                  Full name
                  <input
                    disabled={!editing}
                    value={values.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    className="mt-1.5 w-full rounded-lg border border-[#1E5631]/18 bg-white px-3 py-2.5 text-sm disabled:bg-[#F8F7F2] disabled:text-[#173522]/65"
                  />
                </label>

                <label className="text-sm font-semibold">
                  Email
                  <input
                    disabled
                    value={profile?.email || user.email || ""}
                    className="mt-1.5 w-full rounded-lg border border-[#1E5631]/18 bg-[#F8F7F2] px-3 py-2.5 text-sm text-[#173522]/65"
                  />
                </label>

                <label className="text-sm font-semibold">
                  Phone number
                  <input
                    disabled={!editing}
                    value={values.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    className="mt-1.5 w-full rounded-lg border border-[#1E5631]/18 bg-white px-3 py-2.5 text-sm disabled:bg-[#F8F7F2] disabled:text-[#173522]/65"
                  />
                </label>

                <label className="text-sm font-semibold">
                  Gender
                  <select
                    disabled={!editing}
                    value={values.gender}
                    onChange={(e) =>
                      setForm({ ...form, gender: e.target.value })
                    }
                    className="mt-1.5 w-full rounded-lg border border-[#1E5631]/18 bg-white px-3 py-2.5 text-sm disabled:bg-[#F8F7F2] disabled:text-[#173522]/65"
                  >
                    <option value="">Not specified</option>
                    <option>Female</option>
                    <option>Male</option>
                    <option>Prefer not to say</option>
                  </select>
                </label>

                <label className="text-sm font-semibold">
                  Date of birth
                  <input
                    disabled={!editing}
                    type="date"
                    value={values.dob}
                    onChange={(e) =>
                      setForm({ ...form, dob: e.target.value })
                    }
                    className="mt-1.5 w-full rounded-lg border border-[#1E5631]/18 bg-white px-3 py-2.5 text-sm disabled:bg-[#F8F7F2] disabled:text-[#173522]/65"
                  />
                </label>

                {editing && (
                  <div className="sm:col-span-2">
                    <button
                      disabled={saving}
                      className="rounded-lg bg-[#1E5631] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#174526] disabled:opacity-60"
                    >
                      {saving ? "Saving..." : "Save changes"}
                    </button>
                  </div>
                )}
              </form>

              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 rounded-lg border border-[#1E5631]/20 px-4 py-2.5 text-sm font-semibold text-[#1E5631] hover:bg-[#EAF5E4]"
                >
                  Edit Profile
                </button>
              )}
            </div>
          ) : tab === "addresses" ? (
            <div>
              <h2 className="mb-6 text-2xl font-bold text-[#1E5631]">
                Saved Addresses
              </h2>

              {addresses.length === 0 ? (
                <p className="text-[#173522]/60">
                  {emptyCopy.addresses}
                </p>
              ) : (
                <div className="space-y-5">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className="rounded-xl border border-[#1E5631]/15 p-5"
                    >
                      <div className="mb-2 flex items-center gap-3">
                        <h3 className="text-lg font-bold">
                          {address.fullName}
                        </h3>
                        {address.isDefault && (
                          <span className="rounded bg-green-100 px-2 py-1 text-xs font-bold">
                            DEFAULT
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-[#173522]/75">
                        {address.houseNo && `${address.houseNo}, `}
                        {address.street && `${address.street}, `}
                        {address.area && `${address.area}, `}
                        {address.city && `${address.city}, `}
                        {address.district && `${address.district}, `}
                        {address.state && `${address.state}, `}
                        {address.pincode && `${address.pincode}, `}
                        {address.country}
                      </p>

                      <p className="mt-3 font-semibold text-[#1E5631]">
                        {address.phone}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : tab === "wishlist" ? (
            <div>
              {wishlist.length === 0 ? (
                <div className="py-8 text-center">
                  <h2 className="text-2xl font-bold text-[#1E5631]">
                    Wishlist
                  </h2>
                  <p className="mt-3 text-[#173522]/60">
                    {emptyCopy.wishlist}
                  </p>
                </div>
              ) : !user ? (
                <div className="py-8 text-center">
                  <h2 className="text-2xl font-bold text-[#1E5631]">
                    Wishlist
                  </h2>
                  <p className="mt-3 text-[#173522]/60">
                    Please log in to view your wishlist.
                  </p>
                </div>
              ) : (
                <div>
                  <h2 className="mb-6 text-2xl font-bold text-[#1E5631]">
                    Wishlist
                  </h2>

                  {cartToast && (
                    <div className="mb-4 rounded-lg bg-[#EAF5E4] px-4 py-3 text-sm font-semibold text-[#1E5631]">
                      {cartToast}
                    </div>
                  )}

                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {wishlist.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-[#1E5631]/10 bg-white p-4 shadow-sm"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-40 w-full rounded-lg object-cover"
                        />

                        <h3 className="mt-4 text-lg font-bold">
                          {item.name}
                        </h3>

                        <p className="mt-1 font-semibold text-[#1E5631]">
                          ₹{item.price}
                        </p>

                        <div className="mt-4 flex flex-col gap-2">
                          <Link
                            href={`/product/${item.slug}`}
                            className="rounded-lg bg-[#1E5631] px-4 py-2 text-center text-sm font-semibold text-white hover:bg-[#174526]"
                          >
                            View Product
                          </Link>

                          <button
                            onClick={() => moveToCart(item)}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#1E5631] bg-white px-4 py-2 text-sm font-semibold text-[#1E5631] transition hover:bg-[#EAF5E4]"
                          >
                            <ShoppingBag className="size-4" />
                            Move to Cart
                          </button>

                          <button
                            onClick={async () => {
                              if (!user) return;

                              await removeFromWishlist(
                                user.uid,
                                item.slug
                              );

                              setWishlist((prev) =>
                                prev.filter((p) => p.slug !== item.slug)
                              );
                              window.dispatchEvent(new Event("wishlist-updated"));
                            }}
                            className="rounded-lg border border-red-500 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )  : tab === "orders" ? (
  <OrderList uid={user.uid} />
): tab === "reviews" ? (
            <div className="py-8 text-center">
              <h2 className="text-2xl font-bold text-[#1E5631]">Reviews</h2>
              <p className="mx-auto mt-3 max-w-sm text-sm text-[#173522]/60">
                {emptyCopy.reviews}
              </p>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <div className="h-64 animate-pulse rounded-lg bg-[#1E5631]/5" />
        </main>
      }
    >
      <ProfilePageContent />
    </Suspense>
  );
}

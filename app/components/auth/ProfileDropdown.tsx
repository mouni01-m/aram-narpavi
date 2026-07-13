"use client";
import Link from "next/link";
import { Heart, LogOut, MapPin, MessageSquareText, Package, UserRound } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const items = [{ href: "/profile", label: "My Profile", icon: UserRound }, { href: "/profile?tab=orders", label: "My Orders", icon: Package }, { href: "/profile?tab=wishlist", label: "Wishlist", icon: Heart }, { href: "/profile?tab=reviews", label: "My Reviews", icon: MessageSquareText }, { href: "/profile?tab=addresses", label: "Saved Addresses", icon: MapPin }];
export function ProfileDropdown({ onNavigate }: { onNavigate?: () => void }) {
  const { logout } = useAuth();
  return <div className="w-60 rounded-lg border border-[#1E5631]/12 bg-white p-2 shadow-xl"><div className="border-b border-[#1E5631]/10 px-3 py-2.5"><p className="text-xs text-[#173522]/55">Your account</p><p className="truncate text-sm font-bold text-[#1E5631]">Manage purchases and preferences</p></div><div className="py-1">{items.map(({ href, label, icon: Icon }) => <Link key={label} href={href} onClick={onNavigate} className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-[#173522]/80 hover:bg-[#EAF5E4] hover:text-[#1E5631]"><Icon className="size-4"/>{label}</Link>)}</div><div className="border-t border-[#1E5631]/10 pt-1"><button onClick={() => { void logout(); onNavigate?.(); }} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-semibold text-red-700 hover:bg-red-50"><LogOut className="size-4"/>Logout</button></div></div>;
}

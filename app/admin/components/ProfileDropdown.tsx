"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  Bell,
  ChevronDown,
  CircleHelp,
  LogOut,
  Palette,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

type ProfileDropdownProps = {
  name: string;
  email?: string | null;
  avatarUrl?: string | null;
};

const menuItems = [
  { label: "My Profile", href: "/profile", icon: UserRound },
  { label: "Account Settings", href: "/profile", icon: SlidersHorizontal },
  { label: "Admin Settings", href: "/admin/settings", icon: Settings },
  { label: "Notifications", href: "/admin/settings#notifications", icon: Bell },
  { label: "Theme", href: "/admin/settings#appearance", icon: Palette },
  { label: "Help", href: "/admin/settings#about", icon: CircleHelp },
];

export function ProfileDropdown({ name, email, avatarUrl }: ProfileDropdownProps) {
  const router = useRouter();
  const initial = name.trim().slice(0, 1).toUpperCase() || "A";
  const avatarStyle = avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : undefined;

  const handleLogout = async () => {
    try {
      sessionStorage.removeItem("adminSession");
      localStorage.removeItem("adminSession");
      await signOut(auth);
      router.replace("/login");
    } catch (error) {
      console.error("Admin logout failed", error);
    }
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="flex max-w-[15rem] items-center gap-3 rounded-lg border border-[#dfe7df] bg-white px-2.5 py-2 text-left shadow-sm transition hover:border-[#c9d8c9] hover:bg-[#f8faf8] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1e5631]/15"
          aria-label="Open admin profile menu"
        >
          <span
            className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-full bg-[#1e5631] bg-cover bg-center text-sm font-extrabold text-white"
            style={avatarStyle}
            aria-label={`${name} avatar`}
          >
            {avatarUrl ? null : initial}
          </span>
          <span className="hidden min-w-0 sm:block">
            <span className="block truncate text-sm font-bold leading-5 text-[#17251d]">{name}</span>
            <span className="flex items-center gap-1 text-xs font-semibold text-[#557061]">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              Super Admin
            </span>
          </span>
          <ChevronDown className="hidden size-4 shrink-0 text-[#7a867e] sm:block" aria-hidden="true" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={10}
          className="z-[90] w-72 rounded-lg border border-[#dfe7df] bg-white p-2 shadow-2xl shadow-[#17251d]/10 outline-none"
        >
          <div className="flex items-center gap-3 border-b border-[#edf1ed] px-2 py-3">
            <span
              className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-full bg-[#1e5631] bg-cover bg-center text-base font-extrabold text-white"
              style={avatarStyle}
              aria-label={`${name} avatar`}
            >
              {avatarUrl ? null : initial}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold text-[#17251d]">{name}</span>
              <span className="block truncate text-xs text-[#66736b]">{email || "Super Admin"}</span>
            </span>
          </div>

          <div className="py-2">
            {menuItems.map(({ label, href, icon: Icon }) => (
              <DropdownMenu.Item key={label} asChild>
                <Link
                  href={href}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-[#344238] outline-none transition hover:bg-[#f1f6ef] focus:bg-[#f1f6ef]"
                >
                  <Icon className="size-4 text-[#66736b]" aria-hidden="true" />
                  {label}
                </Link>
              </DropdownMenu.Item>
            ))}
          </div>

          <DropdownMenu.Separator className="h-px bg-[#edf1ed]" />
          <DropdownMenu.Item asChild>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="mt-2 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-[#b42318] outline-none transition hover:bg-[#fff1f0] focus:bg-[#fff1f0]"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Logout
            </button>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

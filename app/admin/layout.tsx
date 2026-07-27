"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  BarChart3,
  Bell,
  Leaf,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Search,
  Settings,
  ShoppingBag,
  ShieldCheck,
  Star,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type AdminLayoutProps = { children: ReactNode };

const navigation = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function pageTitle(pathname: string): string {
  const currentPage = navigation.find((item) => item.href === pathname);
  return currentPage?.label ?? "Admin";
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, logout } = useAuth();
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const currentTitle = pageTitle(pathname);
  const adminName = profile?.name || user?.displayName || "Admin";

  const isActive = (href: string) => href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  const closeMobileNavigation = () => setMobileNavigationOpen(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/login");
    } catch (error) {
      console.error("Admin logout failed", error);
    }
  };

  const sidebar = (mobile = false) => (
    <aside className={mobile ? "flex h-full w-[19rem] flex-col bg-[#143d24] text-white shadow-2xl" : "hidden h-screen w-72 shrink-0 flex-col bg-[#143d24] text-white lg:sticky lg:top-0 lg:flex"}>
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-6">
        <Link href="/admin" className="flex items-center gap-3" onClick={closeMobileNavigation}>
          <span className="grid size-11 place-items-center rounded-2xl bg-[#eaf5e4] text-[#1e5631] shadow-lg shadow-black/10"><Leaf className="size-6" /></span>
          <span>
            <span className="block text-base font-extrabold tracking-tight">Aram Narpavi</span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#b9d9af]">Herbals · Admin</span>
          </span>
        </Link>
        {mobile && <button type="button" aria-label="Close menu" onClick={closeMobileNavigation} className="rounded-xl p-2 text-white/70 transition hover:bg-white/10 hover:text-white"><X className="size-5" /></button>}
      </div>

      <nav className="flex-1 px-4 py-6" aria-label="Admin navigation">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">Workspace</p>
        <ul className="space-y-1.5">
          {navigation.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return <li key={href}>
              <Link href={href} onClick={closeMobileNavigation} className={`group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-all duration-200 ${active ? "bg-[#eaf5e4] text-[#173d24] shadow-lg shadow-black/10" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
                <Icon className={`size-5 transition-transform duration-200 group-hover:scale-110 ${active ? "text-[#1e5631]" : "text-[#b9d9af]"}`} />
                {label}
              </Link>
            </li>;
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <span className="grid size-9 place-items-center rounded-full bg-[#4f8a3f] text-xs font-extrabold">{adminName.slice(0, 1).toUpperCase()}</span>
          <span className="min-w-0"><span className="block truncate text-sm font-bold">{adminName}</span><span className="block text-xs text-white/55">Super Admin</span></span>
        </div>
        <button type="button" onClick={() => void handleLogout()} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-[#ffd0d0] transition hover:bg-red-400/15 hover:text-white"><LogOut className="size-5" />Logout</button>
      </div>
    </aside>
  );

  return <div className="admin-layout min-h-screen bg-[#f5f7f3] text-[#173522]">
    <style jsx global>{`
      body:has(.admin-layout) > nav,
      body:has(.admin-layout) > footer { display: none !important; }
      body:has(.admin-layout) > main { display: block !important; min-height: 100vh; }
    `}</style>

    <div className="flex min-h-screen">
      {sidebar()}

      {mobileNavigationOpen && <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="Admin navigation">
        <button type="button" aria-label="Close menu" className="absolute inset-0 bg-[#102c1a]/50 backdrop-blur-sm" onClick={closeMobileNavigation} />
        <div className="relative h-full">{sidebar(true)}</div>
      </div>}

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-40 border-b border-[#1e5631]/10 bg-[#fdfefc]/90 backdrop-blur-xl">
          <div className="flex h-20 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button type="button" onClick={() => setMobileNavigationOpen(true)} aria-label="Open menu" className="grid size-10 place-items-center rounded-xl border border-[#1e5631]/10 bg-white text-[#1e5631] shadow-sm transition hover:bg-[#eaf5e4] lg:hidden"><Menu className="size-5" /></button>
            <div className="min-w-0 lg:w-52">
              <p className="hidden text-xs font-medium text-[#607065] sm:block">Admin workspace</p>
              <h1 className="truncate text-xl font-extrabold tracking-tight text-[#173d24] sm:text-2xl">{currentTitle}</h1>
            </div>

            <label className="relative hidden max-w-xl flex-1 lg:block">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#607065]" />
              <input type="search" aria-label="Search admin workspace" placeholder="Search orders, products, customers..." className="h-11 w-full rounded-xl border border-[#1e5631]/10 bg-[#f5f7f3] pl-11 pr-4 text-sm outline-none transition placeholder:text-[#607065]/70 focus:border-[#4f8a3f] focus:bg-white focus:ring-4 focus:ring-[#4f8a3f]/10" />
            </label>

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <button type="button" aria-label="Notifications" className="relative grid size-10 place-items-center rounded-xl border border-[#1e5631]/10 bg-white text-[#1e5631] shadow-sm transition hover:bg-[#eaf5e4]"><Bell className="size-5" /><span className="absolute right-2 top-2 size-2 rounded-full border-2 border-white bg-[#e69500]" /></button>
              <div className="hidden h-8 w-px bg-[#1e5631]/10 sm:block" />
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="grid size-10 place-items-center rounded-full bg-[#1e5631] text-sm font-extrabold text-white shadow-lg shadow-[#1e5631]/20">{adminName.slice(0, 1).toUpperCase()}</span>
                <span className="hidden min-w-0 sm:block"><span className="block max-w-32 truncate text-sm font-bold text-[#173d24]">{adminName}</span><span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#4f8a3f]"><ShieldCheck className="size-3" />Super Admin</span></span>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  </div>;
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Star,
  BarChart3,
  Settings,
  Leaf,
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    title: "Customers",
    href: "/admin/customers",
    icon: Users,
  },
  {
    title: "Reviews",
    href: "/admin/reviews",
    icon: Star,
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-72 border-r border-green-100 bg-white shadow-lg lg:flex lg:flex-col">
      {/* Logo */}
      <div className="border-b border-green-100 px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[#1E5631] p-3 text-white">
            <Leaf size={22} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#1E5631]">
              Aram Narpavi
            </h2>

            <p className="text-xs text-gray-500">
              Admin Dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            const active =
              pathname === item.href ||
              pathname.startsWith(item.href + "/");

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 ${
                    active
                      ? "bg-[#1E5631] text-white shadow-md"
                      : "text-gray-700 hover:bg-green-50 hover:text-[#1E5631]"
                  }`}
                >
                  <Icon size={20} />

                  <span className="font-medium">
                    {item.title}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

    </aside>
  );
}

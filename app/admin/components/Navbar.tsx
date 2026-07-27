"use client";

import { Menu, Bell, Search, UserCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
  const { profile, user } = useAuth();

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="sticky top-0 z-40 border-b border-green-100 bg-white">
      <div className="flex h-20 items-center justify-between px-6">

        {/* Left */}
        <div className="flex items-center gap-4">

          <button className="rounded-lg p-2 hover:bg-green-50 lg:hidden">
            <Menu size={22} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-[#1E5631]">
              Dashboard
            </h1>

            <p className="text-sm text-gray-500">
              {today}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="hidden w-full max-w-lg px-10 lg:block">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search orders, products, customers..."
              className="w-full rounded-xl border border-green-100 bg-[#F7F8F5] py-3 pl-11 pr-4 outline-none transition focus:border-[#1E5631]"
            />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-5">

          <button className="relative rounded-xl bg-[#F7F8F5] p-3 transition hover:bg-green-50">
            <Bell size={20} />

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          <div className="flex items-center gap-3">

            <div className="text-right hidden sm:block">
              <p className="font-semibold text-[#1E5631]">
                {profile?.name || user?.displayName || "Admin"}
              </p>

              <p className="text-xs text-gray-500">
                Super Administrator
              </p>
            </div>

            <div className="rounded-full bg-[#1E5631] p-2 text-white">
              <UserCircle size={34} />
            </div>

          </div>

        </div>

      </div>
    </header>
  );
}
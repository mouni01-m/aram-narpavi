"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Ban,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Edit3,
  Eye,
  MailCheck,
  MapPin,
  PackageCheck,
  RefreshCw,
  Search,
  ShoppingBag,
  Star,
  Trash2,
  UserCheck,
  Users,
  UserX,
  X,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";

import { deleteAdminCustomer, getAdminCustomers, updateAdminCustomer, type AdminCustomerProfile } from "@/services/customerService";
import { getOrders } from "@/services/orderService";
import { addressText, money, type Order } from "@/lib/order";

type CustomerStatusFilter = "all" | "active" | "blocked" | "verified" | "unverified" | "with-orders" | "without-orders";
type CustomerSort = "newest" | "oldest" | "highest-spending" | "lowest-spending" | "alphabetical";
type CustomerRow = AdminCustomerProfile & {
  orderStats: {
    totalOrders: number;
    completed: number;
    pending: number;
    cancelled: number;
    returned: number;
    totalSpending: number;
    averageOrderValue: number;
    largestOrder: number;
    lastOrder?: Order;
  };
};

const CUSTOMERS_PER_PAGE = 10;

function timestampMs(value: unknown) {
  if (value && typeof value === "object") {
    if ("toMillis" in value && typeof value.toMillis === "function") return value.toMillis();
    if ("seconds" in value && typeof value.seconds === "number") return value.seconds * 1000;
  }

  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
}

function formatDate(value: unknown) {
  const ms = timestampMs(value);
  if (!ms) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(ms));
}

function getCustomerId(customer: AdminCustomerProfile) {
  return customer.uid ? `CUS-${customer.uid.slice(0, 8).toUpperCase()}` : "—";
}

function getStatus(customer: AdminCustomerProfile) {
  return customer.status === "blocked" ? "blocked" : "active";
}

function getWishlistCount(customer: AdminCustomerProfile) {
  return Array.isArray(customer.wishlist) ? customer.wishlist.length : 0;
}

function getCartItemsCount(customer: AdminCustomerProfile) {
  return Array.isArray(customer.cart) ? customer.cart.length : 0;
}

function getReviewsCount(customer: AdminCustomerProfile) {
  return Array.isArray(customer.reviews) ? customer.reviews.length : 0;
}

function getAddresses(customer: AdminCustomerProfile) {
  return Array.isArray(customer.addresses) ? customer.addresses : [];
}

function getDefaultAddress(customer: AdminCustomerProfile) {
  const addresses = getAddresses(customer);
  return addresses.find((address) => address.id === customer.defaultAddressId) ?? addresses.find((address) => address.isDefault) ?? addresses[0];
}

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "CU";
}

function buildCustomerRows(customers: AdminCustomerProfile[], orders: Order[]): CustomerRow[] {
  return customers.map((customer) => {
    const customerOrders = orders.filter((order) => order.customer.uid === customer.uid);
    const completedOrders = customerOrders.filter((order) => order.status === "Delivered");
    const spendingOrders = completedOrders.length ? completedOrders : customerOrders.filter((order) => order.status !== "Cancelled");
    const totalSpending = spendingOrders.reduce((total, order) => total + Number(order.totals?.grandTotal ?? 0), 0);
    const lastOrder = customerOrders[0];

    return {
      ...customer,
      orderStats: {
        totalOrders: customerOrders.length,
        completed: completedOrders.length,
        pending: customerOrders.filter((order) => !["Delivered", "Cancelled"].includes(order.status)).length,
        cancelled: customerOrders.filter((order) => order.status === "Cancelled").length,
        returned: 0,
        totalSpending,
        averageOrderValue: customerOrders.length ? totalSpending / customerOrders.length : 0,
        largestOrder: customerOrders.reduce((largest, order) => Math.max(largest, Number(order.totals?.grandTotal ?? 0)), 0),
        lastOrder,
      },
    };
  });
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<AdminCustomerProfile[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CustomerStatusFilter>("all");
  const [sort, setSort] = useState<CustomerSort>("newest");
  const [page, setPage] = useState(1);
  const [viewingCustomer, setViewingCustomer] = useState<CustomerRow | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<CustomerRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CustomerRow | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadCustomers = useCallback(async (mode: "initial" | "refresh" = "refresh") => {
    try {
      if (mode === "refresh") setRefreshing(true);
      setError("");
      const [customerData, orderData] = await Promise.all([getAdminCustomers(), getOrders()]);
      setCustomers(customerData.filter((customer) => customer.role !== "admin"));
      setOrders(orderData);
    } catch (loadError) {
      console.error(loadError);
      setError("Unable to load customers from Firestore.");
      toast.error("Unable to load customers.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function loadInitialCustomers() {
      try {
        setError("");
        const [customerData, orderData] = await Promise.all([getAdminCustomers(), getOrders()]);
        if (!active) return;
        setCustomers(customerData.filter((customer) => customer.role !== "admin"));
        setOrders(orderData);
      } catch (loadError) {
        if (!active) return;
        console.error(loadError);
        setError("Unable to load customers from Firestore.");
        toast.error("Unable to load customers.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadInitialCustomers();
    return () => { active = false; };
  }, [loadCustomers]);

  const rows = useMemo(() => buildCustomerRows(customers, orders), [customers, orders]);

  const dashboardStats = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const active = rows.filter((customer) => getStatus(customer) === "active").length;
    const blocked = rows.filter((customer) => getStatus(customer) === "blocked").length;
    const newThisMonth = rows.filter((customer) => {
      const joined = new Date(timestampMs(customer.createdAt));
      return joined.getMonth() === month && joined.getFullYear() === year;
    }).length;
    const withOrders = rows.filter((customer) => customer.orderStats.totalOrders > 0).length;
    const revenue = rows.reduce((total, customer) => total + customer.orderStats.totalSpending, 0);
    const totalOrders = rows.reduce((total, customer) => total + customer.orderStats.totalOrders, 0);

    return [
      { label: "Total Customers", value: rows.length.toLocaleString("en-IN"), icon: Users, tone: "bg-[#EAF5E4] text-[#1E5631]" },
      { label: "Active Customers", value: active.toLocaleString("en-IN"), icon: UserCheck, tone: "bg-emerald-50 text-emerald-700" },
      { label: "Blocked Customers", value: blocked.toLocaleString("en-IN"), icon: UserX, tone: "bg-red-50 text-red-700" },
      { label: "New Customers This Month", value: newThisMonth.toLocaleString("en-IN"), icon: CalendarDays, tone: "bg-amber-50 text-amber-700" },
      { label: "Customers With Orders", value: withOrders.toLocaleString("en-IN"), icon: PackageCheck, tone: "bg-teal-50 text-teal-700" },
      { label: "Customers Without Orders", value: (rows.length - withOrders).toLocaleString("en-IN"), icon: ShoppingBag, tone: "bg-stone-50 text-stone-700" },
      { label: "Average Order Value", value: money(totalOrders ? revenue / totalOrders : 0), icon: CircleDollarSign, tone: "bg-lime-50 text-lime-700" },
      { label: "Total Customer Revenue", value: money(revenue), icon: CircleDollarSign, tone: "bg-green-50 text-green-700" },
    ];
  }, [rows]);

  const filteredCustomers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const filtered = rows.filter((customer) => {
      const customerId = getCustomerId(customer);
      const matchesSearch = !keyword || [customer.name, customer.email, customer.phone, customer.uid, customerId].some((value) => (value || "").toLowerCase().includes(keyword));
      const verified = customer.emailVerified === true;
      const matchesFilter = statusFilter === "all"
        || (statusFilter === "active" && getStatus(customer) === "active")
        || (statusFilter === "blocked" && getStatus(customer) === "blocked")
        || (statusFilter === "verified" && verified)
        || (statusFilter === "unverified" && !verified)
        || (statusFilter === "with-orders" && customer.orderStats.totalOrders > 0)
        || (statusFilter === "without-orders" && customer.orderStats.totalOrders === 0);
      return matchesSearch && matchesFilter;
    });

    return filtered.sort((first, second) => {
      if (sort === "oldest") return timestampMs(first.createdAt) - timestampMs(second.createdAt);
      if (sort === "highest-spending") return second.orderStats.totalSpending - first.orderStats.totalSpending;
      if (sort === "lowest-spending") return first.orderStats.totalSpending - second.orderStats.totalSpending;
      if (sort === "alphabetical") return first.name.localeCompare(second.name);
      return timestampMs(second.createdAt) - timestampMs(first.createdAt);
    });
  }, [rows, search, sort, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / CUSTOMERS_PER_PAGE));
  const paginatedCustomers = filteredCustomers.slice((page - 1) * CUSTOMERS_PER_PAGE, page * CUSTOMERS_PER_PAGE);

  async function handleRefresh() {
    await loadCustomers("refresh");
    toast.success("Customers refreshed.");
  }

  async function handleToggleStatus(customer: CustomerRow) {
    try {
      setBusyId(customer.uid);
      const nextStatus = getStatus(customer) === "blocked" ? "active" : "blocked";
      await updateAdminCustomer(customer.uid, { status: nextStatus });
      setCustomers((current) => current.map((item) => item.uid === customer.uid ? { ...item, status: nextStatus } : item));
      toast.success(nextStatus === "blocked" ? "Customer disabled." : "Customer enabled.");
    } catch (toggleError) {
      console.error(toggleError);
      toast.error("Unable to update customer status.");
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    try {
      setBusyId(deleteTarget.uid);
      await deleteAdminCustomer(deleteTarget.uid);
      setCustomers((current) => current.filter((item) => item.uid !== deleteTarget.uid));
      toast.success("Customer deleted.");
      setDeleteTarget(null);
    } catch (deleteError) {
      console.error(deleteError);
      toast.error("Unable to delete customer.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#4F8A3F]">Customer management</p>
          <h1 className="mt-1 text-3xl font-bold text-[#173522]">Customers</h1>
          <p className="mt-2 text-sm text-[#607065]">Review customer profiles, order history, account status, and service notes.</p>
        </div>
      </div>

      {loading ? <CustomersSkeleton /> : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {dashboardStats.map(({ label, value, icon: Icon, tone }) => (
              <div key={label} className="rounded-2xl border border-[#1E5631]/10 bg-white p-5 shadow-[0_8px_24px_rgba(23,53,34,0.06)]">
                <div className={`grid size-11 place-items-center rounded-xl ${tone}`}><Icon className="size-5" /></div>
                <p className="mt-5 text-2xl font-bold text-[#173522]">{value}</p>
                <p className="mt-1 text-sm font-medium text-[#607065]">{label}</p>
              </div>
            ))}
          </div>

          <CustomerToolbar
            search={search}
            setSearch={(value) => { setSearch(value); setPage(1); }}
            statusFilter={statusFilter}
            setStatusFilter={(value) => { setStatusFilter(value); setPage(1); }}
            sort={sort}
            setSort={(value) => { setSort(value); setPage(1); }}
            refreshing={refreshing}
            onRefresh={() => void handleRefresh()}
          />

          {error ? <ErrorState message={error} onRetry={() => void handleRefresh()} /> : rows.length === 0 ? <EmptyState /> : (
            <CustomersTable
              customers={paginatedCustomers}
              page={page}
              totalPages={totalPages}
              totalCustomers={filteredCustomers.length}
              busyId={busyId}
              onPageChange={(nextPage) => setPage(Math.min(Math.max(1, nextPage), totalPages))}
              onView={setViewingCustomer}
              onEdit={setEditingCustomer}
              onToggleStatus={(customer) => void handleToggleStatus(customer)}
              onDelete={setDeleteTarget}
            />
          )}
        </>
      )}

      <ViewCustomerDrawer customer={viewingCustomer} onClose={() => setViewingCustomer(null)} />
      {editingCustomer ? <EditCustomerModal key={editingCustomer.uid} customer={editingCustomer} onClose={() => setEditingCustomer(null)} onSaved={(updatedCustomer) => {
        setCustomers((current) => current.map((item) => item.uid === updatedCustomer.uid ? { ...item, ...updatedCustomer } : item));
        setEditingCustomer(null);
      }} /> : null}
      <DeleteDialog customer={deleteTarget} busy={busyId === deleteTarget?.uid} onClose={() => setDeleteTarget(null)} onConfirm={() => void confirmDelete()} />
    </div>
  );
}

function CustomerToolbar({ search, setSearch, statusFilter, setStatusFilter, sort, setSort, refreshing, onRefresh }: {
  search: string;
  setSearch: (value: string) => void;
  statusFilter: CustomerStatusFilter;
  setStatusFilter: (value: CustomerStatusFilter) => void;
  sort: CustomerSort;
  setSort: (value: CustomerSort) => void;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  return (
    <div className="rounded-2xl border border-[#1E5631]/10 bg-white p-4 shadow-[0_8px_24px_rgba(23,53,34,0.05)]">
      <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px_auto]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#607065]" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, phone, customer ID" className="h-12 w-full rounded-xl border border-[#1E5631]/10 bg-[#F7FAF4] pl-11 pr-4 text-sm font-medium text-[#173522] outline-none transition focus:border-[#1E5631]" />
        </label>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as CustomerStatusFilter)} className="h-12 rounded-xl border border-[#1E5631]/10 bg-[#F7FAF4] px-4 text-sm font-bold text-[#173522] outline-none focus:border-[#1E5631]">
          <option value="all">All Customers</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
          <option value="verified">Verified</option>
          <option value="unverified">Unverified</option>
          <option value="with-orders">With Orders</option>
          <option value="without-orders">Without Orders</option>
        </select>
        <select value={sort} onChange={(event) => setSort(event.target.value as CustomerSort)} className="h-12 rounded-xl border border-[#1E5631]/10 bg-[#F7FAF4] px-4 text-sm font-bold text-[#173522] outline-none focus:border-[#1E5631]">
          <option value="newest">Date Joined: Newest</option>
          <option value="oldest">Date Joined: Oldest</option>
          <option value="highest-spending">Highest Spending</option>
          <option value="lowest-spending">Lowest Spending</option>
          <option value="alphabetical">Alphabetical</option>
        </select>
        <button onClick={onRefresh} disabled={refreshing} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#1E5631] px-5 text-sm font-bold text-white transition hover:bg-[#164427] disabled:cursor-not-allowed disabled:opacity-70">
          <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>
    </div>
  );
}

function CustomersTable({ customers, page, totalPages, totalCustomers, busyId, onPageChange, onView, onEdit, onToggleStatus, onDelete }: {
  customers: CustomerRow[];
  page: number;
  totalPages: number;
  totalCustomers: number;
  busyId: string | null;
  onPageChange: (page: number) => void;
  onView: (customer: CustomerRow) => void;
  onEdit: (customer: CustomerRow) => void;
  onToggleStatus: (customer: CustomerRow) => void;
  onDelete: (customer: CustomerRow) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#1E5631]/10 bg-white shadow-[0_8px_24px_rgba(23,53,34,0.05)]">
      <div className="overflow-x-auto">
        <table className="min-w-[1320px] w-full text-left">
          <thead className="bg-[#F3F7F1] text-xs font-bold uppercase tracking-[0.12em] text-[#607065]">
            <tr>
              {["Profile Photo", "Customer Name", "Customer ID", "Email", "Phone Number", "Joined Date", "Total Orders", "Wishlist Count", "Cart Items", "Total Spending", "Last Order", "Account Status", "Actions"].map((heading) => (
                <th key={heading} className="px-4 py-4">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E5631]/10">
            {customers.map((customer) => (
              <tr key={customer.uid} className="align-top transition hover:bg-[#FBFCF8]">
                <td className="px-4 py-4"><Avatar customer={customer} /></td>
                <td className="px-4 py-4"><p className="font-bold text-[#173522]">{customer.name || "Unnamed Customer"}</p><p className="mt-1 text-xs text-[#607065]">{customer.gender || "Gender not set"}</p></td>
                <td className="px-4 py-4 text-sm font-bold text-[#173522]">{getCustomerId(customer)}</td>
                <td className="px-4 py-4 text-sm text-[#607065]">{customer.email || "—"}</td>
                <td className="px-4 py-4 text-sm text-[#607065]">{customer.phone || "—"}</td>
                <td className="px-4 py-4 text-sm text-[#607065]">{formatDate(customer.createdAt)}</td>
                <td className="px-4 py-4 text-sm font-bold text-[#173522]">{customer.orderStats.totalOrders}</td>
                <td className="px-4 py-4 text-sm text-[#607065]">{getWishlistCount(customer)}</td>
                <td className="px-4 py-4 text-sm text-[#607065]">{getCartItemsCount(customer)}</td>
                <td className="px-4 py-4 text-sm font-bold text-[#173522]">{money(customer.orderStats.totalSpending)}</td>
                <td className="px-4 py-4 text-sm text-[#607065]">{customer.orderStats.lastOrder ? `${customer.orderStats.lastOrder.orderId} · ${formatDate(customer.orderStats.lastOrder.createdAt)}` : "—"}</td>
                <td className="px-4 py-4"><StatusBadge status={getStatus(customer)} /></td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <IconButton label="View customer" onClick={() => onView(customer)} icon={Eye} />
                    <IconButton label="Edit customer" onClick={() => onEdit(customer)} icon={Edit3} />
                    <IconButton label={getStatus(customer) === "blocked" ? "Enable customer" : "Disable customer"} onClick={() => onToggleStatus(customer)} icon={Ban} disabled={busyId === customer.uid} />
                    <IconButton label="Delete customer" onClick={() => onDelete(customer)} icon={Trash2} danger />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-3 border-t border-[#1E5631]/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-[#607065]">Showing {customers.length} of {totalCustomers} customers</p>
        <div className="flex items-center gap-2">
          <button onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="grid size-10 place-items-center rounded-xl border border-[#1E5631]/10 text-[#173522] hover:bg-[#EAF5E4] disabled:opacity-40" aria-label="Previous page"><ChevronLeft className="size-4" /></button>
          <span className="min-w-24 text-center text-sm font-bold text-[#173522]">Page {page} of {totalPages}</span>
          <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className="grid size-10 place-items-center rounded-xl border border-[#1E5631]/10 text-[#173522] hover:bg-[#EAF5E4] disabled:opacity-40" aria-label="Next page"><ChevronRight className="size-4" /></button>
        </div>
      </div>
    </div>
  );
}

function Avatar({ customer }: { customer: AdminCustomerProfile }) {
  if (customer.photoURL) {
    return <Image src={customer.photoURL} alt="" width={48} height={48} unoptimized className="size-12 rounded-xl object-cover" />;
  }

  return <div className="grid size-12 place-items-center rounded-xl bg-[#EAF5E4] text-sm font-black text-[#1E5631]">{initials(customer.name)}</div>;
}

function IconButton({ label, icon: Icon, onClick, disabled, danger }: { label: string; icon: LucideIcon; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} title={label} aria-label={label} className={`grid size-9 place-items-center rounded-xl border transition disabled:cursor-not-allowed disabled:opacity-45 ${danger ? "border-red-100 bg-red-50 text-red-600 hover:bg-red-100" : "border-[#1E5631]/10 bg-white text-[#1E5631] hover:bg-[#EAF5E4]"}`}>
      <Icon className="size-4" />
    </button>
  );
}

function StatusBadge({ status }: { status: "active" | "blocked" }) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{status === "active" ? "Active" : "Blocked"}</span>;
}

function ViewCustomerDrawer({ customer, onClose }: { customer: CustomerRow | null; onClose: () => void }) {
  if (!customer) return null;

  const defaultAddress = getDefaultAddress(customer);

  return (
    <div className="fixed inset-0 z-[90] bg-[#173522]/45 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="view-customer-title">
      <div className="ml-auto flex h-full w-full max-w-5xl flex-col overflow-hidden bg-[#F7FAF4] shadow-2xl">
        <div className="flex items-start justify-between border-b border-[#1E5631]/10 bg-white p-6">
          <div className="flex items-center gap-4">
            <Avatar customer={customer} />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#4F8A3F]">Customer profile</p>
              <h2 id="view-customer-title" className="mt-1 text-2xl font-bold text-[#173522]">{customer.name || "Unnamed Customer"}</h2>
              <p className="mt-1 text-sm text-[#607065]">{getCustomerId(customer)} · Joined {formatDate(customer.createdAt)}</p>
            </div>
          </div>
          <button onClick={onClose} className="grid size-10 place-items-center rounded-xl text-[#607065] hover:bg-[#EAF5E4] hover:text-[#1E5631]" aria-label="Close customer profile"><X className="size-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
            <Panel title="Profile" icon={UserCheck}>
              <InfoGrid items={[
                ["Name", customer.name || "—"],
                ["Customer ID", getCustomerId(customer)],
                ["Email", customer.email || "—"],
                ["Phone", customer.phone || "—"],
                ["Gender", customer.gender || "—"],
                ["Birthday", customer.dob || "Future ready"],
                ["Joined Date", formatDate(customer.createdAt)],
                ["Last Login", formatDate(customer.lastLogin)],
                ["Email Verification", customer.emailVerified ? "Verified" : "Unverified"],
                ["Account Status", getStatus(customer) === "active" ? "Active" : "Blocked"],
              ]} />
            </Panel>
            <Panel title="Address" icon={MapPin}>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#607065]">Default Address</p>
              <p className="mt-2 text-sm leading-6 text-[#173522]">{defaultAddress ? addressText(defaultAddress) : "No default address saved."}</p>
              <div className="mt-5 space-y-3">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#607065]">Saved Addresses</p>
                {getAddresses(customer).length ? getAddresses(customer).map((address) => (
                  <div key={address.id} className="rounded-xl border border-[#1E5631]/10 bg-[#F7FAF4] p-4 text-sm text-[#607065]">
                    <p className="font-bold text-[#173522]">{address.type}{address.isDefault ? " · Default" : ""}</p>
                    <p className="mt-1 leading-6">{addressText(address)}</p>
                  </div>
                )) : <p className="text-sm text-[#607065]">No saved addresses.</p>}
              </div>
            </Panel>
            <Panel title="Orders" icon={ShoppingBag}>
              <InfoGrid items={[
                ["Total Orders", String(customer.orderStats.totalOrders)],
                ["Completed", String(customer.orderStats.completed)],
                ["Pending", String(customer.orderStats.pending)],
                ["Cancelled", String(customer.orderStats.cancelled)],
                ["Returned", String(customer.orderStats.returned)],
                ["Total Spending", money(customer.orderStats.totalSpending)],
                ["Average Order Value", money(customer.orderStats.averageOrderValue)],
                ["Largest Order", money(customer.orderStats.largestOrder)],
              ]} />
            </Panel>
            <Panel title="Wishlist, Cart & Reviews" icon={Star}>
              <InfoGrid items={[
                ["Wishlist Products", String(getWishlistCount(customer))],
                ["Current Cart Items", String(getCartItemsCount(customer))],
                ["Reviews Posted", String(getReviewsCount(customer))],
                ["Ratings", "Future ready"],
                ["Reward Points", "Future ready"],
              ]} />
            </Panel>
            <Panel title="Activity Timeline" icon={CalendarDays}>
              <Timeline items={[
                ["Account Created", formatDate(customer.createdAt)],
                ["Last Order", customer.orderStats.lastOrder ? `${customer.orderStats.lastOrder.orderId} on ${formatDate(customer.orderStats.lastOrder.createdAt)}` : "No orders yet"],
                ["Reviews", `${getReviewsCount(customer)} posted`],
                ["Wishlist", `${getWishlistCount(customer)} products saved`],
                ["Profile Updates", formatDate(customer.updatedAt)],
              ]} />
            </Panel>
            <Panel title="Admin Notes" icon={MailCheck}>
              <p className="text-sm leading-6 text-[#607065]">{customer.adminNotes || "No admin notes added."}</p>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}

function Panel({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: ReactNode }) {
  return <section className="rounded-2xl border border-[#1E5631]/10 bg-white p-5 shadow-[0_8px_24px_rgba(23,53,34,0.04)]"><div className="mb-5 flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-[#EAF5E4] text-[#1E5631]"><Icon className="size-5" /></div><h3 className="text-lg font-bold text-[#173522]">{title}</h3></div>{children}</section>;
}

function InfoGrid({ items }: { items: [string, string][] }) {
  return <dl className="grid gap-4 sm:grid-cols-2">{items.map(([label, value]) => <div key={label}><dt className="text-xs font-bold uppercase tracking-[0.12em] text-[#607065]">{label}</dt><dd className="mt-1 text-sm font-semibold text-[#173522]">{value}</dd></div>)}</dl>;
}

function Timeline({ items }: { items: [string, string][] }) {
  return <div className="space-y-4">{items.map(([label, value]) => <div key={label} className="flex gap-3"><span className="mt-1 size-2 rounded-full bg-[#1E5631]" /><div><p className="text-sm font-bold text-[#173522]">{label}</p><p className="mt-1 text-sm text-[#607065]">{value}</p></div></div>)}</div>;
}

function EditCustomerModal({ customer, onClose, onSaved }: { customer: CustomerRow; onClose: () => void; onSaved: (customer: Partial<AdminCustomerProfile> & { uid: string }) => void }) {
  const [name, setName] = useState(customer.name || "");
  const [phone, setPhone] = useState(customer.phone || "");
  const [photoURL, setPhotoURL] = useState(customer.photoURL || "");
  const [status, setStatus] = useState<"active" | "blocked">(getStatus(customer));
  const [adminNotes, setAdminNotes] = useState(customer.adminNotes || "");
  const [defaultAddressId, setDefaultAddressId] = useState(getDefaultAddress(customer)?.id || "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    try {
      setSaving(true);
      const updates = { name: name.trim(), phone: phone.trim(), photoURL: photoURL.trim(), status, adminNotes: adminNotes.trim(), defaultAddressId };
      await updateAdminCustomer(customer.uid, updates);
      onSaved({ uid: customer.uid, ...updates });
      toast.success("Customer updated.");
    } catch (saveError) {
      console.error(saveError);
      toast.error("Unable to update customer.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-[#173522]/45 p-3 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="edit-customer-title">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-[#1E5631]/10 p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#4F8A3F]">Edit customer</p>
            <h2 id="edit-customer-title" className="mt-1 text-xl font-bold text-[#173522]">{customer.name}</h2>
            <p className="mt-1 text-sm text-[#607065]">Email and UID are locked.</p>
          </div>
          <button onClick={onClose} disabled={saving} className="grid size-10 place-items-center rounded-xl text-[#607065] hover:bg-[#EAF5E4] hover:text-[#1E5631]" aria-label="Close edit customer"><X className="size-5" /></button>
        </div>
        <div className="grid max-h-[70vh] gap-4 overflow-y-auto p-5 sm:grid-cols-2">
          <Field label="Name" value={name} onChange={setName} />
          <Field label="Phone" value={phone} onChange={setPhone} />
          <Field label="Profile Picture URL" value={photoURL} onChange={setPhotoURL} />
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#607065]">Status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value as "active" | "blocked")} className="mt-2 h-12 w-full rounded-xl border border-[#1E5631]/10 bg-[#F7FAF4] px-4 text-sm font-bold text-[#173522] outline-none focus:border-[#1E5631]">
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#607065]">Default Address</span>
            <select value={defaultAddressId} onChange={(event) => setDefaultAddressId(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-[#1E5631]/10 bg-[#F7FAF4] px-4 text-sm font-bold text-[#173522] outline-none focus:border-[#1E5631]">
              <option value="">No default address</option>
              {getAddresses(customer).map((address) => <option key={address.id} value={address.id}>{address.type} · {address.city} · {address.pincode}</option>)}
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#607065]">Admin Notes</span>
            <textarea value={adminNotes} onChange={(event) => setAdminNotes(event.target.value)} rows={4} className="mt-2 w-full rounded-xl border border-[#1E5631]/10 bg-[#F7FAF4] px-4 py-3 text-sm font-medium text-[#173522] outline-none focus:border-[#1E5631]" />
          </label>
          <div className="rounded-xl border border-[#1E5631]/10 bg-[#F7FAF4] p-4 sm:col-span-2">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#607065]">Locked Fields</p>
            <p className="mt-2 text-sm text-[#173522]">{customer.email || "No email"} · {customer.uid}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-[#1E5631]/10 p-5">
          <button onClick={onClose} disabled={saving} className="rounded-xl px-5 py-2.5 text-sm font-bold text-[#607065] hover:bg-[#F3F7F1]">Cancel</button>
          <button onClick={() => void handleSave()} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-[#1E5631] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#164427] disabled:cursor-not-allowed disabled:opacity-65">{saving ? <RefreshCw className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}{saving ? "Saving" : "Save Changes"}</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block"><span className="text-xs font-bold uppercase tracking-[0.12em] text-[#607065]">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-[#1E5631]/10 bg-[#F7FAF4] px-4 text-sm font-medium text-[#173522] outline-none focus:border-[#1E5631]" /></label>;
}

function CustomersSkeleton() {
  return <div className="space-y-6" aria-label="Loading customers"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <div key={index} className="h-36 animate-pulse rounded-2xl border border-[#1E5631]/10 bg-[#F3F7F1]" />)}</div><div className="h-20 animate-pulse rounded-2xl border border-[#1E5631]/10 bg-[#F3F7F1]" /><div className="h-[480px] animate-pulse rounded-2xl border border-[#1E5631]/10 bg-[#F3F7F1]" /></div>;
}

function EmptyState() {
  return <div className="rounded-2xl border border-dashed border-[#1E5631]/20 bg-white px-6 py-16 text-center shadow-sm"><div className="mx-auto grid size-20 place-items-center rounded-2xl bg-[#EAF5E4] text-[#1E5631]"><Users className="size-10" /></div><h2 className="mt-6 text-2xl font-bold text-[#173522]">No Customers Yet</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#607065]">Customer profiles will appear here after shoppers create accounts.</p></div>;
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div className="rounded-2xl border border-red-100 bg-white px-6 py-12 text-center shadow-sm"><div className="mx-auto grid size-14 place-items-center rounded-2xl bg-red-50 text-red-600"><XCircle className="size-7" /></div><h2 className="mt-5 text-xl font-bold text-[#173522]">Customers could not load</h2><p className="mt-2 text-sm text-[#607065]">{message}</p><button onClick={onRetry} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1E5631] px-5 py-3 text-sm font-bold text-white hover:bg-[#164427]"><RefreshCw className="size-4" />Try Again</button></div>;
}

function DeleteDialog({ customer, busy, onClose, onConfirm }: { customer: CustomerRow | null; busy: boolean; onClose: () => void; onConfirm: () => void }) {
  if (!customer) return null;

  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#173522]/45 p-3 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="delete-customer-title"><div className="w-full max-w-md rounded-2xl bg-white shadow-2xl"><div className="flex items-start justify-between border-b border-[#1E5631]/10 p-5"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-red-600">Confirm delete</p><h2 id="delete-customer-title" className="mt-1 text-xl font-bold text-[#173522]">Delete customer?</h2></div><button onClick={onClose} disabled={busy} className="grid size-10 place-items-center rounded-xl text-[#607065] hover:bg-[#EAF5E4] hover:text-[#1E5631]" aria-label="Close delete dialog"><X className="size-5" /></button></div><div className="p-5"><p className="text-sm leading-6 text-[#607065]">This will remove <span className="font-bold text-[#173522]">{customer.name || customer.email}</span> from Firestore. Orders are not modified.</p></div><div className="flex justify-end gap-3 border-t border-[#1E5631]/10 p-5"><button onClick={onClose} disabled={busy} className="rounded-xl px-5 py-2.5 text-sm font-bold text-[#607065] hover:bg-[#F3F7F1]">Cancel</button><button onClick={onConfirm} disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-65">{busy ? <RefreshCw className="size-4 animate-spin" /> : <Trash2 className="size-4" />}{busy ? "Deleting" : "Delete"}</button></div></div></div>;
}

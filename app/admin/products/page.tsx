"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Boxes, CircleAlert, Layers3, PackageCheck, PackagePlus, RefreshCw, Sparkles, Trash2, X, XCircle } from "lucide-react";
import { toast } from "sonner";

import AddProductModal from "./AddProductModal";
import EditProductModal from "./EditProductModal";
import ProductTable from "./ProductTable";
import ProductToolbar, { type ProductSort, type StockFilter } from "./ProductToolbar";
import ViewProductModal from "./ViewProductModal";
import { deleteProduct, getProducts, updateProduct } from "@/services/productService";
import type { Product } from "@/lib/product";

type StatCard = { label: string; value: number | string; icon: typeof Boxes; tone: string };
type ProductStats = { averagePrice: number; totalInventory: number; inventoryValue: number; topCategory: string };

const PRODUCTS_PER_PAGE = 10;
const LOCAL_DUPLICATE_PREFIX = "duplicate-";

function productDate(product: Product, key: "createdAt" | "updatedAt") {
  return product[key]?.toMillis?.() ?? (product.id.startsWith(LOCAL_DUPLICATE_PREFIX) ? Date.now() : 0);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value || 0);
}

function getProductStats(products: Product[]): ProductStats {
  const categoryCounts = products.reduce<Record<string, number>>((counts, product) => {
    const category = product.category?.trim();
    if (category) counts[category] = (counts[category] ?? 0) + 1;
    return counts;
  }, {});
  const topCategory = Object.entries(categoryCounts).sort((first, second) => second[1] - first[1])[0]?.[0] ?? "—";
  const totalInventory = products.reduce((total, product) => total + product.stock, 0);
  const inventoryValue = products.reduce((total, product) => total + product.stock * product.price, 0);
  const averagePrice = products.length ? products.reduce((total, product) => total + product.price, 0) / products.length : 0;

  return { averagePrice, totalInventory, inventoryValue, topCategory };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("");
  const [sort, setSort] = useState<ProductSort>("newest");
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadProducts = useCallback(async (mode: "initial" | "refresh" = "refresh") => {
    try {
      if (mode === "refresh") {
        setRefreshing(true);
        setError("");
      }
      setProducts(await getProducts());
      setError("");
    } catch (loadError) {
      console.error(loadError);
      setError("Unable to load products from Firestore.");
      toast.error("Unable to load products.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function loadInitialProducts() {
      try {
        const data = await getProducts();
        if (!active) return;
        setProducts(data);
        setError("");
      } catch (loadError) {
        if (!active) return;
        console.error(loadError);
        setError("Unable to load products from Firestore.");
        toast.error("Unable to load products.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadInitialProducts();
    return () => { active = false; };
  }, []);

  const dashboardStats = useMemo<StatCard[]>(() => {
    const active = products.filter((product) => product.active).length;
    const featured = products.filter((product) => product.featured).length;
    const lowStock = products.filter((product) => product.stock > 0 && product.stock <= product.lowStockLimit).length;
    const outOfStock = products.filter((product) => product.stock === 0).length;
    const categories = new Set(products.map((product) => product.category.trim()).filter(Boolean)).size;
    return [
      { label: "Total Products", value: products.length, icon: Boxes, tone: "bg-[#EAF5E4] text-[#1E5631]" },
      { label: "Active Products", value: active, icon: PackageCheck, tone: "bg-emerald-50 text-emerald-700" },
      { label: "Featured Products", value: featured, icon: Sparkles, tone: "bg-amber-50 text-amber-700" },
      { label: "Low Stock", value: lowStock, icon: CircleAlert, tone: "bg-orange-50 text-orange-700" },
      { label: "Out Of Stock", value: outOfStock, icon: XCircle, tone: "bg-red-50 text-red-700" },
      { label: "Categories", value: categories, icon: Layers3, tone: "bg-teal-50 text-teal-700" },
    ];
  }, [products]);

  const productStats = useMemo(() => getProductStats(products), [products]);
  const categories = useMemo(() => (
    Array.from(new Set(products.map((product) => product.category.trim()).filter(Boolean))).sort((first, second) => first.localeCompare(second))
  ), [products]);

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const filtered = products.filter((product) => {
      const matchesSearch = !keyword || [product.name, product.slug, product.sku, product.category].some((value) => (value || "").toLowerCase().includes(keyword));
      const matchesCategory = !category || product.category === category;
      const matchesStock = !stockFilter
        || (stockFilter === "instock" && product.stock > 0)
        || (stockFilter === "low" && product.stock > 0 && product.stock <= product.lowStockLimit)
        || (stockFilter === "out" && product.stock === 0);
      return matchesSearch && matchesCategory && matchesStock;
    });

    return filtered.sort((first, second) => {
      if (sort === "oldest") return productDate(first, "createdAt") - productDate(second, "createdAt");
      if (sort === "price-asc") return first.price - second.price;
      if (sort === "price-desc") return second.price - first.price;
      if (sort === "stock") return second.stock - first.stock;
      if (sort === "name") return first.name.localeCompare(second.name);
      return productDate(second, "createdAt") - productDate(first, "createdAt");
    });
  }, [category, products, search, sort, stockFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const paginatedProducts = useMemo(() => filteredProducts.slice((page - 1) * PRODUCTS_PER_PAGE, page * PRODUCTS_PER_PAGE), [filteredProducts, page]);

  const handleRefresh = useCallback(async () => {
    await loadProducts("refresh");
    toast.success("Products refreshed.");
  }, [loadProducts]);

  const handleDuplicate = useCallback((product: Product) => {
    const duplicate: Product = {
      ...product,
      id: `${LOCAL_DUPLICATE_PREFIX}${crypto.randomUUID()}`,
      name: `${product.name} Copy`,
      slug: `${product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-copy`,
      sku: product.sku ? `${product.sku}-COPY` : "",
      active: false,
      featured: false,
    };
    setProducts((current) => [duplicate, ...current]);
    toast.success("Product duplicated in this view.");
  }, []);

  const handleToggleActive = useCallback(async (product: Product) => {
    if (product.id.startsWith(LOCAL_DUPLICATE_PREFIX)) {
      setProducts((current) => current.map((item) => item.id === product.id ? { ...item, active: !item.active } : item));
      toast.success(product.active ? "Product disabled in this view." : "Product enabled in this view.");
      return;
    }

    try {
      setBusyId(product.id);
      await updateProduct(product.id, { active: !product.active });
      setProducts((current) => current.map((item) => item.id === product.id ? { ...item, active: !item.active } : item));
      toast.success(product.active ? "Product disabled." : "Product enabled.");
    } catch (toggleError) {
      console.error(toggleError);
      toast.error("Unable to update product status.");
    } finally {
      setBusyId(null);
    }
  }, []);

  const handleToggleFeatured = useCallback(async (product: Product) => {
    if (product.id.startsWith(LOCAL_DUPLICATE_PREFIX)) {
      setProducts((current) => current.map((item) => item.id === product.id ? { ...item, featured: !item.featured } : item));
      toast.success(product.featured ? "Removed from featured in this view." : "Product featured in this view.");
      return;
    }

    try {
      setBusyId(product.id);
      await updateProduct(product.id, { featured: !product.featured });
      setProducts((current) => current.map((item) => item.id === product.id ? { ...item, featured: !item.featured } : item));
      toast.success(product.featured ? "Removed from featured." : "Product featured.");
    } catch (toggleError) {
      console.error(toggleError);
      toast.error("Unable to update featured status.");
    } finally {
      setBusyId(null);
    }
  }, []);

  async function confirmDelete() {
    if (!deleteTarget) return;
    if (deleteTarget.id.startsWith(LOCAL_DUPLICATE_PREFIX)) {
      setProducts((current) => current.filter((item) => item.id !== deleteTarget.id));
      toast.success("Local duplicate removed.");
      setDeleteTarget(null);
      return;
    }

    try {
      setBusyId(deleteTarget.id);
      await deleteProduct(deleteTarget.id);
      setProducts((current) => current.filter((item) => item.id !== deleteTarget.id));
      toast.success("Product deleted.");
      setDeleteTarget(null);
    } catch (deleteError) {
      console.error(deleteError);
      toast.error("Unable to delete product.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#4F8A3F]">Catalogue management</p>
          <h1 className="mt-1 text-3xl font-bold text-[#173522]">Products</h1>
          <p className="mt-2 text-sm text-[#607065]">Manage your herbal product catalogue, inventory, and storefront visibility.</p>
        </div>
      </div>

      {loading ? (
        <ProductsSkeleton />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
            {dashboardStats.map(({ label, value, icon: Icon, tone }) => (
              <div key={label} className="rounded-2xl border border-[#1E5631]/10 bg-white p-5 shadow-[0_8px_24px_rgba(23,53,34,0.06)]">
                <div className={`grid size-11 place-items-center rounded-xl ${tone}`}><Icon className="size-5" /></div>
                <p className="mt-5 text-3xl font-bold text-[#173522]">{value}</p>
                <p className="mt-1 text-sm font-medium text-[#607065]">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <MetricCard label="Average Price" value={formatCurrency(productStats.averagePrice)} />
            <MetricCard label="Total Inventory" value={productStats.totalInventory.toLocaleString("en-IN")} />
            <MetricCard label="Inventory Value" value={formatCurrency(productStats.inventoryValue)} />
            <MetricCard label="Top Category" value={productStats.topCategory} />
          </div>

          <ProductToolbar
            search={search}
            setSearch={(value) => { setSearch(value); setPage(1); }}
            category={category}
            setCategory={(value) => { setCategory(value); setPage(1); }}
            categories={categories}
            stockFilter={stockFilter}
            setStockFilter={(value) => { setStockFilter(value as StockFilter); setPage(1); }}
            sort={sort}
            setSort={(value) => { setSort(value); setPage(1); }}
            onRefresh={() => void handleRefresh()}
            onAdd={() => setAddOpen(true)}
            refreshing={refreshing}
            disabled={Boolean(busyId)}
          />

          {error ? <ErrorState message={error} onRetry={() => void handleRefresh()} /> : products.length === 0 ? <EmptyState onAdd={() => setAddOpen(true)} /> : (
            <>
              {busyId && <p className="-mt-4 text-sm font-medium text-[#1E5631]" role="status">Updating product...</p>}
              <ProductTable
                products={paginatedProducts}
                page={page}
                totalPages={totalPages}
                totalProducts={filteredProducts.length}
                onPageChange={(nextPage) => setPage(Math.min(Math.max(1, nextPage), totalPages))}
                onView={setViewingProduct}
                onEdit={setEditingProduct}
                onDuplicate={handleDuplicate}
                onToggleActive={(product) => void handleToggleActive(product)}
                onToggleFeatured={(product) => void handleToggleFeatured(product)}
                onDelete={setDeleteTarget}
              />
            </>
          )}
        </>
      )}

      <AddProductModal open={addOpen} onClose={() => setAddOpen(false)} onSaved={() => void loadProducts("refresh")} />
      <EditProductModal product={editingProduct} onClose={() => setEditingProduct(null)} onSaved={() => void loadProducts("refresh")} />
      <ViewProductModal product={viewingProduct} onClose={() => setViewingProduct(null)} />
      <DeleteDialog product={deleteTarget} busy={busyId === deleteTarget?.id} onClose={() => setDeleteTarget(null)} onConfirm={() => void confirmDelete()} />
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-[#1E5631]/10 bg-white p-5 shadow-[0_8px_24px_rgba(23,53,34,0.04)]"><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#607065]">{label}</p><p className="mt-2 text-lg font-bold text-[#173522]">{value}</p></div>;
}

function ProductsSkeleton() {
  return <div className="space-y-6" aria-label="Loading products"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-36 animate-pulse rounded-2xl border border-[#1E5631]/10 bg-[#F3F7F1]" />)}</div><div className="h-24 animate-pulse rounded-2xl border border-[#1E5631]/10 bg-[#F3F7F1]" /><div className="h-[420px] animate-pulse rounded-2xl border border-[#1E5631]/10 bg-[#F3F7F1]" /></div>;
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return <div className="rounded-2xl border border-dashed border-[#1E5631]/20 bg-white px-6 py-16 text-center shadow-sm"><div className="mx-auto grid size-20 place-items-center rounded-2xl bg-[#EAF5E4] text-[#1E5631]"><PackagePlus className="size-10" /></div><h2 className="mt-6 text-2xl font-bold text-[#173522]">No Products Yet</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#607065]">Start building your herbal catalogue by adding your first product.</p><button onClick={onAdd} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1E5631] px-5 py-3 text-sm font-bold text-white hover:bg-[#164427]"><PackagePlus className="size-4" />Add Product</button></div>;
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div className="rounded-2xl border border-red-100 bg-white px-6 py-12 text-center shadow-sm"><div className="mx-auto grid size-14 place-items-center rounded-2xl bg-red-50 text-red-600"><XCircle className="size-7" /></div><h2 className="mt-5 text-xl font-bold text-[#173522]">Products could not load</h2><p className="mt-2 text-sm text-[#607065]">{message}</p><button onClick={onRetry} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1E5631] px-5 py-3 text-sm font-bold text-white hover:bg-[#164427]"><RefreshCw className="size-4" />Try Again</button></div>;
}

function DeleteDialog({ product, busy, onClose, onConfirm }: { product: Product | null; busy: boolean; onClose: () => void; onConfirm: () => void }) {
  if (!product) return null;

  return <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#173522]/45 p-3 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="delete-product-title"><div className="w-full max-w-md rounded-2xl bg-white shadow-2xl"><div className="flex items-start justify-between border-b border-[#1E5631]/10 p-5"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-red-600">Confirm delete</p><h2 id="delete-product-title" className="mt-1 text-xl font-bold text-[#173522]">Delete product?</h2></div><button onClick={onClose} disabled={busy} className="grid size-10 place-items-center rounded-xl text-[#607065] hover:bg-[#EAF5E4] hover:text-[#1E5631]" aria-label="Close delete dialog"><X className="size-5" /></button></div><div className="p-5"><p className="text-sm leading-6 text-[#607065]">This will remove <span className="font-bold text-[#173522]">{product.name}</span> from Firestore. This action cannot be undone.</p></div><div className="flex justify-end gap-3 border-t border-[#1E5631]/10 p-5"><button onClick={onClose} disabled={busy} className="rounded-xl px-5 py-2.5 text-sm font-bold text-[#607065] hover:bg-[#F3F7F1]">Cancel</button><button onClick={onConfirm} disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-65">{busy ? <RefreshCw className="size-4 animate-spin" /> : <Trash2 className="size-4" />}{busy ? "Deleting" : "Delete"}</button></div></div></div>;
}

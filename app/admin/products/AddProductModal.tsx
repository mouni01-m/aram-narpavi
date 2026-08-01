"use client";
/* eslint-disable @next/next/no-img-element */

import { useMemo, useState, type FormEvent } from "react";
import { Check, LoaderCircle, Plus, Trash2, X } from "lucide-react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { toast } from "sonner";

import ImageUploader from "./ImageUploader";
import { PRODUCT_CATEGORIES, type Product, type ProductFormData, type ProductImage } from "@/lib/product";
import { storage } from "@/lib/firebase";
import { addProduct, updateProduct } from "@/services/productService";

type ExtendedProduct = Product & { shortDescription?: string; storageInstructions?: string[] };
type FormState = ProductFormData & { shortDescription: string; storageInstructions: string[] };

type ProductFormModalProps = {
  product?: Product | null;
  onClose: () => void;
  onSaved: () => void;
};

const inputClass = "mt-1.5 w-full rounded-xl border border-[#1E5631]/15 bg-white px-3.5 py-2.5 text-sm text-[#173522] outline-none transition placeholder:text-[#607065]/55 focus:border-[#1E5631] focus:ring-4 focus:ring-[#4F8A3F]/10";
const sectionClass = "rounded-2xl border border-[#1E5631]/10 bg-[#FCFDFC] p-5 sm:p-6";

function emptyForm(): FormState {
  return { name: "", slug: "", category: "", description: "", shortDescription: "", images: [], price: 0, mrp: 0, discount: 0, stock: 0, lowStockLimit: 5, weight: "", sku: "", ingredients: [], benefits: [], usage: "", usageInstructions: [], storageInstructions: [], active: true, featured: false, bestseller: false, metaTitle: "", metaDescription: "", seo: {} };
}

function formFromProduct(product?: Product | null): FormState {
  const existing = product as ExtendedProduct | null;
  return existing ? { name: existing.name, slug: existing.slug, category: existing.category, description: existing.description, shortDescription: existing.shortDescription ?? "", images: existing.images, price: existing.price, mrp: existing.mrp, discount: existing.discount, stock: existing.stock, lowStockLimit: existing.lowStockLimit, weight: existing.weight, sku: existing.sku, ingredients: existing.ingredients, benefits: existing.benefits, usage: existing.usageInstructions.length > 0 ? existing.usageInstructions.join("\n") : existing.usage, usageInstructions: existing.usageInstructions, storageInstructions: existing.storageInstructions ?? [], active: existing.active, featured: existing.featured, bestseller: existing.bestseller, metaTitle: existing.metaTitle ?? "", metaDescription: existing.metaDescription ?? "", seo: existing.seo } : emptyForm();
}

function slugify(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
function discountFrom(mrp: number, price: number) { return mrp > 0 && price >= 0 ? Math.max(0, Math.round(((mrp - price) / mrp) * 100)) : 0; }

function ListField({ label, value, onChange, helper }: { label: string; value: string[]; onChange: (value: string[]) => void; helper?: string }) {
  const [entry, setEntry] = useState("");
  function addEntry() { const trimmed = entry.trim(); if (!trimmed || value.includes(trimmed)) return; onChange([...value, trimmed]); setEntry(""); }
  return <div><label className="text-sm font-bold text-[#173522]">{label}</label>{helper && <p className="mt-1 text-xs text-[#607065]">{helper}</p>}<div className="mt-2 flex gap-2"><input value={entry} onChange={(event) => setEntry(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addEntry(); } }} className={inputClass.replace("mt-1.5 ", "")} placeholder={`Add ${label.toLowerCase()}`} /><button type="button" onClick={addEntry} className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#EAF5E4] text-[#1E5631] hover:bg-[#D7ECD2]" aria-label={`Add ${label}`}><Plus className="size-5" /></button></div>{value.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{value.map((item) => <span key={item} className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[#173522] shadow-sm ring-1 ring-[#1E5631]/10">{item}<button type="button" onClick={() => onChange(value.filter((valueItem) => valueItem !== item))} className="text-[#607065] hover:text-red-600" aria-label={`Remove ${item}`}><X className="size-3.5" /></button></span>)}</div>}</div>;
}

export function ProductFormModal({ product, onClose, onSaved }: ProductFormModalProps) {
  const [form, setForm] = useState<FormState>(() => formFromProduct(product));
  const [newImages, setNewImages] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const isEditing = Boolean(product);

  const calculatedDiscount = useMemo(() => discountFrom(form.mrp, form.price), [form.mrp, form.price]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) { setForm((current) => ({ ...current, [key]: value })); }
  function updatePrice(key: "mrp" | "price", rawValue: string) { const value = Number(rawValue); const next = { ...form, [key]: Number.isFinite(value) ? value : 0 }; setForm({ ...next, discount: discountFrom(next.mrp, next.price) }); }
  function removeExistingImage(index: number) { update("images", form.images.filter((_, imageIndex) => imageIndex !== index)); }

  async function uploadNewImages(productId: string): Promise<ProductImage[]> {
    return Promise.all(newImages.map(async (file, index) => {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const imageRef = ref(storage, `products/${productId}/${Date.now()}-${index}-${safeName}`);
      await uploadBytes(imageRef, file);
      return { url: await getDownloadURL(imageRef), alt: form.name };
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim() || !form.category || form.price <= 0 || form.stock < 0 || form.images.length + newImages.length === 0) { toast.error("Please complete the required product information."); return; }
    try {
      setSaving(true);
      const productId = product?.id ?? slugify(form.slug || form.name);
      if (!productId) { toast.error("A valid product name or slug is required."); return; }
      const uploadedImages = await uploadNewImages(productId);
      const usageInstructions = form.usage.split("\n").map((item) => item.trim()).filter(Boolean);
      const payload: Omit<Product, "id"> & Pick<FormState, "shortDescription" | "storageInstructions"> = { ...form, name: form.name.trim(), slug: productId, images: [...form.images, ...uploadedImages], discount: calculatedDiscount, ingredients: form.ingredients, benefits: form.benefits, usage: form.usage.trim(), usageInstructions, rating: product?.rating ?? { average: 0, count: 0 }, shortDescription: form.shortDescription.trim(), storageInstructions: form.storageInstructions, seo: product?.seo ?? {} };
      if (product) await updateProduct(product.id, payload);
      else await addProduct(payload, productId);
      toast.success(product ? "Product updated." : "Product created.");
      onSaved();
      onClose();
    } catch (error) { console.error(error); toast.error(product ? "Unable to update product." : "Unable to create product."); }
    finally { setSaving(false); }
  }

  return <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#173522]/45 p-3 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="product-modal-title"><form onSubmit={handleSubmit} className="flex h-[90vh] w-[90vw] max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"><header className="flex items-center justify-between border-b border-[#1E5631]/10 px-5 py-4 sm:px-7"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#4F8A3F]">Catalogue</p><h2 id="product-modal-title" className="mt-1 text-xl font-bold text-[#173522]">{isEditing ? "Edit Product" : "Add Product"}</h2></div><button type="button" onClick={onClose} disabled={saving} className="grid size-10 place-items-center rounded-xl text-[#607065] hover:bg-[#EAF5E4] hover:text-[#1E5631]" aria-label="Close product modal"><X className="size-5" /></button></header>
    <div className="flex-1 overflow-y-auto p-5 sm:p-7"><div className="grid gap-5"><section className={sectionClass}><h3 className="text-base font-bold text-[#173522]">Basic Information</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="text-sm font-bold text-[#173522]">Product Name <span className="text-red-600">*</span><input required value={form.name} onChange={(event) => { update("name", event.target.value); if (!form.slug) update("slug", slugify(event.target.value)); }} className={inputClass} /></label><label className="text-sm font-bold text-[#173522]">Slug<input value={form.slug} onChange={(event) => update("slug", slugify(event.target.value))} className={inputClass} /></label><label className="text-sm font-bold text-[#173522]">Category <span className="text-red-600">*</span><select required value={form.category} onChange={(event) => update("category", event.target.value)} className={inputClass}><option value="">Select category</option>{PRODUCT_CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label className="text-sm font-bold text-[#173522]">Short Description<input value={form.shortDescription} onChange={(event) => update("shortDescription", event.target.value)} className={inputClass} /></label></div><label className="mt-4 block text-sm font-bold text-[#173522]">Long Description<textarea value={form.description} onChange={(event) => update("description", event.target.value)} className={`${inputClass} min-h-28 resize-y`} /></label></section>
      <section className={sectionClass}><h3 className="text-base font-bold text-[#173522]">Pricing</h3><div className="mt-4 grid gap-4 md:grid-cols-3"><label className="text-sm font-bold text-[#173522]">MRP<input min="0" type="number" value={form.mrp || ""} onChange={(event) => updatePrice("mrp", event.target.value)} className={inputClass} /></label><label className="text-sm font-bold text-[#173522]">Selling Price <span className="text-red-600">*</span><input required min="0" type="number" value={form.price || ""} onChange={(event) => updatePrice("price", event.target.value)} className={inputClass} /></label><div><p className="text-sm font-bold text-[#173522]">Discount</p><div className="mt-1.5 flex h-11 items-center rounded-xl border border-[#1E5631]/10 bg-[#EAF5E4] px-3.5 font-bold text-[#1E5631]">{calculatedDiscount}%</div></div></div></section>
      <section className={sectionClass}><h3 className="text-base font-bold text-[#173522]">Inventory</h3><div className="mt-4 grid gap-4 md:grid-cols-4"><label className="text-sm font-bold text-[#173522]">Stock <span className="text-red-600">*</span><input required min="0" type="number" value={form.stock} onChange={(event) => update("stock", Math.max(0, Number(event.target.value)))} className={inputClass} /></label><label className="text-sm font-bold text-[#173522]">Low Stock Alert<input min="0" type="number" value={form.lowStockLimit} onChange={(event) => update("lowStockLimit", Math.max(0, Number(event.target.value)))} className={inputClass} /></label><label className="text-sm font-bold text-[#173522]">SKU<input value={form.sku} onChange={(event) => update("sku", event.target.value)} className={inputClass} /></label><label className="text-sm font-bold text-[#173522]">Weight<input value={form.weight} onChange={(event) => update("weight", event.target.value)} className={inputClass} /></label></div></section>
      <section className={sectionClass}><h3 className="text-base font-bold text-[#173522]">Images <span className="text-red-600">*</span></h3>{form.images.length > 0 && <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">{form.images.map((image, index) => <div key={image.url} className="relative overflow-hidden rounded-xl border border-[#1E5631]/10 bg-white"><img src={image.url} alt={image.alt || form.name} className="h-28 w-full object-cover" /><button type="button" onClick={() => removeExistingImage(index)} className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-red-600 text-white" aria-label="Remove image"><Trash2 className="size-3.5" /></button></div>)}</div>}<div className="mt-4"><ImageUploader images={newImages} setImages={setNewImages} /></div></section>
      <section className={sectionClass}><h3 className="text-base font-bold text-[#173522]">Product Details</h3><div className="mt-4 grid gap-5 md:grid-cols-2"><ListField label="Ingredients" value={form.ingredients} onChange={(value) => update("ingredients", value)} /><ListField label="Benefits" value={form.benefits} onChange={(value) => update("benefits", value)} /><label className="text-sm font-bold text-[#173522]">Usage Instructions<textarea value={form.usage} onChange={(event) => update("usage", event.target.value)} className={`${inputClass} min-h-32 resize-y`} placeholder="One instruction per line" /><span className="mt-1 block text-xs font-normal text-[#607065]">Each line becomes one instruction.</span></label><ListField label="Storage Instructions" value={form.storageInstructions} onChange={(value) => update("storageInstructions", value)} /></div></section>
      <section className={sectionClass}><h3 className="text-base font-bold text-[#173522]">SEO</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="text-sm font-bold text-[#173522]">Meta Title<input value={form.metaTitle ?? ""} onChange={(event) => update("metaTitle", event.target.value)} className={inputClass} /></label><label className="text-sm font-bold text-[#173522]">Meta Description<textarea value={form.metaDescription ?? ""} onChange={(event) => update("metaDescription", event.target.value)} className={`${inputClass} min-h-24 resize-y`} /></label></div></section>
      <section className={sectionClass}><h3 className="text-base font-bold text-[#173522]">Options</h3><div className="mt-4 flex flex-wrap gap-3">{([ ["featured", "Featured"], ["bestseller", "Best Seller"], ["active", "Active Product"] ] as const).map(([key, label]) => <label key={key} className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#1E5631]/10 bg-white px-4 py-3 text-sm font-semibold text-[#173522]"><input type="checkbox" checked={form[key]} onChange={(event) => update(key, event.target.checked)} className="size-4 accent-[#1E5631]" />{label}</label>)}</div></section></div></div>
    <footer className="flex items-center justify-end gap-3 border-t border-[#1E5631]/10 bg-white px-5 py-4 sm:px-7"><button type="button" onClick={onClose} disabled={saving} className="rounded-xl px-5 py-2.5 text-sm font-bold text-[#607065] hover:bg-[#F3F7F1]">Cancel</button><button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-[#1E5631] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#174526] disabled:cursor-not-allowed disabled:opacity-65">{saving ? <LoaderCircle className="size-4 animate-spin" /> : <Check className="size-4" />}{saving ? "Saving…" : isEditing ? "Save Changes" : "Save Product"}</button></footer>
  </form></div>;
}

export default function AddProductModal({ open, onClose, onSaved }: Omit<ProductFormModalProps, "product"> & { open: boolean }) { return open ? <ProductFormModal onClose={onClose} onSaved={onSaved} /> : null; }

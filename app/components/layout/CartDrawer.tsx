'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { items, removeFromCart, updateQuantity, getTotalPrice } = useCartStore();
  return (
    <>
      <button aria-label="Close cart" onClick={onClose} className={`fixed inset-0 z-40 bg-[#102d1b]/45 backdrop-blur-sm transition ${isOpen ? 'visible opacity-100' : 'invisible opacity-0'}`} />
      <aside className={`fixed right-0 top-0 z-50 flex h-dvh w-full max-w-md flex-col bg-[#F8F7F2] shadow-2xl transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`} aria-hidden={!isOpen}>
        <div className="flex items-center justify-between border-b border-[#1E5631]/10 px-6 py-5">
          <div><p className="eyebrow">Your selection</p><h2 className="mt-1 text-2xl font-bold text-[#1E5631]">Shopping bag</h2></div>
          <button onClick={onClose} className="grid size-10 place-items-center rounded-full bg-white text-[#1E5631]" aria-label="Close cart"><X className="size-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center"><span className="grid size-16 place-items-center rounded-full bg-[#EAF5E4]"><ShoppingBag className="size-7 text-[#4F8A3F]" /></span><h3 className="mt-5 text-2xl font-bold text-[#1E5631]">Your bag is empty</h3><p className="mt-2 max-w-xs text-sm text-[#607065]">Choose a herbal essential and it will appear here.</p><Link href="/#products" onClick={onClose} className="mt-6 rounded-full bg-[#1E5631] px-6 py-3 text-sm font-bold text-white">Explore products</Link></div>
          ) : (
            <div className="space-y-4">{items.map((item) => (
              <div key={item.id} className="flex gap-4 rounded-2xl border border-[#1E5631]/10 bg-white p-3">
                <Link href={`/product/${item.slug}`} onClick={onClose} className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-[#EAF5E4]"><Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" /></Link>
                <div className="min-w-0 flex-1"><Link href={`/product/${item.slug}`} onClick={onClose} className="font-display text-lg font-bold text-[#1E5631]">{item.name}</Link><p className="mt-1 text-sm font-bold text-[#4F8A3F]">₹{item.price}</p><div className="mt-3 flex items-center gap-2"><button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="grid size-7 place-items-center rounded-full bg-[#F8F7F2]" aria-label="Decrease quantity"><Minus className="size-3.5" /></button><span className="w-5 text-center text-sm font-bold">{item.quantity}</span><button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="grid size-7 place-items-center rounded-full bg-[#F8F7F2]" aria-label="Increase quantity"><Plus className="size-3.5" /></button><button onClick={() => removeFromCart(item.id)} className="ml-auto text-[#9b4a39]" aria-label={`Remove ${item.name}`}><Trash2 className="size-4" /></button></div></div>
              </div>
            ))}</div>
          )}
        </div>
        {items.length > 0 && <div className="border-t border-[#1E5631]/10 bg-white p-6"><div className="mb-4 flex items-center justify-between"><span className="text-sm text-[#607065]">Subtotal</span><strong className="font-display text-2xl text-[#1E5631]">₹{getTotalPrice()}</strong></div><button className="w-full rounded-full bg-[#1E5631] py-3.5 font-bold text-white">Proceed to checkout</button><p className="mt-3 text-center text-xs text-[#718076]">Taxes and delivery calculated at checkout</p></div>}
      </aside>
    </>
  );
}

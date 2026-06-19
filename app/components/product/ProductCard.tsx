'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '@/types/product';
import { useCartStore } from '@/store/cartStore';
import { Rating } from '@/app/components/ui/Rating';

export function ProductCard({ product }: { product: Product }) {
  const addToCart = useCartStore((state) => state.addToCart);
  return (
    <motion.article whileHover={{ y: -6 }} transition={{ duration: .25 }} className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-[#1E5631]/10 bg-white shadow-[0_12px_35px_rgba(30,86,49,.06)]">
      <Link href={`/product/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-[#EAF5E4]">
        <Image src={product.image} alt={product.name} fill sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
        {product.isBestseller && <span className="absolute left-4 top-4 rounded-full bg-[#E69500] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-white">Bestseller</span>}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-start justify-between gap-3"><Link href={`/product/${product.slug}`} className="font-display text-xl font-bold text-[#1E5631] hover:text-[#4F8A3F]">{product.name}</Link><span className="shrink-0 font-display text-xl font-bold text-[#1E5631]">₹{product.price}</span></div>
        <Rating rating={product.rating} reviews={product.reviews} size="sm" />
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#607065]">{product.description}</p>
        <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
          <Link href={`/product/${product.slug}`} className="inline-flex items-center justify-center gap-1 rounded-full border border-[#1E5631] px-3 py-2.5 text-sm font-bold text-[#1E5631] transition hover:bg-[#EAF5E4]">Details <ArrowUpRight className="size-4" /></Link>
          <button onClick={() => addToCart(product)} className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#1E5631] px-3 py-2.5 text-sm font-bold text-white transition hover:bg-[#174526]" aria-label={`Add ${product.name} to cart`}><ShoppingBag className="size-4" /> Add</button>
        </div>
      </div>
    </motion.article>
  );
}

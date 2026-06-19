'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check, ChevronRight, Leaf, Minus, Plus, ShieldCheck, ShoppingBag, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '@/types/product';
import { useCartStore } from '@/store/cartStore';
import { Container } from '@/app/components/ui/Container';
import { ProductCard } from './ProductCard';
import { Rating } from '@/app/components/ui/Rating';
import { testimonials } from '@/data/testimonials';

export function ProductDetails({ product, related }: { product: Product; related: Product[] }) {
  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addToCart = useCartStore((state) => state.addToCart);

  function add(openCart = false) {
    addToCart(product, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2200);
    if (openCart) window.dispatchEvent(new Event('open-cart'));
  }

  return <div className="bg-[#F8F7F2]">
    <Container><nav className="flex items-center gap-2 py-5 text-xs font-semibold text-[#6a786f]" aria-label="Breadcrumb"><Link href="/" className="hover:text-[#1E5631]">Home</Link><ChevronRight className="size-3" /><Link href="/#products" className="hover:text-[#1E5631]">Products</Link><ChevronRight className="size-3" /><span className="text-[#1E5631]">{product.name}</span></nav></Container>
    <section className="pb-20"><Container><div className="grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
      <motion.div initial={{opacity:0,x:-18}} animate={{opacity:1,x:0}} className="min-w-0"><div className="relative aspect-square overflow-hidden rounded-[2rem] border border-[#1E5631]/10 bg-white"><Image src={selectedImage} alt={`${product.name} selected view`} fill priority sizes="(max-width: 1023px) 100vw, 52vw" className="object-contain" /></div><div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">{product.images.map((image,index) => <button key={image} onClick={() => setSelectedImage(image)} aria-label={`View ${product.name} image ${index+1}`} className={`relative aspect-square overflow-hidden rounded-xl border-2 bg-white transition ${selectedImage === image ? 'border-[#1E5631]' : 'border-transparent hover:border-[#4F8A3F]/40'}`}><Image src={image} alt={`${product.name} thumbnail ${index+1}`} fill sizes="120px" className="object-cover" /></button>)}</div></motion.div>
      <motion.div initial={{opacity:0,x:18}} animate={{opacity:1,x:0}} className="lg:pt-3"><p className="eyebrow">{product.category.replace(/s$/, '')} collection</p><h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-[#1E5631] sm:text-5xl">{product.name}</h1><div className="mt-4 flex items-center gap-4"><Rating rating={product.rating} reviews={product.reviews} /><span className="rounded-full bg-[#EAF5E4] px-3 py-1 text-xs font-bold text-[#1E5631]">In stock</span></div><p className="mt-6 font-display text-3xl font-bold text-[#1E5631]">₹{product.price}</p><p className="mt-5 border-b border-[#1E5631]/10 pb-6 leading-7 text-[#596b5f]">{product.description}.</p>
        <div className="grid gap-5 py-6 sm:grid-cols-2"><div><h2 className="text-lg font-bold text-[#1E5631]">Benefits</h2><ul className="mt-3 space-y-2">{product.benefits.map(item => <li key={item} className="flex items-center gap-2 text-sm text-[#56685c]"><Check className="size-4 text-[#4F8A3F]" />{item}</li>)}</ul></div><div><h2 className="text-lg font-bold text-[#1E5631]">Ingredients</h2><p className="mt-3 text-sm leading-6 text-[#56685c]">{product.ingredients.join(', ')}.</p></div></div>
        <div className="rounded-2xl bg-[#EAF5E4] p-5"><h2 className="flex items-center gap-2 text-lg font-bold text-[#1E5631]"><Leaf className="size-5" />How to use</h2><p className="mt-2 text-sm leading-6 text-[#526359]">{product.usage}</p></div>
        <div className="mt-6 flex items-center gap-3"><span className="text-sm font-bold text-[#1E5631]">Quantity</span><div className="flex items-center rounded-full border border-[#1E5631]/15 bg-white p-1"><button onClick={() => setQuantity(q => Math.max(1,q-1))} className="grid size-9 place-items-center rounded-full hover:bg-[#EAF5E4]" aria-label="Decrease quantity"><Minus className="size-4" /></button><span className="w-10 text-center font-bold">{quantity}</span><button onClick={() => setQuantity(q => q+1)} className="grid size-9 place-items-center rounded-full hover:bg-[#EAF5E4]" aria-label="Increase quantity"><Plus className="size-4" /></button></div>{added && <span role="status" className="text-sm font-bold text-[#4F8A3F]">Added to cart</span>}</div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2"><button onClick={() => add(false)} className="inline-flex items-center justify-center gap-2 rounded-full border border-[#1E5631] px-6 py-3.5 font-bold text-[#1E5631] transition hover:bg-[#EAF5E4]"><ShoppingBag className="size-4" />Add to cart</button><button onClick={() => add(true)} className="rounded-full bg-[#1E5631] px-6 py-3.5 font-bold text-white transition hover:bg-[#174526]">Buy now</button></div>
        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-[#1E5631]/10 pt-6 text-xs font-semibold text-[#607065]"><span className="flex items-center gap-2"><Truck className="size-4 text-[#4F8A3F]" />Fast delivery across India</span><span className="flex items-center gap-2"><ShieldCheck className="size-4 text-[#4F8A3F]" />Quality checked</span></div>
      </motion.div>
    </div></Container></section>
    <section className="bg-white py-20"><Container><p className="eyebrow">Every angle</p><h2 className="section-title mt-3">Product gallery</h2><div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3">{product.images.map((image,index) => <button onClick={() => {setSelectedImage(image); window.scrollTo({top:0,behavior:'smooth'});}} key={image} className={`relative overflow-hidden rounded-2xl bg-[#F8F7F2] ${index === 0 ? 'col-span-2 aspect-[2/1] lg:col-span-2' : 'aspect-square'}`}><Image src={image} alt={`${product.name} gallery image ${index+1}`} fill sizes="(max-width: 767px) 50vw, 33vw" className="object-cover transition-transform duration-500 hover:scale-105" /></button>)}</div></Container></section>
    <section className="bg-[#EAF5E4] py-20"><Container><div className="text-center"><p className="eyebrow">Customer reviews</p><h2 className="section-title mt-3">Trusted in daily routines.</h2></div><div className="mx-auto mt-9 grid max-w-5xl gap-5 md:grid-cols-3">{testimonials.filter(item => ['1','3','4'].includes(item.id)).map((review) => <figure key={review.id} className="rounded-2xl bg-white p-6"><Rating rating={review.rating} size="sm" /><blockquote className="mt-4 text-sm leading-6 text-[#56685c]">“{review.content}”</blockquote><figcaption className="mt-5 font-display font-bold text-[#1E5631]">{review.author}<span className="ml-2 font-sans text-xs font-medium text-[#607065]">Verified customer</span></figcaption></figure>)}</div></Container></section>
    <section className="bg-[#F8F7F2] py-20"><Container><div className="flex items-end justify-between gap-5"><div><p className="eyebrow">Continue exploring</p><h2 className="section-title mt-3">You may also like</h2></div><Link href="/#products" className="hidden text-sm font-bold text-[#1E5631] sm:block">View all products</Link></div><div className="mt-9 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">{related.map(item => <ProductCard key={item.id} product={item} />)}</div></Container></section>
  </div>;
}

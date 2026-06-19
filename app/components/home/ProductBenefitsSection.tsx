'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { products } from '@/data/products';
import { Container } from '@/app/components/ui/Container';

const featured = [products[0], products[5], products[7]];

export function ProductBenefitsSection() {
  return <section id="benefits" className="bg-[#EAF5E4] py-20"><Container><div className="text-center"><p className="eyebrow">Made with intention</p><h2 className="section-title mt-3">A ritual for every need.</h2><p className="mx-auto mt-4 max-w-2xl text-[#607065]">Simple herbal care with clear benefits and no unnecessary complexity.</p></div>
    <div className="mt-10 grid gap-6 lg:grid-cols-3">{featured.map((product, i) => <motion.article key={product.id} initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} transition={{delay:i*.08}} viewport={{once:true}} className="overflow-hidden rounded-3xl bg-white shadow-[0_15px_35px_rgba(30,86,49,.07)]"><Link href={`/product/${product.slug}`} className="relative block aspect-[16/10] overflow-hidden"><Image src={product.images[1] ?? product.image} alt={product.name} fill sizes="(max-width: 1023px) 100vw, 33vw" className="object-cover transition-transform duration-500 hover:scale-105" /></Link><div className="p-6"><h3 className="text-2xl font-bold text-[#1E5631]">{product.name}</h3><ul className="mt-5 space-y-3">{product.benefits.map(benefit => <li key={benefit} className="flex items-center gap-3 text-sm font-medium text-[#526359]"><CheckCircle2 className="size-4 text-[#4F8A3F]" />{benefit}</li>)}</ul><Link href={`/product/${product.slug}`} className="mt-6 inline-block text-sm font-extrabold text-[#1E5631] underline decoration-[#E69500] decoration-2 underline-offset-4">See product details</Link></div></motion.article>)}</div>
  </Container></section>;
}

'use client';

import { motion } from 'framer-motion';
import { products } from '@/data/products';
import { Container } from '@/app/components/ui/Container';
import { ProductCard } from '@/app/components/product/ProductCard';

export function BestSellersSection() {
  return <section id="products" className="bg-[#F8F7F2] py-20"><Container><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">The collection</p><h2 className="section-title mt-3">Herbal essentials, made to be used.</h2></div><p className="max-w-md text-sm leading-6 text-[#607065] sm:text-right">Explore all {products.length} products, each with its complete image gallery and care guide.</p></div>
    <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={{show:{transition:{staggerChildren:.06}}}} className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">{products.map((product) => <motion.div key={product.id} variants={{hidden:{opacity:0,y:16},show:{opacity:1,y:0}}}><ProductCard product={product} /></motion.div>)}</motion.div>
  </Container></section>;
}

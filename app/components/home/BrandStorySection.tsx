'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Eye, Heart, Sprout } from 'lucide-react';
import { Container } from '@/app/components/ui/Container';

const pillars = [
  { icon: Sprout, title: 'Heritage', text: 'Rooted in traditional herbal knowledge passed through generations.' },
  { icon: Heart, title: 'Mission', text: 'Make honest, natural wellness simple enough for every daily ritual.' },
  { icon: Eye, title: 'Vision', text: 'Build a trusted herbal brand that cares for people and the planet.' },
];
const stats = [['10+', 'Years'], ['50+', 'Products'], ['100K+', 'Customers'], ['100%', 'Natural']];

export function BrandStorySection() {
  return <section id="story" className="bg-white py-20"><Container><div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
    <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative"><div className="relative aspect-[4/4.4] overflow-hidden rounded-[2rem] bg-[#EAF5E4]"><Image src="/images/Manjistha-soap/Manjistha Soap4.png" alt="Herbal product craftsmanship" fill sizes="(max-width: 1023px) 100vw, 50vw" className="object-cover" /></div><div className="absolute -bottom-5 right-5 rounded-2xl bg-[#E69500] px-5 py-4 text-white shadow-xl"><span className="block font-display text-2xl font-bold">Nature first</span><span className="text-xs font-semibold uppercase tracking-widest">Always and in all ways</span></div></motion.div>
    <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}><p className="eyebrow">Our story</p><h2 className="section-title mt-3">Wellness with roots, crafted with purpose.</h2><p className="mt-5 leading-7 text-[#607065]">Aram Narpavi Herbals brings traditional plant wisdom into modern homes through straightforward, carefully considered products.</p><div className="mt-7 space-y-5">{pillars.map(({icon: Icon,title,text}) => <div key={title} className="flex gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#EAF5E4] text-[#1E5631]"><Icon className="size-5" /></span><div><h3 className="text-xl font-bold text-[#1E5631]">{title}</h3><p className="mt-1 text-sm leading-6 text-[#607065]">{text}</p></div></div>)}</div></motion.div>
  </div><div className="mt-12 grid grid-cols-2 overflow-hidden rounded-3xl bg-[#1E5631] sm:grid-cols-4">{stats.map(([value,label],i) => <div key={label} className={`p-6 text-center text-white sm:p-8 ${i ? 'border-l border-white/15' : ''}`}><strong className="block font-display text-3xl sm:text-4xl">{value}</strong><span className="mt-1 block text-xs font-semibold uppercase tracking-widest text-white/65">{label}</span></div>)}</div></Container></section>;
}

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Leaf, ShieldCheck, Sparkles } from 'lucide-react';
import { Container } from '@/app/components/ui/Container';

export function HeroSection() {
  return <section className="relative overflow-hidden bg-[#F8F7F2] py-12 sm:py-16 lg:py-20"><div className="soft-grid absolute inset-y-0 right-0 w-1/2 opacity-50" /><Container className="relative"><div className="grid items-center gap-12 lg:grid-cols-[1fr_.92fr] lg:gap-16">
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .65 }}>
      <div className="inline-flex items-center gap-2 rounded-full border border-[#4F8A3F]/20 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[.14em] text-[#1E5631]"><Leaf className="size-4 text-[#4F8A3F]" />Rooted in nature, made for you</div>
      <h1 className="mt-6 max-w-3xl font-display text-[clamp(2.8rem,6vw,5.5rem)] font-bold leading-[.98] tracking-[-.055em] text-[#1E5631]">Ancient herbs.<br/><span className="text-[#4F8A3F]">Everyday rituals.</span></h1>
      <p className="mt-6 max-w-xl text-base leading-8 text-[#56685c] sm:text-lg">Thoughtfully crafted soaps, oils and wellness essentials inspired by time-honoured herbal wisdom.</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="#products" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1E5631] px-7 py-3.5 font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#174526]">Shop the collection <ArrowRight className="size-4" /></Link><Link href="#story" className="inline-flex items-center justify-center rounded-full border border-[#1E5631] px-7 py-3.5 font-bold text-[#1E5631] transition hover:bg-[#EAF5E4]">Discover our story</Link></div>
      <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-[#385443]"><span className="flex items-center gap-2"><Check className="size-4 text-[#4F8A3F]" />100% natural</span><span className="flex items-center gap-2"><Check className="size-4 text-[#4F8A3F]" />Chemical free</span><span className="flex items-center gap-2"><Check className="size-4 text-[#4F8A3F]" />Cruelty free</span></div>
    </motion.div>
    <motion.div initial={{ opacity: 0, x: 25 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .7, delay: .1 }} className="relative mx-auto w-full max-w-[590px]">
      <div className="absolute -inset-6 rounded-[3rem] bg-[#EAF5E4]" /><div className="relative aspect-[5/5.4] overflow-hidden rounded-[2.4rem] border-8 border-white shadow-[0_30px_70px_rgba(30,86,49,.18)]"><Image src="/images/Kuppaimeni-soap/Kuppameni Soap1.png" alt="Kuppameni herbal soap by Aram Narpavi Herbals" fill priority sizes="(max-width: 1023px) 90vw, 45vw" className="object-cover" /></div>
      <motion.div animate={{ y: [0,-7,0] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute -left-3 top-8 flex items-center gap-3 rounded-2xl bg-white p-3 pr-5 shadow-xl sm:-left-8"><span className="grid size-10 place-items-center rounded-full bg-[#EAF5E4]"><ShieldCheck className="size-5 text-[#1E5631]" /></span><div><strong className="block text-sm text-[#1E5631]">Pure ingredients</strong><span className="text-xs text-[#6a786f]">Honest formulations</span></div></motion.div>
      <motion.div animate={{ y: [0,7,0] }} transition={{ repeat: Infinity, duration: 4.5 }} className="absolute -bottom-5 right-1 flex items-center gap-3 rounded-2xl bg-[#1E5631] p-3 pr-5 text-white shadow-xl sm:-right-5"><span className="grid size-10 place-items-center rounded-full bg-white/15"><Sparkles className="size-5 text-[#f4bd55]" /></span><div><strong className="block text-sm">4.8/5 loved</strong><span className="text-xs text-white/70">by our community</span></div></motion.div>
    </motion.div>
  </div></Container></section>;
}

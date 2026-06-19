'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { faqs } from '@/data/faqs';
import { Container } from '@/app/components/ui/Container';

export function FAQSection() {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);
  return <section id="faq" className="bg-[#F8F7F2] py-20"><Container><div className="mx-auto max-w-5xl"><div className="grid gap-8 lg:grid-cols-[.7fr_1.3fr] lg:gap-14"><div><p className="eyebrow">Good to know</p><h2 className="section-title mt-3">Questions, answered clearly.</h2><p className="mt-4 text-sm leading-7 text-[#607065]">From ingredients to delivery, here is what our community asks most often.</p></div><div className="space-y-3">{faqs.map((faq) => { const open = openId === faq.id; return <div key={faq.id} className="overflow-hidden rounded-2xl border border-[#1E5631]/10 bg-white"><button onClick={() => setOpenId(open ? null : faq.id)} className="flex w-full items-center justify-between gap-5 p-5 text-left" aria-expanded={open}><span className="font-display text-lg font-bold text-[#1E5631]">{faq.question}</span><ChevronDown className={`size-5 shrink-0 text-[#4F8A3F] transition-transform ${open ? 'rotate-180' : ''}`} /></button><AnimatePresence initial={false}>{open && <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}}><p className="px-5 pb-5 text-sm leading-7 text-[#607065]">{faq.answer}</p></motion.div>}</AnimatePresence></div>})}</div></div></div></Container></section>;
}

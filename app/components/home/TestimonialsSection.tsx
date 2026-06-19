'use client';

import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { testimonials } from '@/data/testimonials';
import { Container } from '@/app/components/ui/Container';
import { Rating } from '@/app/components/ui/Rating';

const relevant = testimonials.filter((item) => ['1','3','4'].includes(item.id));

export function TestimonialsSection() {
  return <section id="testimonials" className="bg-white py-20"><Container><div className="text-center"><p className="eyebrow">Community notes</p><h2 className="section-title mt-3">Rituals our customers return to.</h2></div><div className="mt-10 grid gap-6 lg:grid-cols-3">{relevant.map((item, i) => <motion.figure key={item.id} initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} transition={{delay:i*.08}} viewport={{once:true}} className="flex h-full flex-col rounded-3xl border border-[#1E5631]/10 bg-[#F8F7F2] p-7"><Quote className="size-8 text-[#4F8A3F]/35" /><blockquote className="mt-5 flex-1 text-base leading-7 text-[#435449]">“{item.content}”</blockquote><figcaption className="mt-6 flex items-center gap-4 border-t border-[#1E5631]/10 pt-5"><span className="grid size-11 place-items-center rounded-full bg-[#1E5631] font-display font-bold text-white">{item.author.split(' ').map(n=>n[0]).join('')}</span><div><strong className="block text-sm text-[#1E5631]">{item.author}</strong><Rating rating={item.rating} size="sm" /></div></figcaption></motion.figure>)}</div></Container></section>;
}

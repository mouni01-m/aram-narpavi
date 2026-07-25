'use client';

import { HeroSection } from '@/app/components/home/HeroSection';
import { BrandStorySection } from '@/app/components/home/BrandStorySection';
import { WhyChooseUsSection } from "@/app/components/home/WhyChooseUsSection";
import { BestSellersSection } from '@/app/components/home/BestSellersSection';
import { FAQSection } from '@/app/components/home/FAQSection';
import { ContactSection } from '@/app/components/home/ContactSection';
export default function Home() {
  return (
    <>
      <HeroSection />
      <BrandStorySection />
      <WhyChooseUsSection />
      <BestSellersSection />
      <FAQSection />
      <ContactSection />
    </>
  );
}

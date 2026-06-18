'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Container } from '@/app/components/ui/Container';
import { Section } from '@/app/components/ui/Section';

interface CounterProps {
  end: number;
  label: string;
  suffix?: string;
}

const Counter: React.FC<CounterProps> = ({ end, label, suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / 100;
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 20);
    return () => clearInterval(timer);
  }, [end]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <div className="text-5xl lg:text-6xl font-playfair font-bold bg-gradient-to-r from-[#0f3d2e] to-[#3e7c4a] bg-clip-text text-transparent mb-2">
        {count}
        {suffix}
      </div>
      <p className="text-gray-600 font-medium text-lg">{label}</p>
    </motion.div>
  );
};

export const BrandStorySection: React.FC = () => {
  return (
    <Section id="story" className="bg-gradient-to-b from-white via-[#f8f6f0] to-white py-28">
      <Container>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <h2 className="text-4xl lg:text-5xl font-playfair font-bold text-[#0f3d2e] mb-6">
            Our Heritage
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
            Rooted in ancient wisdom, grown with modern expertise. Every product tells a story of tradition, quality, and commitment to your wellness.
          </p>
        </motion.div>

        {/* Story Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-28">
          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-3xl lg:text-4xl font-playfair font-bold text-[#0f3d2e] mb-4">
                Our Mission
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                At Aram Narpavi Herbals, we believe that nature holds the answer to wellness. Our mission is to bridge the gap between ancient herbal knowledge and contemporary wellness needs.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Every product we create is a testament to our commitment to purity, quality, and effectiveness.
              </p>
            </div>

            <div className="h-1 w-20 bg-gradient-to-r from-[#ff8c42] to-[#ffb366] rounded-full" />

            <div>
              <h3 className="text-3xl lg:text-4xl font-playfair font-bold text-[#0f3d2e] mb-4">
                Our Vision
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                To become the world's most trusted brand for natural, traditional herbal wellness products that transform lives and respect the planet.
              </p>
            </div>
          </motion.div>

          {/* Right: Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -inset-8 bg-gradient-to-br from-[#3e7c4a]/10 to-[#ff8c42]/10 rounded-3xl blur-2xl" />
            <img
              src="https://images.unsplash.com/photo-1599599810694-f3fc466d00f8?w=600&h=600&fit=crop"
              alt="Our Story"
              className="w-full rounded-3xl shadow-2xl relative z-10"
            />
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-white to-[#f8f6f0] p-12 lg:p-16 rounded-3xl border border-gray-100/50 shadow-lg"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 lg:gap-12">
            <Counter end={10} label="Years of Excellence" />
            <Counter end={50} label="Premium Products" suffix="+" />
            <Counter end={100} label="Happy Customers" suffix="K+" />
            <Counter end={100} label="Natural Ingredients" suffix="%" />
          </div>
        </motion.div>
      </Container>
    </Section>
  );
};

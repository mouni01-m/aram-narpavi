'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';
import { Container } from '@/app/components/ui/Container';
import { Button } from '@/app/components/ui/Button';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8 },
  },
};

export const HeroSection: React.FC = () => {
  return (
    <section className="relative h-screen min-h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFFDF7] via-[#f8f6f0] to-[#0f3d2e]/5 z-0" />

      {/* Large Decorative Elements */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-[#3e7c4a]/15 to-[#ff8c42]/10 rounded-full blur-3xl z-1"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
        className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-[#d6b25e]/10 to-[#3e7c4a]/10 rounded-full blur-3xl z-1"
      />

      <Container className="relative z-10 h-full flex items-center">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left Content */}
          <motion.div variants={itemVariants} className="space-y-8">
            {/* Badge */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 bg-[#3e7c4a]/8 px-4 py-2.5 rounded-full border border-[#3e7c4a]/20 w-fit"
            >
              <Leaf className="w-4 h-4 text-[#3e7c4a]" />
              <span className="text-sm font-semibold text-[#0f3d2e]">Pure Herbal Wellness</span>
            </motion.div>

            {/* Main Heading */}
            <motion.div variants={itemVariants} className="space-y-4">
              <h1 className="text-6xl lg:text-7xl font-playfair font-black text-[#0f3d2e] leading-tight">
                Aram Narpavi
                <br />
                <span className="bg-gradient-to-r from-[#3e7c4a] to-[#8bc34a] bg-clip-text text-transparent">
                  Herbals
                </span>
              </h1>
            </motion.div>

            {/* Subheading */}
            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-gray-600 max-w-lg leading-relaxed font-light"
            >
              Discover the power of ancient herbal remedies crafted for modern wellness. Every product is a testament to purity, tradition, and nature's healing potential.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <Button
                variant="primary"
                size="lg"
                className="h-14 px-8 text-base font-semibold rounded-xl"
                onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Explore Products
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-14 px-8 text-base font-semibold rounded-xl"
                onClick={() => document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Our Story
              </Button>
            </motion.div>

            {/* Trust Badges */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-6 pt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#ff8c42]" />
                <span className="text-gray-700">100% Natural Ingredients</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#3e7c4a]" />
                <span className="text-gray-700">No Chemicals</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            variants={itemVariants}
            className="relative h-96 sm:h-[500px] lg:h-[600px] flex items-center justify-center"
          >
            <motion.div
              animate={{ y: [0, 30, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative w-full h-full"
            >
              <img
                src="https://images.unsplash.com/photo-1600857062241-98e5dba7214f?w=600&h=700&fit=crop"
                alt="Premium Herbal Products"
                className="w-full h-full object-cover rounded-3xl shadow-2xl"
              />
              
              {/* Image Overlay Badge */}
              <motion.div
                animate={{ y: [0, -10, 0], rotate: [0, 2, -2, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-8 -left-8 bg-white px-6 py-4 rounded-2xl shadow-2xl border border-[#e8e4db]"
              >
                <p className="text-lg font-bold text-[#0f3d2e] font-playfair">Premium Quality</p>
                <p className="text-sm text-gray-600">Trusted by 100k+ customers</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
};

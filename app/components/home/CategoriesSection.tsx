'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Droplets, Apple, Droplet, Beaker, Heart } from 'lucide-react';
import { Container } from '@/app/components/ui/Container';
import { Section } from '@/app/components/ui/Section';

const categoryList = [
  {
    id: 'soaps',
    name: 'Herbal Soaps',
    icon: Droplets,
    description: 'Gentle cleansing',
    gradient: 'from-[#3e7c4a] to-[#8bc34a]',
    bgGradient: 'from-[#3e7c4a]/10 to-[#8bc34a]/5',
  },
  {
    id: 'malts',
    name: 'Health Malts',
    icon: Apple,
    description: 'Nutritious wellness',
    gradient: 'from-[#ff8c42] to-[#ffb366]',
    bgGradient: 'from-[#ff8c42]/10 to-[#ffb366]/5',
  },
  {
    id: 'oils',
    name: 'Premium Oils',
    icon: Droplet,
    description: 'Herbal infusions',
    gradient: 'from-[#0f3d2e] to-[#3e7c4a]',
    bgGradient: 'from-[#0f3d2e]/10 to-[#3e7c4a]/5',
  },
  {
    id: 'honey',
    name: 'Natural Honey',
    icon: Beaker,
    description: 'Pure & organic',
    gradient: 'from-[#d6b25e] to-[#f0c76f]',
    bgGradient: 'from-[#d6b25e]/15 to-[#f0c76f]/5',
  },
  {
    id: 'wellness',
    name: 'Wellness',
    icon: Heart,
    description: 'Holistic health',
    gradient: 'from-[#8bc34a] to-[#3e7c4a]',
    bgGradient: 'from-[#8bc34a]/10 to-[#3e7c4a]/5',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

export const CategoriesSection: React.FC = () => {
  return (
    <Section className="bg-white py-24">
      <Container>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl lg:text-5xl font-playfair font-bold text-[#0f3d2e] mb-4">
            Shop by Category
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our complete range of premium herbal wellness products
          </p>
        </motion.div>

        {/* Categories Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {categoryList.map((category) => {
            const Icon = category.icon;
            return (
              <motion.button
                key={category.id}
                variants={itemVariants}
                whileHover={{ y: -12, transition: { duration: 0.3 } }}
                className={`relative group p-8 rounded-2xl bg-gradient-to-br ${category.bgGradient} border border-gray-200/50 overflow-hidden transition-all duration-300 text-center h-full min-h-[280px] flex flex-col items-center justify-center`}
              >
                {/* Background Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0`} />

                <div className="relative z-10">
                  {/* Icon */}
                  <motion.div
                    whileHover={{ scale: 1.15 }}
                    transition={{ duration: 0.3 }}
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-gradient-to-br ${category.gradient}`}
                  >
                    <Icon className="w-10 h-10 text-white" strokeWidth={1.5} />
                  </motion.div>

                  {/* Text */}
                  <h3 className="text-xl font-playfair font-bold text-[#0f3d2e] mb-2">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600">{category.description}</p>

                  {/* Hover CTA */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    className="mt-6 text-sm font-semibold text-[#3e7c4a] flex items-center justify-center gap-2"
                  >
                    Explore →
                  </motion.div>
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </Container>
    </Section>
  );
};

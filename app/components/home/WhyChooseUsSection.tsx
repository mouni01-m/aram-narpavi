'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Zap, Leaf as LeafIcon, Recycle, Truck, CheckCircle } from 'lucide-react';
import { Container } from '@/app/components/ui/Container';
import { Section } from '@/app/components/ui/Section';

const features = [
  {
    icon: LeafIcon,
    title: 'Natural Ingredients',
    description: 'Sourced from sustainable farms',
    gradient: 'from-[#3e7c4a] to-[#8bc34a]',
    bgGradient: 'from-[#3e7c4a]/10 to-[#8bc34a]/5',
  },
  {
    icon: Leaf,
    title: 'Traditional Formulas',
    description: 'Generations of wellness knowledge',
    gradient: 'from-[#0f3d2e] to-[#3e7c4a]',
    bgGradient: 'from-[#0f3d2e]/10 to-[#3e7c4a]/5',
  },
  {
    icon: Zap,
    title: 'Chemical Free',
    description: 'No harmful preservatives',
    gradient: 'from-[#ff8c42] to-[#ffb366]',
    bgGradient: 'from-[#ff8c42]/10 to-[#ffb366]/5',
  },
  {
    icon: Recycle,
    title: 'Eco-Friendly',
    description: 'Biodegradable packaging',
    gradient: 'from-[#8bc34a] to-[#3e7c4a]',
    bgGradient: 'from-[#8bc34a]/10 to-[#3e7c4a]/5',
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: '3-5 days standard delivery',
    gradient: 'from-[#3e7c4a] to-[#0f3d2e]',
    bgGradient: 'from-[#3e7c4a]/10 to-[#0f3d2e]/5',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

export const WhyChooseUsSection: React.FC = () => {
  return (
    <Section className="bg-white py-24">
      <Container>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <h2 className="text-4xl lg:text-5xl font-playfair font-bold text-[#0f3d2e] mb-4">
            Why Aram Narpavi Herbals
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Committed to your wellness with uncompromising quality and transparency
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div key={feature.title} variants={itemVariants} whileHover={{ y: -8 }}>
                <div className={`relative p-8 rounded-2xl bg-gradient-to-br ${feature.bgGradient} border border-gray-100/50 hover:border-gray-200 transition-all hover:shadow-lg h-full flex flex-col group`}>
                  {/* Icon */}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto bg-gradient-to-br ${feature.gradient}`}
                  >
                    <Icon className="w-8 h-8 text-white" strokeWidth={1.5} />
                  </motion.div>

                  {/* Text */}
                  <h3 className="text-lg font-playfair font-bold text-[#0f3d2e] mb-2 text-center">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 text-center flex-grow">
                    {feature.description}
                  </p>

                  {/* Check Mark */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    whileHover={{ opacity: 1, scale: 1 }}
                    className="mt-6 flex justify-center"
                  >
                    <CheckCircle className="w-5 h-5 text-[#3e7c4a]" />
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </Container>
    </Section>
  );
};

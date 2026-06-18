'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Container } from '@/app/components/ui/Container';
import { Section } from '@/app/components/ui/Section';

const productBenefits = [
  {
    name: 'Kuppameni Soap',
    image: 'https://images.unsplash.com/photo-1600857062241-98e5dba7214f?w=400&h=400&fit=crop',
    benefits: [
      'Gentle on sensitive skin',
      'Natural glow enhancement',
      'Suitable for all skin types',
      'Reduces dryness',
    ],
  },
  {
    name: 'ABC Health Malt',
    image: 'https://images.unsplash.com/photo-1585914924665-41a1c85f5edb?w=400&h=400&fit=crop',
    benefits: ['Boosts energy levels', 'Supports immunity', 'Aids digestion', 'Daily nutrition'],
  },
  {
    name: 'Herbal Pain Balm',
    image: 'https://images.unsplash.com/photo-1586182988515-37d23cd97f44?w=400&h=400&fit=crop',
    benefits: ['Muscle pain relief', 'Anti-inflammatory', 'Cooling effect', 'Natural healing'],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
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

export const ProductBenefitsSection: React.FC = () => {
  return (
    <Section id="benefits" className="bg-white py-24">
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
            Explore Product Benefits
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover what makes our featured products special
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '0px 0px -100px 0px' }}
        >
          {productBenefits.map((product, index) => (
            <motion.div key={index} variants={itemVariants} whileHover={{ y: -8 }}>
              {/* Card */}
              <div className="h-full rounded-3xl overflow-hidden border border-gray-100 shadow-md hover:shadow-xl transition-all duration-500 flex flex-col bg-white">
                {/* Image */}
                <div className="w-full aspect-square overflow-hidden bg-gray-100 relative">
                  <motion.img
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.4 }}
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="p-8 flex-1 flex flex-col">
                  <h3 className="text-2xl font-playfair font-bold text-[#0f3d2e] mb-6">
                    {product.name}
                  </h3>

                  {/* Benefits List */}
                  <div className="space-y-4 flex-1">
                    {product.benefits.map((benefit, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        viewport={{ once: true }}
                        className="flex items-start gap-3"
                      >
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#ff8c42] to-[#ffb366] mt-2 flex-shrink-0" />
                        <span className="text-gray-700 font-medium">{benefit}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </Section>
  );
};

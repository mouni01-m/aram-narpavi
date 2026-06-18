'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import { Container } from '@/app/components/ui/Container';
import { Section } from '@/app/components/ui/Section';
import { Button } from '@/app/components/ui/Button';
import { Badge } from '@/app/components/ui/Badge';
import { Rating } from '@/app/components/ui/Rating';
import { products } from '@/data/products';

const bestSellers = products.filter((p) => p.isBestseller);

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

export const BestSellersSection: React.FC = () => {
  const addToCart = useCartStore((state) => state.addToCart);

  return (
    <Section id="products" className="bg-white py-24">
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
            Best Sellers
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our most trusted and beloved wellness products
          </p>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '0px 0px -100px 0px' }}
        >
          {bestSellers.slice(0, 6).map((product, index) => (
            <motion.div
              key={product.id}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className="group h-full flex flex-col"
            >
              {/* Product Card */}
              <div className="bg-white rounded-3xl overflow-hidden border border-gray-100/50 shadow-sm hover:shadow-xl transition-all duration-500 h-full flex flex-col">
                {/* Image Container */}
                <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
                  <motion.img
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.4 }}
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Bestseller Badge */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute top-4 right-4 bg-gradient-to-r from-[#ff8c42] to-[#ffb366] text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg"
                  >
                    ⭐ Bestseller
                  </motion.div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  {/* Title */}
                  <h3 className="text-xl font-playfair font-bold text-[#0f3d2e] mb-2 line-clamp-2">
                    {product.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
                    {product.description}
                  </p>

                  {/* Rating */}
                  <div className="mb-4">
                    <Rating rating={product.rating} reviews={product.reviews} size="sm" />
                  </div>

                  {/* Benefits Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {product.benefits.slice(0, 2).map((benefit) => (
                      <Badge
                        key={benefit}
                        variant="secondary"
                        className="text-xs bg-[#3e7c4a]/10 text-[#0f3d2e]"
                      >
                        {benefit}
                      </Badge>
                    ))}
                  </div>

                  {/* Footer - Price and Button */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold font-playfair text-[#0f3d2e]">₹{product.price}</span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => addToCart(product)}
                      className="bg-gradient-to-r from-[#3e7c4a] to-[#2f6438] hover:from-[#0f3d2e] hover:to-[#3e7c4a] text-white px-5 py-2 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg text-sm"
                    >
                      Add
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Button
            variant="outline"
            size="lg"
            className="rounded-xl h-14 px-8 text-base font-semibold"
          >
            View All {products.length} Products
          </Button>
        </motion.div>
      </Container>
    </Section>
  );
};

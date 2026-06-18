'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Container } from '@/app/components/ui/Container';
import { Section } from '@/app/components/ui/Section';
import { testimonials } from '@/data/testimonials';
import { Rating } from '@/app/components/ui/Rating';

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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

export const TestimonialsSection: React.FC = () => {
  return (
    <Section id="testimonials" className="bg-gradient-to-b from-white via-[#f8f6f0] to-white py-24">
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
            Loved by Thousands
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real experiences from our wellness community
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '0px 0px -100px 0px' }}
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              variants={itemVariants}
              whileHover={{ y: -6 }}
              className="group"
            >
              <div className="h-full p-8 rounded-3xl bg-white border border-gray-100/50 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col">
                {/* Stars */}
                <div className="mb-6">
                  <Rating rating={testimonial.rating} size="sm" />
                </div>

                {/* Quote */}
                <p className="text-gray-700 mb-8 leading-relaxed flex-grow italic font-light text-lg">
                  "{testimonial.content}"
                </p>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-6" />

                {/* Author */}
                <div className="flex items-center gap-4">
                  {testimonial.image && (
                    <img
                      src={testimonial.image}
                      alt={testimonial.author}
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-[#3e7c4a]/10"
                    />
                  )}
                  <div>
                    <p className="font-bold text-[#0f3d2e] font-playfair text-lg">
                      {testimonial.author}
                    </p>
                    <p className="text-sm text-gray-600">✓ Verified Customer</p>
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

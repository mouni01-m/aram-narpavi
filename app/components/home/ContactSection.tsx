'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import { Container } from '@/app/components/ui/Container';
import { Section } from '@/app/components/ui/Section';
import { Button } from '@/app/components/ui/Button';

const contactInfo = [
  {
    icon: Mail,
    title: 'Email',
    value: 'info@aramnarpavi.com',
    href: 'mailto:info@aramnarpavi.com',
    gradient: 'from-[#ff8c42] to-[#ffb366]',
    bgGradient: 'from-[#ff8c42]/10 to-[#ffb366]/5',
  },
  {
    icon: Phone,
    title: 'Phone',
    value: '+91 9876 543 210',
    href: 'tel:+919876543210',
    gradient: 'from-[#3e7c4a] to-[#8bc34a]',
    bgGradient: 'from-[#3e7c4a]/10 to-[#8bc34a]/5',
  },
  {
    icon: MapPin,
    title: 'Location',
    value: 'Bangalore, India',
    href: '#',
    gradient: 'from-[#0f3d2e] to-[#3e7c4a]',
    bgGradient: 'from-[#0f3d2e]/10 to-[#3e7c4a]/5',
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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

export const ContactSection: React.FC = () => {
  return (
    <Section id="contact" className="bg-gradient-to-b from-white via-[#f8f6f0] to-white py-24">
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
            Connect With Us
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have questions? We're here to help. Reach out to our team anytime.
          </p>
        </motion.div>

        {/* Contact Info Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {contactInfo.map((info) => {
            const Icon = info.icon;
            return (
              <motion.a
                key={info.title}
                href={info.href}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className={`group p-8 rounded-2xl bg-gradient-to-br ${info.bgGradient} border border-gray-100/50 hover:border-gray-200 transition-all hover:shadow-lg`}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br ${info.gradient}`}
                >
                  <Icon className="w-8 h-8 text-white" strokeWidth={1.5} />
                </motion.div>
                <h3 className="text-xl font-playfair font-bold text-[#0f3d2e] mb-2">
                  {info.title}
                </h3>
                <p className="text-gray-600 group-hover:text-gray-700 transition-colors">
                  {info.value}
                </p>
              </motion.a>
            );
          })}
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white p-10 lg:p-14 rounded-3xl border border-gray-100/50 shadow-lg">
            <h3 className="text-2xl font-playfair font-bold text-[#0f3d2e] mb-8">Send us a Message</h3>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[#0f3d2e] mb-2">Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3e7c4a] focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0f3d2e] mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3e7c4a] focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0f3d2e] mb-2">Subject</label>
                <input
                  type="text"
                  placeholder="How can we help?"
                  className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3e7c4a] focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0f3d2e] mb-2">Message</label>
                <textarea
                  placeholder="Your message here..."
                  rows={5}
                  className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3e7c4a] focus:border-transparent transition-all resize-none"
                />
              </div>
              <motion.div whileHover={{ x: 4 }}>
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full rounded-xl h-14 font-semibold flex items-center justify-center gap-2"
                >
                  Send Message
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </motion.div>
            </form>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
};

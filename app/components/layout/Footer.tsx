'use client';

import React from 'react';
import Link from 'next/link';
import { Leaf } from 'lucide-react';
import { Container } from '@/app/components/ui/Container';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-br from-[#0f3d2e] to-[#0a281f] text-[#fffdf7] py-20">
      <Container>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#ff8c42] to-[#ffb366] flex items-center justify-center">
                <Leaf className="w-6 h-6 text-[#0f3d2e]" strokeWidth={3} />
              </div>
              <div>
                <h3 className="text-lg font-playfair font-bold">Aram Narpavi</h3>
                <p className="text-xs text-[#3e7c4a]">Herbals</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              Premium herbal wellness crafted with tradition and care for your natural wellness journey.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-playfair font-bold text-lg mb-6">Shop</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#products" className="text-gray-300 hover:text-white transition-colors">
                  All Products
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Soaps
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Health Malts
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Wellness
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-playfair font-bold text-lg mb-6">Support</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#story" className="text-gray-300 hover:text-white transition-colors">
                  Our Story
                </a>
              </li>
              <li>
                <a href="#faq" className="text-gray-300 hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Shipping
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Returns
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-playfair font-bold text-lg mb-6">Connect</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="tel:+919876543210" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                  <span>+91 9876 543 210</span>
                </a>
              </li>
              <li>
                <a href="mailto:info@aramnarpavi.com" className="text-gray-300 hover:text-white transition-colors">
                  info@aramnarpavi.com
                </a>
              </li>
              <li className="pt-2">
                <div className="flex gap-4">
                  <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
                    Instagram
                  </a>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
                    Facebook
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#3e7c4a]/30 pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-400">
            <p>&copy; 2024 Aram Narpavi Herbals. All rights reserved.</p>
            <p className="text-gray-500">Crafted with care for natural wellness</p>
          </div>
        </div>
      </Container>
    </footer>
  );
};

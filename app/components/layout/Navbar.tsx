'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { Container } from '@/app/components/ui/Container';
import { CartDrawer } from './CartDrawer';

const navLinks = [
  { href: '#products', label: 'Products' },
  { href: '#story', label: 'Story' },
  { href: '#benefits', label: 'Benefits' },
  { href: '#testimonials', label: 'Testimonials' },
  { href: '#faq', label: 'FAQ' },
];

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const totalItems = useCartStore((state) => state.getTotalItems());

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100/50 shadow-sm">
        <Container>
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0f3d2e] to-[#3e7c4a] flex items-center justify-center group-hover:shadow-lg transition-all">
                <span className="text-white font-bold text-lg font-playfair">A</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-playfair font-bold text-[#0f3d2e]">Aram Narpavi</h1>
                <p className="text-xs text-[#3e7c4a] font-medium">Herbals</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-10">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-gray-700 hover:text-[#0f3d2e] transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#3e7c4a] to-[#8bc34a] group-hover:w-full transition-all duration-300" />
                </a>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-all hover:shadow-md group"
              >
                <ShoppingCart className="w-5 h-5 text-[#0f3d2e] group-hover:scale-110 transition-transform" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[#ff8c42] to-[#ffb366] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2.5 hover:bg-gray-100 rounded-xl transition-all"
              >
                {isOpen ? (
                  <X className="w-5 h-5 text-[#0f3d2e]" />
                ) : (
                  <Menu className="w-5 h-5 text-[#0f3d2e]" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="lg:hidden pb-4 border-t border-gray-100">
              <div className="flex flex-col gap-3 py-4">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-gray-700 hover:text-[#0F3D2E] transition-colors font-medium px-4 py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </Container>
      </nav>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

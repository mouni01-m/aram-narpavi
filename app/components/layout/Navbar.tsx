'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Leaf, Menu, ShoppingBag, X } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { Container } from '@/app/components/ui/Container';
import { CartDrawer } from './CartDrawer';

const navLinks = [
  { href: '/#products', label: 'Shop' },
  { href: '/#story', label: 'Our Story' },
  { href: '/#benefits', label: 'Benefits' },
  { href: '/#testimonials', label: 'Reviews' },
  { href: '/#faq', label: 'FAQ' },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const totalItems = useCartStore((state) => state.getTotalItems());

  useEffect(() => {
    const openCart = () => setCartOpen(true);
    window.addEventListener('open-cart', openCart);
    return () => window.removeEventListener('open-cart', openCart);
  }, []);

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-[#1E5631]/10 bg-[#F8F7F2]/92 backdrop-blur-xl">
        <Container>
          <div className="flex h-[76px] items-center justify-between">
            <Link href="/" className="flex items-center gap-3" aria-label="Aram Narpavi Herbals home">
              <span className="grid size-11 place-items-center rounded-full bg-[#1E5631] text-white">
                <Leaf className="size-5" />
              </span>
              <span className="leading-none">
                <span className="block font-display text-lg font-bold text-[#1E5631]">Aram Narpavi</span>
                <span className="mt-1 block text-[10px] font-bold uppercase tracking-[.28em] text-[#4F8A3F]">Herbals</span>
              </span>
            </Link>

            <div className="hidden items-center gap-8 lg:flex">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-sm font-semibold text-[#385443] transition-colors hover:text-[#1E5631]">
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setCartOpen(true)} className="relative grid size-11 place-items-center rounded-full border border-[#1E5631]/15 bg-white text-[#1E5631] transition hover:bg-[#EAF5E4]" aria-label={`Open cart with ${totalItems} items`}>
                <ShoppingBag className="size-5" />
                {totalItems > 0 && <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-[#E69500] text-[10px] font-bold text-white">{totalItems}</span>}
              </button>
              <button onClick={() => setMenuOpen((open) => !open)} className="grid size-11 place-items-center rounded-full text-[#1E5631] lg:hidden" aria-label="Toggle menu" aria-expanded={menuOpen}>
                {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </div>
          {menuOpen && (
            <div className="border-t border-[#1E5631]/10 py-3 lg:hidden">
              {navLinks.map((link) => <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="block rounded-xl px-3 py-3 font-semibold text-[#385443] hover:bg-[#EAF5E4]">{link.label}</Link>)}
            </div>
          )}
        </Container>
      </nav>
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

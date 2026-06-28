'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, ShoppingBag, X } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { Container } from '@/app/components/ui/Container';
import { CartDrawer } from './CartDrawer';

const navLinks = [
  { href: '/#story', label: 'About Us' },
  { href: '/#products', label: 'Shop' },
  { href: '/#benefits', label: 'Benefits' },
  { href: '/#testimonials', label: 'Reviews' },
  { href: '/#faq', label: 'FAQ' },
  { href: '/#contact', label: 'Contact' },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const totalItems = useCartStore((state) => state.getTotalItems());

  useEffect(() => {
    const openCart = () => setCartOpen(true);

    window.addEventListener('open-cart', openCart);

    return () => {
      window.removeEventListener('open-cart', openCart);
    };
  }, []);

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-[#1E5631]/10 bg-[#F8F7F2]/95 backdrop-blur-xl shadow-sm">
        <Container>
          <div className="flex h-[90px] items-center justify-between">

            {/* Logo */}
 <Link
  href="/"
  className="flex items-center gap-4"
  aria-label="Aram Narpavi Herbals Home"
>
  <Image
    src="/logo/aram_logo.png"
    alt="Aram Narpavi Herbals"
    width={250}
    height={250}
    priority
className="h-60 w-60 object-contain -mt-2"  />

  <div className="leading-none">
    {/* <h1 className="font-bold text-4xl">
      <span style={{ color: "#E69500" }}>ARAM</span>{" "}
      <span style={{ color: "#1E5631" }}>NARPAVI</span>
    </h1>

    <p
      className="mt-2 text-base font-bold uppercase tracking-[0.3em]"
      style={{ color: "#E69500" }}
    >
      HERBALS
    </p> */}
  </div>
</Link>
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="
                    text-sm
                    font-semibold
                    text-[#1E5631]
                    transition-all
                    duration-300
                    hover:text-[#E69500]
                  "
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">

              {/* Cart */}
              <button
                onClick={() => setCartOpen(true)}
                className="
                  relative
                  grid
                  size-11
                  place-items-center
                  rounded-full
                  border
                  border-[#1E5631]/15
                  bg-white
                  text-[#1E5631]
                  transition-all
                  hover:bg-[#EAF5E4]
                "
                aria-label={`Open cart with ${totalItems} items`}
              >
                <ShoppingBag className="size-5" />

                {totalItems > 0 && (
                  <span className="
                    absolute
                    -right-1
                    -top-1
                    grid
                    size-5
                    place-items-center
                    rounded-full
                    bg-[#E69500]
                    text-[10px]
                    font-bold
                    text-white
                  ">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMenuOpen((open) => !open)}
                className="
                  grid
                  size-11
                  place-items-center
                  rounded-full
                  text-[#1E5631]
                  lg:hidden
                "
                aria-label="Toggle menu"
              >
                {menuOpen ? (
                  <X className="size-5" />
                ) : (
                  <Menu className="size-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="border-t border-[#1E5631]/10 py-4 lg:hidden">

              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="
                    block
                    rounded-xl
                    px-4
                    py-3
                    font-semibold
                    text-[#1E5631]
                    transition-all
                    hover:bg-[#EAF5E4]
                    hover:text-[#E69500]
                  "
                >
                  {link.label}
                </Link>
              ))}

            </div>
          )}
        </Container>
      </nav>

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
      />
    </>
  );
}
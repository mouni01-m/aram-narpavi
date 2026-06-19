import Link from 'next/link';

export default function NotFound() {
  return <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 py-20 text-center"><p className="eyebrow">Product not found</p><h1 className="mt-4 font-display text-5xl font-bold text-[#1E5631]">This herbal essential has moved.</h1><p className="mt-5 text-[#607065]">Return to the collection to find the product you are looking for.</p><Link href="/#products" className="mt-7 rounded-full bg-[#1E5631] px-7 py-3.5 font-bold text-white">Browse products</Link></div>;
}

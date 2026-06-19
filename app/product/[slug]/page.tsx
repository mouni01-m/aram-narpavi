import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { products } from '@/data/products';
import { ProductDetails } from '@/app/components/product/ProductDetails';

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find((item) => item.slug === slug);
  if (!product) return { title: 'Product not found' };
  return { title: `${product.name} | Aram Narpavi Herbals`, description: product.description };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = products.find((item) => item.slug === slug);
  if (!product) notFound();
  const related = products.filter((item) => item.id !== product.id && (item.category === product.category || item.isBestseller)).slice(0, 4);
  return <ProductDetails product={product} related={related} />;
}

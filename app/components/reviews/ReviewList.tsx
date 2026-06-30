'use client';

import { useEffect, useState } from 'react';
import { getReviews } from '@/lib/reviews';
import ReviewCard from './ReviewCard';

interface Props {
  productId: string;
}

export default function ReviewList({ productId }: Props) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = getReviews(productId, (data) => {
      setReviews(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [productId]);

  if (loading) {
    return (
      <div className="py-10 text-center text-gray-500">
        Loading reviews...
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl border bg-white p-10 text-center text-gray-500">
        <h3 className="text-xl font-semibold">
          No Reviews Yet
        </h3>

        <p className="mt-2">
          Be the first customer to review this product.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
        />
      ))}
    </div>
  );
}
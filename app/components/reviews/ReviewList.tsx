'use client';

import type { ReviewRecord } from '@/lib/reviews';
import ReviewCard from './ReviewCard';

interface Props {
  reviews: ReviewRecord[];
  loading: boolean;
  error: Error | null;
  firestorePath: string;
}

export default function ReviewList({ reviews, loading, error, firestorePath }: Props) {
  if (loading) {
    return (
      <div className="py-10 text-center text-gray-500">
        Loading reviews...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">
        Reviews are temporarily unavailable for this product. Please try again later.
        {firestorePath ? <span className="mt-2 block text-xs text-red-600">Product review path: {firestorePath}</span> : null}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl border bg-white p-10 text-center text-gray-500">
        <h3 className="text-xl font-semibold">
          No approved reviews yet.
        </h3>

        <p className="mt-2">
          Submitted reviews appear here after approval.
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

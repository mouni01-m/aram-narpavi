'use client';

import Image from 'next/image';
import { Star, BadgeCheck } from 'lucide-react';

interface ReviewCardProps {
  review: {
    id: string;
    name: string;
    rating: number;
    comment: string;
    images?: string[];
    video?: string;
    createdAt?: { seconds?: number; nanoseconds?: number } | number | string | Date;
  };
}

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">

      {/* Top */}
      <div className="flex items-center justify-between">

        <div>
          <h3 className="font-semibold text-lg">
            {review.name}
          </h3>

          <div className="mt-1 flex items-center gap-1">

            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={16}
                className={
                  star <= review.rating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }
              />
            ))}

          </div>
        </div>

        <div className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
          <BadgeCheck size={14} />
          Verified
        </div>

      </div>

      {/* Review */}
      <p className="mt-5 whitespace-pre-line text-gray-700">
        {review.comment}
      </p>

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <div className="mt-5 flex gap-3 overflow-x-auto">

          {review.images.map((image, index) => (
            <div
              key={index}
              className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border"
            >
              <Image
                src={image}
                alt="Review"
                fill
                className="object-cover"
              />
            </div>
          ))}

        </div>
      )}

      {/* Video */}
      {review.video && (
        <div className="mt-5">
          <video
            controls
            className="w-full rounded-xl"
          >
            <source src={review.video} />
          </video>
        </div>
      )}

      {/* Date */}
      {review.createdAt && (
        <p className="mt-5 text-sm text-gray-500">
          {(() => {
            if (typeof review.createdAt === 'object' && review.createdAt !== null && 'seconds' in review.createdAt && typeof review.createdAt.seconds === 'number') {
              return new Date(review.createdAt.seconds * 1000).toLocaleDateString();
            }

            if (review.createdAt instanceof Date) {
              return review.createdAt.toLocaleDateString();
            }

            return new Date(String(review.createdAt)).toLocaleDateString();
          })()}
        </p>
      )}

    </div>
  );
}
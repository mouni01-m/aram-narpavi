'use client';

import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  setRating: (rating: number) => void;
}

export default function StarRating({
  rating,
  setRating,
}: StarRatingProps) {
  return (
    <div className="flex items-center gap-2">

      {[1, 2, 3, 4, 5].map((star) => (

        <button
          key={star}
          type="button"
          onClick={() => setRating(star)}
          className="transition-transform hover:scale-110"
        >
          <Star
            size={32}
            className={`transition-colors ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>

      ))}

      <span className="ml-3 text-sm font-medium text-gray-600">
        {rating} / 5
      </span>

    </div>
  );
}
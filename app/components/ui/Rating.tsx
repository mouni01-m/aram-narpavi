import React from 'react';
import { cn } from '@/lib/cn';

interface RatingProps {
  rating: number;
  reviews?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const Rating: React.FC<RatingProps> = ({ rating, reviews, size = 'md' }) => {
  const sizeClass = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => {
          const isFull = i < fullStars;
          const isHalf = i === fullStars && hasHalfStar;

          return (
            <svg
              key={i}
              className={cn(
                'w-4 h-4 transition-colors',
                isFull || isHalf ? 'text-[#D6B25E] fill-[#D6B25E]' : 'text-gray-300 fill-gray-300'
              )}
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          );
        })}
      </div>
      <div className="flex items-center gap-1">
        <span className={cn('font-semibold text-gray-800', sizeClass[size])}>{rating}</span>
        {reviews && <span className={cn('text-gray-600', sizeClass[size])}>{reviews} reviews</span>}
      </div>
    </div>
  );
};

'use client';

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';

import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';
import { getReviews, type ReviewRecord } from '@/lib/reviews';

interface Props {
  productId: string;
}

export default function ReviewSection({ productId }: Props) {
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);

  useEffect(() => {
    const unsubscribe = getReviews(productId, (data) => {
      setReviews(data);
    });

    return () => unsubscribe();
  }, [productId]);

  const totalReviews = reviews.length;

  const averageRating =
    totalReviews > 0
      ? (
          reviews.reduce(
            (sum, review) => sum + review.rating,
            0
          ) / totalReviews
        ).toFixed(1)
      : '0.0';

  const ratingCount = (star: number) =>
    reviews.filter((r) => r.rating === star).length;

  return (
    <section className="mt-20">

      <div className="rounded-3xl border bg-white p-8 shadow-sm">

        {/* Heading */}

        <h2 className="text-3xl font-bold text-[#1E5631]">
          Customer Reviews
        </h2>

        <div className="mt-8 grid gap-10 lg:grid-cols-[350px_1fr]">

          {/* Left Side */}

          <div>

            <div className="rounded-2xl bg-[#F8F7F2] p-6">

              <div className="flex items-center gap-4">

                <h1 className="text-5xl font-bold text-[#1E5631]">
                  {averageRating}
                </h1>

                <div>

                  <div className="flex">

                    {[1,2,3,4,5].map((star)=>(
                      <Star
                        key={star}
                        size={20}
                        className={
                          star <= Math.round(Number(averageRating))
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }
                      />
                    ))}

                  </div>

                  <p className="mt-1 text-sm text-gray-500">
                    Based on {totalReviews} Reviews
                  </p>

                </div>

              </div>

              {/* Rating Breakdown */}

              <div className="mt-8 space-y-3">

                {[5,4,3,2,1].map((star)=>{

                  const count = ratingCount(star);

                  const percent =
                    totalReviews === 0
                      ? 0
                      : (count / totalReviews) * 100;

                  return (

                    <div
                      key={star}
                      className="flex items-center gap-3"
                    >

                      <span className="w-8 text-sm">
                        {star}★
                      </span>

                      <div className="h-2 flex-1 rounded-full bg-gray-200">

                        <div
                          className="h-2 rounded-full bg-[#E69500]"
                          style={{
                            width: `${percent}%`
                          }}
                        />

                      </div>

                      <span className="w-8 text-xs text-gray-500">
                        {count}
                      </span>

                    </div>

                  );

                })}

              </div>

            </div>

            {/* Review Form */}

            <div className="mt-8">

              <ReviewForm productId={productId} />

            </div>

          </div>

          {/* Right Side */}

          <div>

            <ReviewList productId={productId} />

          </div>

        </div>

      </div>

    </section>
  );
}
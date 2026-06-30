'use client';

import { useState } from 'react';
import StarRating from './StarRating';
import ImageUploader from './ImageUploader';
import VideoUploader from './VideoUploader';

import {
  uploadImages,
  uploadVideo,
} from '@/lib/upload';

import {
  addReview,
} from '@/lib/reviews';

interface Props {
  productId: string;
}

export default function ReviewForm({ productId }: Props) {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const [images, setImages] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      // Upload Images
      let imageUrls: string[] = [];

      if (images.length > 0) {
        imageUrls = await uploadImages(
          images,
          productId
        );
      }

      // Upload Video
      let videoUrl = '';

      if (video) {
        videoUrl = await uploadVideo(
          video,
          productId
        );
      }

      // Save Firestore
      await addReview(productId, {
        name,
        rating,
        comment,
        images: imageUrls,
        video: videoUrl,
      });

      alert('Review Submitted Successfully ✅');

      setName('');
      setComment('');
      setRating(5);
      setImages([]);
      setVideo(null);
    } catch (err) {
      console.error(err);
      alert('Something went wrong.');
    }

    setLoading(false);
  }

  return (
    <form
      onSubmit={submitReview}
      className="space-y-6 rounded-2xl border bg-white p-6 shadow"
    >
      <h2 className="text-2xl font-bold">
        Write a Review
      </h2>

      {/* Name */}

      <div>
        <label className="font-medium">
          Your Name
        </label>

        <input
          type="text"
          required
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          className="mt-2 w-full rounded-lg border p-3"
        />
      </div>

      {/* Rating */}

      <div>
        <label className="font-medium">
          Rating
        </label>

        <div className="mt-2">
          <StarRating
            rating={rating}
            setRating={setRating}
          />
        </div>
      </div>

      {/* Review */}

      <div>
        <label className="font-medium">
          Review
        </label>

        <textarea
          required
          rows={5}
          value={comment}
          onChange={(e) =>
            setComment(e.target.value)
          }
          className="mt-2 w-full rounded-lg border p-3"
        />
      </div>

      {/* Images */}

      <div>
        <label className="font-medium">
          Upload Images
        </label>
<ImageUploader
    onImagesChange={setImages}
/>
      </div>

      {/* Video */}

      <div>
        <label className="font-medium">
          Upload Video
        </label>

        <VideoUploader
          video={video}
          setVideo={setVideo}
        />
      </div>

      {/* Submit */}

      <button
        disabled={loading}
        className="w-full rounded-xl bg-[#1E5631] py-3 font-semibold text-white hover:bg-green-800"
      >
        {loading
          ? 'Submitting...'
          : 'Submit Review'}
      </button>
    </form>
  );
}
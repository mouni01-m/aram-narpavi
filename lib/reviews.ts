import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';

import { db } from './firebase';

export interface ReviewData {
  name: string;
  rating: number;
  comment: string;
  images: string[];
  video: string;
}

/**
 * Add Review
 */
export async function addReview(
  productId: string,
  review: ReviewData
) {
  const reviewsRef = collection(
    db,
    'products',
    productId,
    'reviews'
  );

  await addDoc(reviewsRef, {
    ...review,
    createdAt: serverTimestamp(),
  });
}

/**
 * Get Reviews (Realtime)
 */
export function getReviews(
  productId: string,
  callback: (reviews: any[]) => void
) {
  const reviewsRef = collection(
    db,
    'products',
    productId,
    'reviews'
  );

  const q = query(
    reviewsRef,
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const reviews = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    callback(reviews);
  });
}

/**
 * Delete Review
 */
export async function deleteReview(
  productId: string,
  reviewId: string
) {
  await deleteDoc(
    doc(
      db,
      'products',
      productId,
      'reviews',
      reviewId
    )
  );
}

/**
 * Update Review
 */
export async function updateReview(
  productId: string,
  reviewId: string,
  data: Partial<ReviewData>
) {
  await updateDoc(
    doc(
      db,
      'products',
      productId,
      'reviews',
      reviewId
    ),
    data
  );
}
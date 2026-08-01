"use client";

import {
  collectionGroup,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

export type ReviewStatus = "pending" | "approved" | "rejected" | "reported" | "hidden";

export type AdminReviewReply = {
  text: string;
  adminName: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type AdminReview = {
  id: string;
  productId: string;
  productSlug: string;
  productName: string;
  productImage: string;
  productCategory: string;
  productPrice: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerPhoto: string;
  orderId: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  videos: string[];
  helpfulCount: number;
  reportCount: number;
  status: ReviewStatus;
  verifiedPurchase: boolean;
  approvedAt?: unknown;
  approvedBy?: string | null;
  adminReply?: AdminReviewReply;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type AdminReviewUpdate = {
  status?: ReviewStatus;
  adminReply?: AdminReviewReply | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asBoolean(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function asStatus(value: unknown): ReviewStatus {
  return value === "approved" || value === "rejected" || value === "reported" || value === "hidden" ? value : "pending";
}

function productImage(data: Record<string, unknown>) {
  const images = data.images;
  if (Array.isArray(images)) {
    const firstImage = images[0];
    if (typeof firstImage === "string") return firstImage;
    if (isRecord(firstImage)) return asString(firstImage.url, "/images/product-placeholder.png");
  }

  return asString(data.image, "/images/product-placeholder.png");
}

function normalizeReply(value: unknown): AdminReviewReply | undefined {
  if (!isRecord(value)) return undefined;
  const text = asString(value.text);
  if (!text) return undefined;

  return {
    text,
    adminName: asString(value.adminName, "Admin"),
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

async function normalizeReviewDocument(reviewDoc: QueryDocumentSnapshot<DocumentData>): Promise<AdminReview | null> {
  try {
    const data = reviewDoc.data();
    const parentProductRef = reviewDoc.ref.parent.parent;
    const productId = parentProductRef?.id ?? asString(data.productId);

    if (!productId) {
      console.error("Skipping malformed review without parent product:", reviewDoc.ref.path);
      return null;
    }

    let product: Record<string, unknown> = {};

    if (parentProductRef) {
      try {
        const productSnapshot = await getDoc(parentProductRef);
        product = productSnapshot.exists() ? productSnapshot.data() : {};
      } catch (error) {
        console.error(`Failed to load parent product for review ${reviewDoc.ref.path}:`, error);
      }
    }

    const video = asString(data.video);
    const videos = asStringArray(data.videos);

    return {
      id: reviewDoc.id,
      productId,
      productSlug: asString(product.slug, productId),
      productName: asString(product.name, asString(data.productName, productId)),
      productImage: productImage(product),
      productCategory: asString(product.category),
      productPrice: asNumber(product.sellingPrice, asNumber(product.price)),
      customerName: asString(data.customerName, asString(data.name, "Customer")),
      customerEmail: asString(data.customerEmail, asString(data.email)),
      customerPhone: asString(data.customerPhone, asString(data.phone)),
      customerPhoto: asString(data.customerPhoto, asString(data.photoURL)),
      orderId: asString(data.orderId),
      rating: asNumber(data.rating),
      title: asString(data.title),
      comment: asString(data.comment, asString(data.review)),
      images: asStringArray(data.images),
      videos: video ? [video, ...videos] : videos,
      helpfulCount: asNumber(data.helpfulCount, asNumber(data.helpfulVotes)),
      reportCount: asNumber(data.reportCount, asNumber(data.reports)),
      status: asStatus(data.status),
      verifiedPurchase: asBoolean(data.verifiedPurchase, asBoolean(data.verified)),
      approvedAt: data.approvedAt,
      approvedBy: asString(data.approvedBy) || null,
      adminReply: normalizeReply(data.adminReply),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  } catch (error) {
    console.error(`Skipping malformed review document ${reviewDoc.ref.path}:`, error);
    return null;
  }
}

export async function getAdminReviews(): Promise<AdminReview[]> {
  try {
    const reviewSnapshot = await getDocs(collectionGroup(db, "reviews"));
    const settledReviews = await Promise.allSettled(reviewSnapshot.docs.map(normalizeReviewDocument));

    return settledReviews.flatMap((result) => {
      if (result.status === "rejected") {
        console.error("Failed to normalize a review document:", result.reason);
        return [];
      }

      return result.value ? [result.value] : [];
    });
  } catch (error) {
    console.error("Failed to load reviews:", error);
    throw error;
  }
}

export function subscribeToAdminReviews(
  onReviews: (reviews: AdminReview[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  return onSnapshot(
    collectionGroup(db, "reviews"),
    (reviewSnapshot) => {
      void Promise.allSettled(reviewSnapshot.docs.map(normalizeReviewDocument)).then((settledReviews) => {
        const reviews = settledReviews.flatMap((result) => {
          if (result.status === "rejected") {
            console.error("Failed to normalize a review document:", result.reason);
            return [];
          }

          return result.value ? [result.value] : [];
        });

        console.info("[Admin Reviews] Realtime snapshot size:", reviewSnapshot.size);
        console.info("[Admin Reviews] Loaded review IDs:", reviews.map((review) => `${review.productId}/${review.id}`));
        onReviews(reviews);
      });
    },
    (error) => {
      console.error("Admin reviews realtime listener failed:", error);
      onError(error);
    }
  );
}

export async function updateAdminReview(productId: string, reviewId: string, updates: AdminReviewUpdate) {
  try {
    const payload: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };

    if (updates.status) {
      payload.status = updates.status;

      if (updates.status === "approved") {
        payload.verifiedPurchase = true;
        payload.approvedAt = serverTimestamp();
        payload.approvedBy = auth.currentUser?.uid ?? null;
      }

      if (updates.status === "pending") {
        payload.verifiedPurchase = false;
        payload.approvedAt = null;
        payload.approvedBy = null;
      }

      if (updates.status === "rejected" || updates.status === "hidden") {
        payload.verifiedPurchase = false;
      }
    }

    if ("adminReply" in updates) {
      payload.adminReply = updates.adminReply
        ? {
            ...updates.adminReply,
            updatedAt: serverTimestamp(),
            createdAt: updates.adminReply.createdAt ?? serverTimestamp(),
          }
        : null;
    }

    await updateDoc(doc(db, "products", productId, "reviews", reviewId), payload);
  } catch (error) {
    console.error(`Failed to update review products/${productId}/reviews/${reviewId}:`, error);
    throw error;
  }
}

export async function deleteAdminReview(productId: string, reviewId: string) {
  try {
    await deleteDoc(doc(db, "products", productId, "reviews", reviewId));
  } catch (error) {
    console.error(`Failed to delete review products/${productId}/reviews/${reviewId}:`, error);
    throw error;
  }
}

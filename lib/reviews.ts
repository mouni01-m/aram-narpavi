'use client';

import { FirebaseError } from 'firebase/app';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';

import { auth, db, firebaseApp } from './firebase';

const PRODUCTS_COLLECTION = 'products';
const REVIEWS_COLLECTION = 'reviews';
const APPROVED_STATUS = 'approved';

export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'hidden' | 'reported';

export type ReviewTimestamp =
  | { seconds?: number; nanoseconds?: number; toDate?: () => Date }
  | number
  | string
  | Date;

export type ReviewInput = {
  name: string;
  rating: number;
  comment: string;
  images: string[];
  video: string;
  title?: string;
  customerPhone?: string;
};

export type ReviewRecord = ReviewInput & {
  id: string;
  productId: string;
  uid?: string;
  customerEmail?: string;
  customerName?: string;
  status: ReviewStatus;
  verifiedPurchase: boolean;
  approvedAt?: ReviewTimestamp | null;
  approvedBy?: string | null;
  adminReply?: {
    text: string;
    adminName: string;
    createdAt?: ReviewTimestamp;
    updatedAt?: ReviewTimestamp;
  };
  videos: string[];
  helpfulCount: number;
  reportCount: number;
  createdAt?: ReviewTimestamp;
  updatedAt?: ReviewTimestamp;
};

export type ProductReviewsState = {
  reviews: ReviewRecord[];
  loading: boolean;
  error: Error | null;
  path: string;
  productId: string;
  productName: string;
};

type ProductReviewsSubscriber = (state: ProductReviewsState) => void;

type ProductReviewsSubscription = {
  subscribers: Set<ProductReviewsSubscriber>;
  state: ProductReviewsState;
  unsubscribe?: Unsubscribe;
  starting: boolean;
  productName: string;
};

const subscriptions = new Map<string, ProductReviewsSubscription>();

export function assertFirestoreProductId(productId: string): string {
  if (typeof productId !== 'string' || productId.trim().length === 0) {
    const error = new Error('[Reviews] productId is undefined or empty. Refusing to query Firestore.');
    console.error(error.message);
    throw error;
  }

  const id = productId.trim();

  if (/^\d+$/.test(id)) {
    const error = new Error(`[Reviews] Invalid numeric productId "${id}". Use the Firestore document ID, for example "kuppameni-soap", never "1", "2", or "3".`);
    console.error(error.message);
    console.error('[Reviews] Refusing invalid Firestore path:', `${PRODUCTS_COLLECTION}/${id}/${REVIEWS_COLLECTION}`);
    throw error;
  }

  return id;
}

export function reviewCollectionPath(productId: string): string {
  return `${PRODUCTS_COLLECTION}/${assertFirestoreProductId(productId)}/${REVIEWS_COLLECTION}`;
}

function productPath(productId: string): string {
  return `${PRODUCTS_COLLECTION}/${assertFirestoreProductId(productId)}`;
}

function logFirebaseProject() {
  console.info('[Reviews] Firebase project:', firebaseApp.options.projectId);
  console.info('[Reviews] Firebase app:', firebaseApp.name);
}

function createIndexUrl() {
  const projectId = firebaseApp.options.projectId;

  if (!projectId) return null;

  return `https://console.firebase.google.com/project/${projectId}/firestore/indexes`;
}

function logFirestoreError(error: unknown, path: string) {
  console.error('[Reviews] Firestore query failed.');
  console.error('[Reviews] Firestore Path:', path);

  if (error instanceof FirebaseError) {
    console.error('[Reviews] Firestore error code:', error.code);
    console.error('[Reviews] Firestore error message:', error.message);

    if (error.code === 'permission-denied') {
      console.error('[Reviews] Firestore permission denied. Check firestore.rules for this path:', path);
    }

    if (error.code === 'failed-precondition') {
      const indexUrlFromMessage = error.message.match(/https:\/\/console\.firebase\.google\.com\/[^\s)]+/)?.[0];
      console.error('[Reviews] Firestore index required. Exact URL:', indexUrlFromMessage ?? createIndexUrl() ?? 'No Firebase project ID available.');
    }
  } else {
    console.error('[Reviews] Unknown Firestore error:', error);
  }
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function asStatus(value: unknown): ReviewStatus {
  return value === 'approved' || value === 'rejected' || value === 'hidden' || value === 'reported' ? value : 'pending';
}

function normalizeAdminReply(value: unknown): ReviewRecord['adminReply'] {
  if (typeof value !== 'object' || value === null) return undefined;
  const reply = value as Record<string, unknown>;
  const text = asString(reply.text);
  if (!text) return undefined;

  return {
    text,
    adminName: asString(reply.adminName, 'Admin'),
    createdAt: reply.createdAt as ReviewTimestamp | undefined,
    updatedAt: reply.updatedAt as ReviewTimestamp | undefined,
  };
}

function normalizeReview(reviewDoc: QueryDocumentSnapshot<DocumentData>, productId: string): ReviewRecord {
  const data = reviewDoc.data();
  const video = asString(data.video);
  const videos = asStringArray(data.videos);

  return {
    id: reviewDoc.id,
    productId,
    name: asString(data.name, asString(data.customerName)),
    rating: asNumber(data.rating),
    title: asString(data.title),
    comment: asString(data.comment, asString(data.review)),
    images: asStringArray(data.images),
    video,
    videos: video ? [video, ...videos.filter((item) => item !== video)] : videos,
    uid: asString(data.uid) || undefined,
    customerEmail: asString(data.customerEmail, asString(data.email)) || undefined,
    customerName: asString(data.customerName, asString(data.name)) || undefined,
    customerPhone: asString(data.customerPhone, asString(data.phone)),
    status: asStatus(data.status),
    verifiedPurchase: asBoolean(data.verifiedPurchase, asBoolean(data.verified)),
    approvedAt: data.approvedAt as ReviewTimestamp | null | undefined,
    approvedBy: asString(data.approvedBy) || null,
    adminReply: normalizeAdminReply(data.adminReply),
    helpfulCount: asNumber(data.helpfulCount, asNumber(data.helpfulVotes)),
    reportCount: asNumber(data.reportCount, asNumber(data.reports)),
    createdAt: data.createdAt as ReviewTimestamp | undefined,
    updatedAt: data.updatedAt as ReviewTimestamp | undefined,
  };
}

async function verifyProductExists(productId: string, productName: string, context: string): Promise<boolean> {
  const id = assertFirestoreProductId(productId);
  const path = productPath(id);
  const productRef = doc(db, PRODUCTS_COLLECTION, id);
  const productSnapshot = await getDoc(productRef);

  console.info(`[Reviews] ${context} Product Name:`, productName);
  console.info(`[Reviews] ${context} Product ID:`, id);
  console.info(`[Reviews] ${context} Product Path:`, path);

  if (!productSnapshot.exists()) {
    console.error('[Reviews] Product document does not exist. Reviews require productId to exactly match the Firestore document ID.');
    console.error('[Reviews] Missing Product ID:', id);
    console.error('[Reviews] Missing Product Path:', path);
    return false;
  }

  return true;
}

function publish(subscription: ProductReviewsSubscription, state: ProductReviewsState) {
  subscription.state = state;
  subscription.subscribers.forEach((subscriber) => subscriber(state));
}

function startReviewsListener(productId: string, subscription: ProductReviewsSubscription) {
  if (subscription.starting || subscription.unsubscribe) return;

  subscription.starting = true;
  const id = assertFirestoreProductId(productId);
  const path = reviewCollectionPath(id);

  void verifyProductExists(id, subscription.productName, 'Open').then((exists) => {
    if (subscription.subscribers.size === 0) return;

    if (!exists) {
      publish(subscription, {
        reviews: [],
        loading: false,
        error: new Error(`[Reviews] Product document not found at ${productPath(id)}`),
        path,
        productId: id,
        productName: subscription.productName,
      });
      return;
    }

    const reviewsRef = collection(db, PRODUCTS_COLLECTION, id, REVIEWS_COLLECTION);
    const reviewsQuery = query(reviewsRef, where('status', '==', APPROVED_STATUS), orderBy('createdAt', 'desc'));

    console.info('[Reviews] Opening product reviews.');
    console.info('[Reviews] Product Name:', subscription.productName);
    console.info('[Reviews] Firestore Product ID:', id);
    console.info('[Reviews] Firestore Path:', path);
    console.info('[Reviews] Public Filter:', `status == "${APPROVED_STATUS}"`);
    logFirebaseProject();

    subscription.unsubscribe = onSnapshot(
      reviewsQuery,
      (snapshot) => {
        const reviews = snapshot.docs.map((reviewDoc) => normalizeReview(reviewDoc, id));
        const reviewIds = snapshot.docs.map((reviewDoc) => reviewDoc.id);

        console.info('[Reviews] Product Name:', subscription.productName);
        console.info('[Reviews] Firestore Product ID:', id);
        console.info('[Reviews] Firestore Path:', path);
        console.info('[Reviews] Public Filter:', `status == "${APPROVED_STATUS}"`);
        console.info('[Reviews] Snapshot Size:', snapshot.size);
        console.info('[Reviews] Loaded Reviews:', reviews);
        console.info('[Reviews] Loaded Review IDs:', reviewIds);

        publish(subscription, {
          reviews,
          loading: false,
          error: null,
          path,
          productId: id,
          productName: subscription.productName,
        });
      },
      (error) => {
        logFirestoreError(error, path);
        publish(subscription, {
          reviews: [],
          loading: false,
          error,
          path,
          productId: id,
          productName: subscription.productName,
        });
      }
    );
  }).catch((error: unknown) => {
    logFirestoreError(error, path);
    publish(subscription, {
      reviews: [],
      loading: false,
      error: error instanceof Error ? error : new Error('Unable to verify product review path.'),
      path,
      productId: id,
      productName: subscription.productName,
    });
  }).finally(() => {
    subscription.starting = false;
  });
}

export function getReviews(productId: string, subscriber: ProductReviewsSubscriber, productName = 'Unknown product'): Unsubscribe {
  const id = assertFirestoreProductId(productId);
  const path = reviewCollectionPath(id);
  const existing = subscriptions.get(id);
  const subscription = existing ?? {
    subscribers: new Set<ProductReviewsSubscriber>(),
    state: {
      reviews: [],
      loading: true,
      error: null,
      path,
      productId: id,
      productName,
    },
    starting: false,
    productName,
  };

  if (!existing) subscriptions.set(id, subscription);
  subscription.productName = productName;

  subscription.subscribers.add(subscriber);
  subscriber(subscription.state);
  startReviewsListener(id, subscription);

  return () => {
    subscription.subscribers.delete(subscriber);

    if (subscription.subscribers.size === 0) {
      subscription.unsubscribe?.();
      subscriptions.delete(id);
      console.info('[Reviews] Closed realtime listener for:', path);
    }
  };
}

export const subscribeToProductReviews = getReviews;

export async function addReview(productId: string, review: ReviewInput, productName = 'Unknown product') {
  const id = assertFirestoreProductId(productId);
  const path = reviewCollectionPath(id);
  const currentUser = auth.currentUser;

  if (!currentUser) {
    const error = new Error('[Reviews] You must be signed in before submitting a review.');
    console.error(error.message);
    throw error;
  }

  const exists = await verifyProductExists(id, productName, 'Submit');

  if (!exists) {
    throw new Error(`[Reviews] Cannot create review because product does not exist at ${productPath(id)}`);
  }

  console.info('[Reviews] Creating review in Firestore.');
  console.info('[Reviews] Product Name:', productName);
  console.info('[Reviews] Firestore Product ID:', id);
  console.info('[Reviews] Firestore Path:', path);

  await addDoc(collection(db, PRODUCTS_COLLECTION, id, REVIEWS_COLLECTION), {
    ...review,
    productId: id,
    uid: currentUser.uid,
    name: review.name,
    customerName: review.name,
    customerEmail: currentUser.email ?? '',
    customerPhone: review.customerPhone ?? '',
    title: review.title ?? '',
    status: 'pending',
    verifiedPurchase: false,
    approvedAt: null,
    approvedBy: null,
    adminReply: null,
    videos: review.video ? [review.video] : [],
    helpfulCount: 0,
    reportCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteReview(productId: string, reviewId: string) {
  const id = assertFirestoreProductId(productId);

  if (!reviewId) throw new Error('[Reviews] reviewId is required for deletion.');

  const path = `${reviewCollectionPath(id)}/${reviewId}`;

  try {
    console.info('[Reviews] Deleting review:', path);
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, id, REVIEWS_COLLECTION, reviewId));
  } catch (error) {
    logFirestoreError(error, path);
    throw error;
  }
}

export async function updateReview(productId: string, reviewId: string, data: Partial<ReviewInput>) {
  const id = assertFirestoreProductId(productId);

  if (!reviewId) throw new Error('[Reviews] reviewId is required for update.');

  const path = `${reviewCollectionPath(id)}/${reviewId}`;

  try {
    console.info('[Reviews] Updating review:', path);
    await updateDoc(doc(db, PRODUCTS_COLLECTION, id, REVIEWS_COLLECTION, reviewId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    logFirestoreError(error, path);
    throw error;
  }
}

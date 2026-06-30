import {
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';

import { storage } from './firebase';

/**
 * Upload Multiple Images
 */
export async function uploadImages(
  images: File[],
  productId: string
): Promise<string[]> {
  const imageUrls: string[] = [];

  for (const image of images) {
    const fileName = `${Date.now()}-${image.name}`;

    const storageRef = ref(
      storage,
      `reviews/${productId}/images/${fileName}`
    );

    await uploadBytes(storageRef, image);

    const url = await getDownloadURL(storageRef);

    imageUrls.push(url);
  }

  return imageUrls;
}

/**
 * Upload Single Video
 */
export async function uploadVideo(
  video: File,
  productId: string
): Promise<string> {
  const fileName = `${Date.now()}-${video.name}`;

  const storageRef = ref(
    storage,
    `reviews/${productId}/videos/${fileName}`
  );

  await uploadBytes(storageRef, video);

  const url = await getDownloadURL(storageRef);

  return url;
}
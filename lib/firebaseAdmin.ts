import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let cachedDb: Firestore | null = null;

function requireEnv(name: "FIREBASE_PROJECT_ID" | "FIREBASE_CLIENT_EMAIL" | "FIREBASE_PRIVATE_KEY"): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required for Firebase Admin routes.`);
  return value;
}

function getAdminApp(): App {
  const existingApp = getApps()[0];
  if (existingApp) return existingApp;

  return initializeApp({
    credential: cert({
      projectId: requireEnv("FIREBASE_PROJECT_ID"),
      clientEmail: requireEnv("FIREBASE_CLIENT_EMAIL"),
      privateKey: requireEnv("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n"),
    }),
  });
}

export function getAdminDb(): Firestore {
  cachedDb ??= getFirestore(getAdminApp());
  return cachedDb;
}

export const adminDb = new Proxy({} as Firestore, {
  get(_target, property, receiver) {
    return Reflect.get(getAdminDb(), property, receiver);
  },
});

import { GoogleAuthProvider, browserLocalPersistence, createUserWithEmailAndPassword, sendPasswordResetEmail, setPersistence, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import type { SignupInput } from "@/lib/user";
import { createUserProfile, ensureUserProfile, updateUserProfile } from "@/services/userService";

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export async function signup(input: SignupInput) {
  await setPersistence(auth, browserLocalPersistence);
  const result = await createUserWithEmailAndPassword(auth, input.email, input.password);
  await updateProfile(result.user, { displayName: input.name });
  await createUserProfile({ uid: result.user.uid, name: input.name, email: input.email, phone: input.phone, gender: input.gender, dob: input.dob, photoURL: "", wishlist: [], cart: [], addresses: [], orders: [], reviews: [], role: "customer" });
  return result.user;
}

export async function login(email: string, password: string) {
  await setPersistence(auth, browserLocalPersistence);
  const result = await signInWithEmailAndPassword(auth, email, password);
  await updateUserProfile(result.user.uid, {});
  return result.user;
}

export async function googleLogin() {
  await setPersistence(auth, browserLocalPersistence);
  const result = await signInWithPopup(auth, googleProvider);
  await ensureUserProfile({ uid: result.user.uid, name: result.user.displayName ?? "Customer", email: result.user.email ?? "", phone: result.user.phoneNumber ?? "", gender: "", dob: "", photoURL: result.user.photoURL ?? "", wishlist: [], cart: [], addresses: [], orders: [], reviews: [], role: "customer" });
  return result.user;
}

export function forgotPassword(email: string) { return sendPasswordResetEmail(auth, email); }
export function logout() { return signOut(auth); }

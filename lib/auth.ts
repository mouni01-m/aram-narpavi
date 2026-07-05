import { auth, db } from "./firebase";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

const googleProvider = new GoogleAuthProvider();

export async function signup(
  name: string,
  email: string,
  password: string
) {
  const result = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  await setDoc(doc(db, "users", result.user.uid), {
    uid: result.user.uid,
    name,
    email,
    phone: "",
    photoURL: "",
    createdAt: serverTimestamp(),
  });

  return result.user;
}

export async function login(
  email: string,
  password: string
) {
  const result = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  return result.user;
}

export async function googleLogin() {
  const result = await signInWithPopup(auth, googleProvider);

  await setDoc(
    doc(db, "users", result.user.uid),
    {
      uid: result.user.uid,
      name: result.user.displayName,
      email: result.user.email,
      photoURL: result.user.photoURL,
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );

  return result.user;
}

export async function logout() {
  return signOut(auth);
}
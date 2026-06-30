import { initializeApp } from "firebase/app";

import { getFirestore } from "firebase/firestore";

import { getStorage } from "firebase/storage";

import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBKITFFmrVqbFBTNfUA169lfcBRTAVnryk",
  authDomain: "aram-narpavi-herbals-19a45.firebaseapp.com",
  projectId: "aram-narpavi-herbals-19a45",
  storageBucket: "aram-narpavi-herbals-19a45.firebasestorage.app",
  messagingSenderId: "978897760887",
  appId: "1:978897760887:web:03f68fba0da75b2c9d0c72",
  measurementId: "G-CER3MV81MG"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const storage = getStorage(app);

export const auth = getAuth(app);
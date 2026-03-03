import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

function mustGet(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var ${name}`);
  return v;
}

const firebaseConfig = {
  apiKey: mustGet("NEXT_PUBLIC_FIREBASE_API_KEY"),
  authDomain: mustGet("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
  projectId: mustGet("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
  storageBucket: mustGet("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: mustGet("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
  appId: mustGet("NEXT_PUBLIC_FIREBASE_APP_ID"),
};

export function getFirebaseApp(): FirebaseApp {
  return getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);
}

export function getDb() {
  return getFirestore(getFirebaseApp());
}

export function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}

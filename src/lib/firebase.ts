import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA1P-xT3-kNNBfW6BaaQnaE_Mbq98G8-1I",
  authDomain: "rent9ja-c498b.firebaseapp.com",
  projectId: "rent9ja-c498b",
  storageBucket: "rent9ja-c498b.firebasestorage.app",
  messagingSenderId: "118346713952",
  appId: "1:118346713952:web:1efd85b6c34241526eac05",
  measurementId: "G-VMJFBX4208"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app, "ai-studio-rentnaija-b76e1c22-0952-4e40-af47-90b53c1fb32c");
export default app;

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, Analytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDN9xPWmkuZ37FW0cmfxe-1D4NPRyCbViw",
  authDomain: "socialgraph-ai.firebaseapp.com",
  projectId: "socialgraph-ai",
  storageBucket: "socialgraph-ai.firebasestorage.app",
  messagingSenderId: "1043561499696",
  appId: "1:1043561499696:web:b088988aa5760c522031f5",
  measurementId: "G-D6B4KHT0ZY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics conditionally (only runs in browser)
export let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export default app;

// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDskbcG1Xi8joJ2MtqVdguRiV55Zvvjxl4",
  authDomain: "nexinfra-ee1f7.firebaseapp.com",
  projectId: "nexinfra-ee1f7",
  storageBucket: "nexinfra-ee1f7.firebasestorage.app",
  messagingSenderId: "689119500632",
  appId: "1:689119500632:web:ea5948c76313c29cd16d2d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Authentication
export const auth = getAuth(app);

// Export app (useful later for Firestore and Storage)
export default app;
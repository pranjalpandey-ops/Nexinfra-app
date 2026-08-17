import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDskbcG1Xi8joJ2MtqVdguRiV55Zvvjxl4",
  authDomain: "nexinfra-ee1f7.firebaseapp.com",
  projectId: "nexinfra-ee1f7",
  storageBucket: "nexinfra-ee1f7.firebasestorage.app",
  messagingSenderId: "689119500632",
  appId: "1:689119500632:web:ea5948c76313c29cd16d2d"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
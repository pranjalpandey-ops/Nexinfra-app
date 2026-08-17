import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDskbcG1Xi8joJ2MtqVdguRiV55Zvvjxl4",
  authDomain: "nexinfra-ee1f7.firebaseapp.com",
  projectId: "nexinfra-ee1f7",
  storageBucket: "nexinfra-ee1f7.firebasestorage.app",
  messagingSenderId: "689119500632",
  appId: "1:689119500632:web:ea5948c76313c29cd16d2d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function seedAdmin() {
  const adminEmail = "admin@nexinfra.gov";
  const adminPass = "AdminPassword123!";
  const adminName = "Chief Executive Administrator";

  console.log(`[1/3] Creating / Authenticating Demo Admin Account: ${adminEmail}...`);
  let user;

  try {
    const cred = await createUserWithEmailAndPassword(auth, adminEmail, adminPass);
    user = cred.user;
    console.log("-> Admin account created in Firebase Authentication!");
  } catch (err) {
    if (err.code === "auth/email-already-in-use") {
      console.log("-> Account already exists in Firebase Auth, logging in to update Firestore...");
      const cred = await signInWithEmailAndPassword(auth, adminEmail, adminPass);
      user = cred.user;
    } else {
      console.error("Auth error:", err);
      process.exit(1);
    }
  }

  await updateProfile(user, { displayName: adminName });

  console.log(`[2/3] Writing Administrator Role to Firestore at users/${user.uid}...`);
  const adminProfile = {
    uid: user.uid,
    name: adminName,
    email: adminEmail,
    role: "admin",
    clearance: "Level 3 Executive Command Authority",
    organization: "Nexinfra National Infrastructure Command",
    department: "Executive Central Grid",
    adminRequestStatus: "approved",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  await setDoc(doc(db, "users", user.uid), adminProfile, { merge: true });

  console.log(`[3/3] Success! Admin account is active in Database:`);
  console.log(JSON.stringify(adminProfile, null, 2));
}

seedAdmin().catch(console.error);

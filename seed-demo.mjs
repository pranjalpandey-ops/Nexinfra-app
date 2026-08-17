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

async function seedAccounts() {
  // 1. Demo Admin Account
  const adminEmail = "admin@nexinfra.gov";
  const adminPass = "AdminPassword123!";
  const adminName = "Chief Executive Administrator";

  console.log(`Setting up Demo Admin (${adminEmail})...`);
  let adminUser;
  try {
    const cred = await createUserWithEmailAndPassword(auth, adminEmail, adminPass);
    adminUser = cred.user;
  } catch (err) {
    if (err.code === "auth/email-already-in-use") {
      const cred = await signInWithEmailAndPassword(auth, adminEmail, adminPass);
      adminUser = cred.user;
    } else {
      throw err;
    }
  }

  await updateProfile(adminUser, { displayName: adminName });
  await setDoc(
    doc(db, "users", adminUser.uid),
    {
      uid: adminUser.uid,
      name: adminName,
      email: adminEmail,
      role: "admin",
      clearance: "Level 3 Executive Command Authority",
      organization: "Nexinfra National Command",
      department: "Central Operations",
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
  console.log("✓ Demo Admin successfully verified in Firebase!");

  // 2. Demo Citizen Account
  const citizenEmail = "citizen.demo@nexinfra.org";
  const citizenPass = "CitizenPassword123!";
  const citizenName = "Maya Resident";

  console.log(`Setting up Demo Citizen (${citizenEmail})...`);
  let citizenUser;
  try {
    const cred = await createUserWithEmailAndPassword(auth, citizenEmail, citizenPass);
    citizenUser = cred.user;
  } catch (err) {
    if (err.code === "auth/email-already-in-use") {
      const cred = await signInWithEmailAndPassword(auth, citizenEmail, citizenPass);
      citizenUser = cred.user;
    } else {
      throw err;
    }
  }

  await updateProfile(citizenUser, { displayName: citizenName });
  await setDoc(
    doc(db, "users", citizenUser.uid),
    {
      uid: citizenUser.uid,
      name: citizenName,
      email: citizenEmail,
      role: "public",
      clearance: "Public Citizen Level 1",
      organization: "Greenway Community Ward",
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
  console.log("✓ Demo Citizen successfully verified in Firebase!");
}

seedAccounts()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed error:", err);
    process.exit(1);
  });

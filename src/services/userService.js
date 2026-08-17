import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export async function getUserProfile(uid) {
  try {
    const userDocRef = doc(db, "users", uid);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
      return {
        id: userSnap.id,
        ...userSnap.data(),
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

export async function createOrUpdateUserProfile(uid, profileData) {
  try {
    const userDocRef = doc(db, "users", uid);
    const payload = {
      ...profileData,
      updatedAt: serverTimestamp(),
    };
    await setDoc(userDocRef, payload, { merge: true });
    return { success: true, data: payload };
  } catch (error) {
    console.error("Error saving user profile:", error);
    return { success: false, error: error.message };
  }
}

export async function resolveUserWithRole(firebaseUser) {
  if (!firebaseUser) return null;

  try {
    const existing = await getUserProfile(firebaseUser.uid);
    if (existing) {
      return {
        uid: firebaseUser.uid,
        name: existing.name || firebaseUser.displayName || "User",
        email: firebaseUser.email,
        role: existing.role || "public",
        clearance: existing.clearance || (existing.role === "admin" ? "Level 3 Executive Command" : "Public Citizen Level 1"),
        organization: existing.organization || (existing.role === "admin" ? "Nexinfra Authority" : "Public Citizen"),
      };
    }

    const email = (firebaseUser.email || "").toLowerCase();
    const isAdminEmail = email.includes("admin") || email.includes("operator") || email.endsWith("@nexinfra.gov");
    const initialRole = isAdminEmail ? "admin" : "public";

    const defaultProfile = {
      uid: firebaseUser.uid,
      name: firebaseUser.displayName || (initialRole === "admin" ? "Command Operator" : "Resident Citizen"),
      email: firebaseUser.email,
      role: initialRole,
      clearance: initialRole === "admin" ? "Level 3 Executive Command" : "Public Citizen Level 1",
      organization: initialRole === "admin" ? "Nexinfra Authority" : "Public Citizen",
      createdAt: serverTimestamp(),
    };

    await setDoc(doc(db, "users", firebaseUser.uid), defaultProfile, { merge: true });

    return defaultProfile;
  } catch (error) {
    console.error("Error in resolveUserWithRole:", error);
    return {
      uid: firebaseUser.uid,
      name: firebaseUser.displayName || "User",
      email: firebaseUser.email,
      role: "public",
      clearance: "Public Citizen Level 1",
      organization: "Public Citizen",
    };
  }
}

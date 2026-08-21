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
    if (existing && existing.role) {
      return {
        uid: firebaseUser.uid,
        name: existing.name || firebaseUser.displayName || "User",
        email: firebaseUser.email,
        role: existing.role,
        department: existing.department || (existing.role === "officer" ? "Road Works & Asphalt Division" : "Grid Operations"),
        ward: existing.ward || "Central District - Ward 4 (Civic Centre)",
        clearance: existing.clearance || (
          existing.role === "admin"
            ? "Level 3 Executive Command"
            : existing.role === "officer"
            ? "Municipal Zonal Officer - Level 2"
            : "Public Citizen Level 1"
        ),
        organization: existing.organization || (
          existing.role === "admin"
            ? "Nexinfra Authority"
            : existing.role === "officer"
            ? "Municipal Infrastructure Corporation"
            : "Public Citizen"
        ),
      };
    }

    const email = (firebaseUser.email || "").toLowerCase();
    const isAdminEmail = email.includes("admin") || email.includes("operator") || email.endsWith("@nexinfra.gov");
    const isOfficerEmail = email.includes("officer") || email.includes("mcd") || email.includes("zonal") || email.includes("engineer");
    
    const initialRole = isAdminEmail ? "admin" : isOfficerEmail ? "officer" : "public";

    const defaultProfile = {
      uid: firebaseUser.uid,
      name: firebaseUser.displayName || (
        initialRole === "admin" ? "Command Operator" :
        initialRole === "officer" ? "Municipal Zonal Officer" :
        "Resident Citizen"
      ),
      email: firebaseUser.email,
      role: initialRole,
      department: initialRole === "officer" ? "Road Works & Asphalt Division" : "Grid Operations",
      ward: initialRole === "officer" ? "Central District - Ward 4 (Civic Centre)" : "Central District",
      clearance: initialRole === "admin"
        ? "Level 3 Executive Command"
        : initialRole === "officer"
        ? "Municipal Zonal Officer - Level 2"
        : "Public Citizen Level 1",
      organization: initialRole === "admin"
        ? "Nexinfra Authority"
        : initialRole === "officer"
        ? "Municipal Infrastructure Corporation"
        : "Public Citizen",
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

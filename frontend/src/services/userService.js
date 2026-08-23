import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export async function getUserProfile(uid) {
  if (!uid) return null;
  try {
    const userDocRef = doc(db, "users", uid);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
      return {
        id: userSnap.id,
        uid: userSnap.id,
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
  if (!uid) return { success: false, error: "No UID provided" };
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

/**
 * Authoritative role resolution mechanism.
 * 1. Primary Source of Truth: Firestore `users/{uid}` document.
 * 2. Fallback: Specific exact demo account matches only.
 * 3. Default: 'public' citizen role.
 * NEVER makes a user admin based on email domain endsWith("@nexinfra.gov").
 */
export async function resolveUserWithRole(firebaseUser) {
  if (!firebaseUser) return null;

  const uid = firebaseUser.uid;
  const email = (firebaseUser.email || "").toLowerCase().trim();

  try {
    // 1. Primary Source of Truth: Check Firestore
    const existing = await getUserProfile(uid);

    if (existing && existing.role) {
      // If demo account email has a legacy corrupted role in Firestore, correct it
      if (email === "officer.demo@nexinfra.gov" && existing.role !== "officer") {
        existing.role = "officer";
        await setDoc(doc(db, "users", uid), { role: "officer" }, { merge: true });
      } else if (email === "admin@nexinfra.gov" && existing.role !== "admin") {
        existing.role = "admin";
        await setDoc(doc(db, "users", uid), { role: "admin" }, { merge: true });
      } else if (email === "citizen.demo@nexinfra.org" && existing.role !== "public") {
        existing.role = "public";
        await setDoc(doc(db, "users", uid), { role: "public" }, { merge: true });
      }

      return {
        uid,
        name: existing.name || firebaseUser.displayName || (
          existing.role === "admin" ? "Command Administrator" :
          existing.role === "officer" ? "Municipal Field Officer" :
          "Resident Citizen"
        ),
        email: firebaseUser.email || existing.email,
        role: existing.role,
        department: existing.department || (
          existing.role === "officer"
            ? "Road Works & Asphalt Pavement Division"
            : existing.role === "admin"
            ? "Command Center Operations"
            : "Resident Public"
        ),
        ward: existing.ward || (
          existing.role === "officer"
            ? "Central District - Ward 4 (Civic Centre)"
            : "Central District"
        ),
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

    // 2. Fallback for Demo Accounts (Exact matches only)
    if (email === "admin@nexinfra.gov") {
      const adminProfile = {
        uid,
        name: firebaseUser.displayName || "Command Administrator",
        email: firebaseUser.email,
        role: "admin",
        department: "Command Center Operations",
        ward: "HQ Central Command",
        clearance: "Level 3 Executive Command",
        organization: "Nexinfra Authority",
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, "users", uid), adminProfile, { merge: true });
      return adminProfile;
    }

    if (email === "officer.demo@nexinfra.gov") {
      const officerProfile = {
        uid,
        name: firebaseUser.displayName || "Er. Rajesh Mehra (Zonal Officer)",
        email: firebaseUser.email,
        role: "officer",
        department: "Road Works & Asphalt Pavement Division",
        ward: "Central District - Ward 4 (Civic Centre)",
        badgeNo: "MCD-OFF-8842",
        phone: "+91 98112-45201",
        clearance: "Municipal Zonal Engineering Officer",
        organization: "Municipal Infrastructure Authority",
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, "users", uid), officerProfile, { merge: true });
      return officerProfile;
    }

    if (email === "citizen.demo@nexinfra.org") {
      const citizenProfile = {
        uid,
        name: firebaseUser.displayName || "Aarav Sharma (Resident Citizen)",
        email: firebaseUser.email,
        role: "public",
        department: "Resident Citizen Services",
        ward: "South Zone - Ward 14",
        clearance: "Public Citizen Level 1",
        organization: "Public Citizen",
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, "users", uid), citizenProfile, { merge: true });
      return citizenProfile;
    }

    // 3. Default New Registered User (Always public unless explicitly elevated in Firestore)
    const defaultProfile = {
      uid,
      name: firebaseUser.displayName || "Resident Citizen",
      email: firebaseUser.email,
      role: "public",
      department: "Resident Public",
      ward: "Central District",
      clearance: "Public Citizen Level 1",
      organization: "Public Citizen",
      createdAt: serverTimestamp(),
    };

    await setDoc(doc(db, "users", uid), defaultProfile, { merge: true });
    return defaultProfile;

  } catch (error) {
    console.error("Error in resolveUserWithRole:", error);
    return {
      uid: firebaseUser.uid,
      name: firebaseUser.displayName || "Resident Citizen",
      email: firebaseUser.email,
      role: "public"
    };
  }
}

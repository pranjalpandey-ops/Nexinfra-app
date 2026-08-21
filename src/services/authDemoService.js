import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import { resolveUserWithRole } from "./userService";

export const DEMO_ACCOUNTS = {
  officer: {
    email: "officer.demo@nexinfra.gov",
    password: "OfficerPassword123!",
    name: "Er. Rajesh Mehra (Zonal Officer)",
    role: "officer",
    department: "Road Works & Asphalt Pavement Division",
    ward: "Central District - Ward 4 (Civic Centre)",
    badgeNo: "MCD-OFF-8842",
    phone: "+91 98112-45201",
    clearance: "Municipal Zonal Engineering Officer",
    organization: "Municipal Infrastructure Authority",
  },
  admin: {
    email: "admin@nexinfra.gov",
    password: "AdminPassword123!",
    name: "Command Operator Alpha",
    role: "admin",
    department: "Grid Operations & Safety",
    ward: "Central District",
    clearance: "Level 3 Executive Command",
    organization: "Nexinfra Authority",
  },
  citizen: {
    email: "citizen.demo@nexinfra.org",
    password: "CitizenPassword123!",
    name: "Aarav Sharma (Resident Citizen)",
    role: "public",
    department: "Citizen Services",
    ward: "South Zone - Ward 14",
    clearance: "Public Citizen Level 1",
    organization: "Public Citizen",
  }
};

/**
 * Authenticates or automatically provisions the demo account in Firebase
 */
export async function authenticateOrProvisionDemo(accountKey = "officer") {
  const account = DEMO_ACCOUNTS[accountKey] || DEMO_ACCOUNTS.officer;

  try {
    // 1. Try Signing in first
    const userCredential = await signInWithEmailAndPassword(
      auth,
      account.email,
      account.password
    );

    const userProfile = await resolveUserWithRole(userCredential.user);
    return { success: true, userProfile, user: userCredential.user };
  } catch (error) {
    if (
      error.code === "auth/user-not-found" ||
      error.code === "auth/invalid-credential" ||
      error.code === "auth/invalid-login-credentials"
    ) {
      try {
        // 2. Create the demo user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          account.email,
          account.password
        );

        await updateProfile(userCredential.user, {
          displayName: account.name,
        });

        // 3. Save profile in Firestore
        const profilePayload = {
          uid: userCredential.user.uid,
          name: account.name,
          email: account.email,
          role: account.role,
          department: account.department,
          ward: account.ward,
          badgeNo: account.badgeNo || null,
          phone: account.phone || null,
          clearance: account.clearance,
          organization: account.organization,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        await setDoc(doc(db, "users", userCredential.user.uid), profilePayload, {
          merge: true,
        });

        return {
          success: true,
          userProfile: profilePayload,
          user: userCredential.user,
        };
      } catch (createErr) {
        console.error("Auto-provision creation error:", createErr);
        return { success: false, error: createErr.message };
      }
    }

    return { success: false, error: error.message };
  }
}

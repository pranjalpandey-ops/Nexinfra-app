import {
  collection,
  doc,
  addDoc,
  updateDoc,
  setDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * Submit a new Admin Access Request requiring existing admin approval
 */
export async function createAdminRequest({
  uid,
  email,
  name,
  organization,
  department,
  clearance,
  justification
}) {
  try {
    const docRef = await addDoc(collection(db, "admin_requests"), {
      uid,
      email,
      name,
      organization: organization || "Municipal Infrastructure Authority",
      department: department || "Grid Operations & Safety",
      clearance: clearance || "Level 2 Tactical Supervisor",
      justification: justification || "Operational administration requirement",
      status: "pending", // pending | approved | rejected
      createdAt: serverTimestamp(),
    });

    // Also update user's profile with pending request flag
    await updateDoc(doc(db, "users", uid), {
      role: "pending_admin",
      adminRequestId: docRef.id,
      adminRequestStatus: "pending",
      updatedAt: serverTimestamp()
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating admin request:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Real-time listener for admin requests (accessible to predefined admins)
 */
export function subscribeToAdminRequests(callback) {
  const q = query(
    collection(db, "admin_requests"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const requests = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      callback(requests);
    },
    (error) => {
      console.error("Error subscribing to admin requests:", error);
      callback([]);
    }
  );
}

/**
 * Predefined Admin approves an admin clearance request
 */
export async function approveAdminRequest(requestId, targetUid, approvedByEmail) {
  try {
    // 1. Update request status
    await updateDoc(doc(db, "admin_requests", requestId), {
      status: "approved",
      approvedBy: approvedByEmail || "Predefined Admin",
      approvedAt: serverTimestamp(),
    });

    // 2. Elevate user role in Firestore
    await setDoc(
      doc(db, "users", targetUid),
      {
        role: "admin",
        clearance: "Level 3 Executive Command Authority",
        adminRequestStatus: "approved",
        approvedAt: serverTimestamp(),
        approvedBy: approvedByEmail,
      },
      { merge: true }
    );

    return { success: true };
  } catch (error) {
    console.error("Error approving admin request:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Predefined Admin rejects an admin clearance request
 */
export async function rejectAdminRequest(requestId, targetUid, rejectedByEmail) {
  try {
    // 1. Update request status
    await updateDoc(doc(db, "admin_requests", requestId), {
      status: "rejected",
      rejectedBy: rejectedByEmail || "Predefined Admin",
      rejectedAt: serverTimestamp(),
    });

    // 2. Set user role to public in Firestore
    await setDoc(
      doc(db, "users", targetUid),
      {
        role: "public",
        clearance: "Public Citizen Level 1",
        adminRequestStatus: "rejected",
        rejectedAt: serverTimestamp(),
        rejectedBy: rejectedByEmail,
      },
      { merge: true }
    );

    return { success: true };
  } catch (error) {
    console.error("Error rejecting admin request:", error);
    return { success: false, error: error.message };
  }
}

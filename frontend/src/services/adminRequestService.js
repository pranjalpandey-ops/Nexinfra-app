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
 * Submit a new Admin or Municipal Officer Access Request requiring existing admin approval
 */
export async function createAdminRequest({
  uid,
  email,
  name,
  organization,
  department,
  ward,
  badgeNo,
  phone,
  clearance,
  justification,
  requestType = "admin" // "admin" | "officer"
}) {
  try {
    const docRef = await addDoc(collection(db, "admin_requests"), {
      uid,
      email,
      name,
      requestType,
      organization: organization || (requestType === "officer" ? "Municipal Infrastructure Authority" : "Nexinfra Command"),
      department: department || "Grid Operations & Safety",
      ward: ward || "Central District - Ward 4 (Civic Centre)",
      badgeNo: badgeNo || `MCD-OFF-${Date.now().toString().slice(-4)}`,
      phone: phone || "+91 98000-00000",
      clearance: clearance || (requestType === "officer" ? "Municipal Zonal Engineering Officer" : "Level 2 Tactical Supervisor"),
      justification: justification || "Operational municipal administration requirement",
      status: "pending", // pending | approved | rejected
      createdAt: serverTimestamp(),
    });

    // Also update user's profile with pending request flag
    const pendingRole = requestType === "officer" ? "pending_officer" : "pending_admin";
    await updateDoc(doc(db, "users", uid), {
      role: pendingRole,
      department: department || "Grid Operations",
      ward: ward || "Central District - Ward 4 (Civic Centre)",
      adminRequestId: docRef.id,
      adminRequestStatus: "pending",
      updatedAt: serverTimestamp()
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating authorization request:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Real-time listener for admin and municipal officer onboarding requests
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
      // Gracefully fallback if non-admin or permissions are restricted
      callback([]);
    }
  );
}

/**
 * Admin approves an Admin or Municipal Officer clearance request
 */
export async function approveAdminRequest(requestId, targetUid, approvedByEmail, requestType = "admin", extraData = {}) {
  try {
    const isOfficer = requestType === "officer" || extraData.requestType === "officer";
    const assignedRole = isOfficer ? "officer" : "admin";
    const assignedClearance = isOfficer
      ? "Municipal Zonal Officer - Level 2"
      : "Level 3 Executive Command Authority";

    // 1. Update request status
    await updateDoc(doc(db, "admin_requests", requestId), {
      status: "approved",
      assignedRole,
      approvedBy: approvedByEmail || "System Admin",
      approvedAt: serverTimestamp(),
    });

    // 2. Elevate user role in Firestore
    await setDoc(
      doc(db, "users", targetUid),
      {
        role: assignedRole,
        clearance: assignedClearance,
        organization: extraData.organization || (isOfficer ? "Municipal Infrastructure Authority" : "Nexinfra Command Authority"),
        department: extraData.department || "Road Works & Infrastructure",
        ward: extraData.ward || "Central District - Ward 4",
        adminRequestStatus: "approved",
        approvedAt: serverTimestamp(),
        approvedBy: approvedByEmail,
      },
      { merge: true }
    );

    return { success: true, assignedRole };
  } catch (error) {
    console.error("Error approving authorization request:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Admin rejects a clearance request
 */
export async function rejectAdminRequest(requestId, targetUid, rejectedByEmail) {
  try {
    await updateDoc(doc(db, "admin_requests", requestId), {
      status: "rejected",
      rejectedBy: rejectedByEmail || "System Admin",
      rejectedAt: serverTimestamp(),
    });

    await updateDoc(doc(db, "users", targetUid), {
      role: "public",
      adminRequestStatus: "rejected",
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error rejecting authorization request:", error);
    return { success: false, error: error.message };
  }
}

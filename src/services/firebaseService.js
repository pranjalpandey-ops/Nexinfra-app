import {
  collection,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  getDoc,
  doc,
  where,
  limit,
} from "firebase/firestore";
import { db } from "../firebase";

// ============ COMPLAINTS/INCIDENTS ============

/**
 * Real-time listener for all complaints
 */
export const subscribeToComplaints = (callback) => {
  const q = query(
    collection(db, "complaints"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const complaints = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(complaints);
    },
    (error) => {
      console.error("Firestore Error:", error);
      callback([]);
    }
  );
};

/**
 * Get all complaints once
 */
export const getAllComplaints = async () => {
  try {
    const q = query(
      collection(db, "complaints"),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching complaints:", error);
    throw error;
  }
};

/**
 * Get single complaint by ID
 */
export const getComplaintById = async (complaintId) => {
  try {
    const docRef = doc(db, "complaints", complaintId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching complaint:", error);
    throw error;
  }
};

/**
 * Get complaints by priority
 */
export const getComplaintsByPriority = async (priority) => {
  try {
    const q = query(
      collection(db, "complaints"),
      where("priority", "==", priority),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching complaints by priority:", error);
    throw error;
  }
};

/**
 * Get complaints by status
 */
export const getComplaintsByStatus = async (status) => {
  try {
    const q = query(
      collection(db, "complaints"),
      where("status", "==", status),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching complaints by status:", error);
    throw error;
  }
};

/**
 * Get complaints by category
 */
export const getComplaintsByCategory = async (category) => {
  try {
    const q = query(
      collection(db, "complaints"),
      where("category", "==", category),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching complaints by category:", error);
    throw error;
  }
};

// ============ USERS/PROFILES ============

/**
 * Get user profile
 */
export const getUserProfile = async (userId) => {
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

/**
 * Real-time listener for user profile
 */
export const subscribeToUserProfile = (userId, callback) => {
  const docRef = doc(db, "users", userId);
  return onSnapshot(
    docRef,
    (doc) => {
      if (doc.exists()) {
        callback({
          id: doc.id,
          ...doc.data(),
        });
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error("Error fetching user profile:", error);
      callback(null);
    }
  );
};

// ============ DRONES ============

/**
 * Get all drones
 */
export const getAllDrones = async () => {
  try {
    const snapshot = await getDocs(collection(db, "drones"));
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching drones:", error);
    throw error;
  }
};

/**
 * Real-time listener for all drones
 */
export const subscribeToDrones = (callback) => {
  const q = query(collection(db, "drones"), orderBy("name"));
  return onSnapshot(
    q,
    (snapshot) => {
      const drones = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(drones);
    },
    (error) => {
      console.error("Error fetching drones:", error);
      callback([]);
    }
  );
};

/**
 * Get drone by ID
 */
export const getDroneById = async (droneId) => {
  try {
    const docRef = doc(db, "drones", droneId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching drone:", error);
    throw error;
  }
};

// ============ ANALYTICS/DASHBOARD ============

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async () => {
  try {
    const snapshot = await getDocs(collection(db, "stats"));
    if (snapshot.docs.length > 0) {
      return {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data(),
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};

/**
 * Real-time listener for dashboard statistics
 */
export const subscribeToDashboardStats = (callback) => {
  const q = query(collection(db, "stats"));
  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.docs.length > 0) {
        callback({
          id: snapshot.docs[0].id,
          ...snapshot.docs[0].data(),
        });
      }
    },
    (error) => {
      console.error("Error fetching dashboard stats:", error);
    }
  );
};

// ============ GENERIC COLLECTION FETCHING ============

/**
 * Get all documents from any collection
 */
export const getAllFromCollection = async (collectionName) => {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error(`Error fetching from ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Get document from any collection by ID
 */
export const getFromCollection = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching from ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Real-time listener for any collection
 */
export const subscribeToCollection = (collectionName, callback) => {
  const q = query(collection(db, collectionName));
  return onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(data);
    },
    (error) => {
      console.error(`Error fetching from ${collectionName}:`, error);
      callback([]);
    }
  );
};

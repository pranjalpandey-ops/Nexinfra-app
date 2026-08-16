import {
  collection,
  onSnapshot,
} from "firebase/firestore";

import { db } from "../firebase";

export function subscribeToDashboard(callback) {
  return onSnapshot(collection(db, "complaints"), (snapshot) => {
    const complaints = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const today = new Date().toDateString();

    const stats = {
      total: complaints.length,
      pending: complaints.filter(c => c.status === "Pending").length,
      inProgress: complaints.filter(c => c.status === "In Progress").length,
      resolved: complaints.filter(c => c.status === "Resolved").length,
      today: complaints.filter(c => {
        if (!c.createdAt?.seconds) return false;
        return new Date(c.createdAt.seconds * 1000).toDateString() === today;
      }).length,
      recent: complaints.slice(0, 5),
    };

    callback(stats);
  });
}
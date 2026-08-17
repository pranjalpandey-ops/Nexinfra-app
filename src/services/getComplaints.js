import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";

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
    }
  );
};
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export async function createComplaint(complaintData) {
  try {
    const docRef = await addDoc(collection(db, "complaints"), {
      ...complaintData,
      status: complaintData.status || "AI Verified",
      priority: complaintData.priority || "P1",
      createdAt: serverTimestamp(),
    });

    return {
      success: true,
      id: docRef.id,
    };
  } catch (error) {
    console.error("Firestore Error:", error);

    return {
      success: false,
      error: error.message,
    };
  }
}
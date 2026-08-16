import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export async function updateComplaintStatus(id, status) {
  try {
    await updateDoc(doc(db, "complaints", id), {
      status,
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: error.message };
  }
}
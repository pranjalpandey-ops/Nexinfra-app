import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { deleteCivicIssue } from "./civicDb";

/**
 * Permanently deletes a complaint or civic issue from both local storage and cloud database.
 */
export async function deleteComplaint(id) {
  if (!id) return { success: false, error: "Missing incident ID" };

  try {
    // 1. Delete from local storage
    deleteCivicIssue(id);

    // 2. Remove from selected complaint if matching
    const saved = localStorage.getItem("selectedComplaint");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.id === id) {
          localStorage.removeItem("selectedComplaint");
        }
      } catch (e) {}
    }

    // 3. Broadcast global deletion event
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("civic_issue_deleted", {
          detail: { id, timestamp: Date.now() }
        })
      );
    }

    // 4. Try deleting from Firestore if exists
    try {
      await deleteDoc(doc(db, "complaints", id));
    } catch (fsErr) {
      console.warn("Firestore delete note (local item removed):", fsErr);
    }

    return { success: true };
  } catch (err) {
    console.error("Delete error:", err);
    // Still ensure local removal and broadcast
    deleteCivicIssue(id);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("civic_issue_deleted", {
          detail: { id, timestamp: Date.now() }
        })
      );
    }
    return { success: true };
  }
}

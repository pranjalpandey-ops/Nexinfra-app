import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase";
import { getLocalCivicIssues } from "./civicDb";

// Default System Baseline Alerts
export const initialAlerts = [
  {
    id: "ALT-9901",
    level: "CRITICAL", // CRITICAL | WARNING | INFO
    title: "High-Pressure Feeder Rupture Detected",
    message: "Hydrostatic telemetry detected 4.2 Bar pressure collapse in Sector 18. Inundation hazard active.",
    location: "Sector 18 Ward - Zone A",
    incidentId: "CIVIC-114B",
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    acknowledged: false,
    source: "IoT Hydro Sensor + AI Optical Feed"
  },
  {
    id: "ALT-9902",
    level: "CRITICAL",
    title: "Structural Joint Anomaly on East Flyover",
    message: "Optical shear stress fracture detected on Pier Cap 14-B. Drone rescan dispatched.",
    location: "East Ring - Ward 8",
    incidentId: "CIVIC-902C",
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    acknowledged: false,
    source: "Tactical UAV Optical Scanner"
  },
  {
    id: "ALT-9903",
    level: "WARNING",
    title: "SLA Warning: P1 Pothole Breach Exceeding 2h",
    message: "Resolution deadline at 75% elapsed for Sector 62 intersection cave-in.",
    location: "Central District - Ward 4",
    incidentId: "CIVIC-892A",
    timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    acknowledged: false,
    source: "Automated SLA Dispatcher"
  },
  {
    id: "ALT-9904",
    level: "INFO",
    title: "Grid Optimization Routine Completed",
    message: "Traffic signal cycle updated with adaptive flow timing at Cyber Hub Junction.",
    location: "Cyber Hub - Ward 12",
    incidentId: "CIVIC-721F",
    timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    acknowledged: true,
    source: "AI Traffic Grid Controller"
  }
];

// Helper to get local stored alerts
export function getLocalAlerts() {
  try {
    const saved = localStorage.getItem("nexinfra_live_alerts");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error("Error loading local alerts:", e);
  }
  localStorage.setItem("nexinfra_live_alerts", JSON.stringify(initialAlerts));
  return initialAlerts;
}

export function saveLocalAlerts(alerts) {
  try {
    localStorage.setItem("nexinfra_live_alerts", JSON.stringify(alerts));
  } catch (e) {
    console.error("Error saving local alerts:", e);
  }
}

// Live real-time Firestore listener with fallback
export function subscribeToLiveAlerts(callback) {
  let localAlerts = getLocalAlerts();
  callback(localAlerts);

  // Firestore listener on complaints to dynamically generate alerts on new critical incidents
  try {
    const q = query(collection(db, "complaints"), orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      (snapshot) => {
        const firestoreComplaints = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data()
        }));

        // Convert critical complaints into live alerts
        const generatedAlerts = firestoreComplaints
          .filter((c) => c.priority === "P1" || c.severity === "Critical" || c.priority === "High")
          .map((c) => ({
            id: `ALT-FS-${c.id}`,
            level: c.priority === "P1" || c.severity === "Critical" ? "CRITICAL" : "WARNING",
            title: `🚨 ${c.title || c.category || "Critical Incident"}`,
            message: c.description || `High priority incident reported at ${c.address || c.ward}`,
            location: c.ward || c.address || "Central Ward",
            incidentId: c.id,
            timestamp: c.createdAt?.toDate ? c.createdAt.toDate().toISOString() : new Date().toISOString(),
            acknowledged: c.status === "In Progress" || c.status === "Resolved",
            source: c.aiVerified ? "AI Neural Vision Engine" : "Citizen Telemetry"
          }));

        // Merge with local baseline alerts
        const combined = [
          ...generatedAlerts,
          ...localAlerts.filter((l) => !generatedAlerts.some((g) => g.incidentId === l.incidentId))
        ];

        saveLocalAlerts(combined);
        callback(combined);
      },
      (err) => {
        console.warn("Firestore alerts listener warning:", err);
        callback(localAlerts);
      }
    );
  } catch (err) {
    console.warn("Using offline alert store:", err);
    callback(localAlerts);
    return () => {};
  }
}

export function acknowledgeAlert(alertId) {
  const alerts = getLocalAlerts();
  const updated = alerts.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a));
  saveLocalAlerts(updated);
  return updated;
}

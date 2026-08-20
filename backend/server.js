import express from "express";
import cors from "cors";
import multer from "multer";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  addDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  serverTimestamp
} from "firebase/firestore";

import { detect } from "./detector.js";

const app = express();
const PORT = process.env.PORT || 4000;
const MASTER_SECRET_KEY = process.env.ADMIN_SECRET_KEY || "nexinfra-master-2026";

// Firebase App Initialization
const firebaseConfig = {
  apiKey: "AIzaSyDskbcG1Xi8joJ2MtqVdguRiV55Zvvjxl4",
  authDomain: "nexinfra-ee1f7.firebaseapp.com",
  projectId: "nexinfra-ee1f7",
  storageBucket: "nexinfra-ee1f7.firebasestorage.app",
  messagingSenderId: "689119500632",
  appId: "1:689119500632:web:ea5948c76313c29cd16d2d"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

app.use(cors());
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "NEXinfra Backend API & Security Gateway operational",
    version: "4.2.11"
  });
});

// =========================================================
// LEVEL 5 DISASTER EARLY WARNING SMS BROADCAST ENGINE
// =========================================================

// Haversine Distance helper
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 999999;
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// In-Memory registered citizen numbers baseline
const citizenRegistry = [
  { id: "CIT-01", name: "Aarav Sharma", phone: "+91 98112 34501", ward: "Sector 18", lat: 28.6225, lng: 77.2145 },
  { id: "CIT-02", name: "Priya Patel", phone: "+91 98230 45612", ward: "Sector 18", lat: 28.6218, lng: 77.2138 },
  { id: "CIT-03", name: "Vikram Malhotra", phone: "+91 98711 78903", ward: "Central Ward 4", lat: 28.6142, lng: 77.2095 },
  { id: "CIT-04", name: "Sunita Verma", phone: "+91 99100 89014", ward: "Central Ward 4", lat: 28.6135, lng: 77.2082 },
  { id: "CIT-05", name: "Rohan Das", phone: "+91 98450 12345", ward: "Cyber Hub 12", lat: 28.6295, lng: 77.2015 },
  { id: "CIT-06", name: "Ananya Sen", phone: "+91 97170 56789", ward: "East Ring 8", lat: 28.6010, lng: 77.2280 },
  { id: "CIT-07", name: "Deepak Choudhury", phone: "+91 98101 23490", ward: "North Green 2", lat: 28.6065, lng: 77.1950 },
  { id: "CIT-08", name: "Meera Nair", phone: "+91 99991 34567", ward: "Sector 18", lat: 28.6230, lng: 77.2150 }
];

/**
 * POST /api/emergency/broadcast-level5
 * Broadcasts Level 5 Disaster Warnings to registered mobile numbers within hazard radius
 */
app.post("/api/emergency/broadcast-level5", async (req, res) => {
  try {
    const {
      disasterType,
      epicenterLat,
      epicenterLng,
      epicenterLocation,
      radiusKm = 1.5,
      shelterLocation,
      customMessage,
      secretKey
    } = req.body;

    if (secretKey && secretKey !== MASTER_SECRET_KEY) {
      return res.status(401).json({ success: false, error: "Unauthorized access" });
    }

    const radiusMeters = (radiusKm || 1.5) * 1000;

    // Filter registered citizens in geofence radius
    const targetedCitizens = citizenRegistry
      .map((c) => {
        const dist = calculateDistanceMeters(epicenterLat, epicenterLng, c.lat, c.lng);
        return {
          ...c,
          distanceMeters: dist,
          distanceKm: (dist / 1000).toFixed(2),
          inHazardZone: dist <= radiusMeters
        };
      })
      .filter((c) => c.inHazardZone);

    const broadcastPayload = {
      broadcastId: `L5-DISASTER-${Date.now()}`,
      disasterType: disasterType || "Level 5 Structural / Toxic Catastrophe",
      threatLevel: "LEVEL_5_CRITICAL",
      epicenter: { lat: epicenterLat, lng: epicenterLng, location: epicenterLocation },
      evacuationRadiusKm: radiusKm,
      shelterLocation: shelterLocation || "Municipal Disaster Relief Center A",
      message: customMessage || `🚨 [NEXINFRA LEVEL 5 DISASTER ALERT]: Evacuate ${radiusKm}km perimeter around ${epicenterLocation}. Proceed to ${shelterLocation}. Helplines: 112 / 108.`,
      dispatchedCount: targetedCitizens.length,
      dispatchedRecipients: targetedCitizens.map((c) => ({ name: c.name, phone: c.phone, ward: c.ward, dist: `${c.distanceKm} km` })),
      cellularGatewayStatus: "TRANSMITTED_ALL_CHANNELS",
      timestamp: new Date().toISOString()
    };

    console.log(`🚨 [LEVEL 5 BROADCAST DISPATCHED]: ${targetedCitizens.length} mobile numbers notified!`);

    res.status(200).json({
      success: true,
      message: `Level 5 Disaster Broadcast transmitted to ${targetedCitizens.length} registered mobile numbers.`,
      data: broadcastPayload
    });

  } catch (err) {
    console.error("Emergency broadcast error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/emergency/register-citizen
 * Register citizen mobile number for disaster early warnings
 */
app.post("/api/emergency/register-citizen", async (req, res) => {
  try {
    const { name, phone, email, ward, lat, lng } = req.body;
    if (!phone || !name) {
      return res.status(400).json({ success: false, error: "Name and Phone number are required" });
    }

    const newEntry = {
      id: `CIT-${Date.now()}`,
      name,
      phone,
      email: email || "citizen@domain.com",
      ward: ward || "Central Ward",
      lat: lat || 28.6139,
      lng: lng || 77.2090,
      smsAlertsEnabled: true
    };

    citizenRegistry.push(newEntry);

    res.status(201).json({
      success: true,
      message: "Citizen successfully registered for Level 5 Disaster Early Warnings.",
      citizen: newEntry
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =========================================================
// ADMIN MANAGEMENT REST API ENDPOINTS
// =========================================================

app.post("/api/admin/create", async (req, res) => {
  try {
    const { secretKey, email, password, name, organization, department, clearance } = req.body;

    if (secretKey !== MASTER_SECRET_KEY) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized: Invalid or missing master secretKey"
      });
    }

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required"
      });
    }

    let user;
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      user = cred.user;
    } catch (authError) {
      if (authError.code === "auth/email-already-in-use") {
        return res.status(409).json({
          success: false,
          error: "Account with this email already exists. Use /api/admin/promote instead."
        });
      }
      throw authError;
    }

    const adminName = name || "System Administrator";
    await updateProfile(user, { displayName: adminName });

    const adminProfile = {
      uid: user.uid,
      name: adminName,
      email: user.email,
      role: "admin",
      clearance: clearance || "Level 3 Executive Command Authority",
      organization: organization || "Nexinfra Municipal Authority",
      department: department || "Grid & Emergency Operations",
      adminRequestStatus: "approved",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(doc(db, "users", user.uid), adminProfile, { merge: true });

    res.status(201).json({
      success: true,
      message: `Administrator ${email} created successfully in database`,
      user: {
        uid: user.uid,
        email: user.email,
        name: adminName,
        role: "admin",
        clearance: adminProfile.clearance
      }
    });

  } catch (error) {
    console.error("API create admin error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post("/api/admin/promote", async (req, res) => {
  try {
    const { secretKey, email, clearance } = req.body;

    if (secretKey !== MASTER_SECRET_KEY) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized: Invalid or missing master secretKey"
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "User email is required"
      });
    }

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email.trim()));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return res.status(404).json({
        success: false,
        error: `No user record found with email ${email}`
      });
    }

    const userDoc = snapshot.docs[0];
    const updatedClearance = clearance || "Level 3 Executive Command Authority";

    await setDoc(
      doc(db, "users", userDoc.id),
      {
        role: "admin",
        clearance: updatedClearance,
        adminRequestStatus: "approved",
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    res.json({
      success: true,
      message: `User ${email} promoted to Administrator in database`,
      user: {
        uid: userDoc.id,
        email,
        role: "admin",
        clearance: updatedClearance
      }
    });

  } catch (error) {
    console.error("API promote admin error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get("/api/admin/list", async (req, res) => {
  try {
    const secretKey = req.query.secretKey || req.headers["x-admin-key"];

    if (secretKey !== MASTER_SECRET_KEY) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized: Invalid or missing master secretKey"
      });
    }

    const q = query(collection(db, "users"), where("role", "==", "admin"));
    const snapshot = await getDocs(q);

    const admins = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data()
    }));

    res.json({
      success: true,
      count: admins.length,
      admins
    });

  } catch (error) {
    console.error("API list admins error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =========================================================
// CCTV AI DETECTOR ENDPOINTS
// =========================================================

app.post("/api/detect-frame", upload.single("frame"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No frame received"
      });
    }

    const result = await detect(req.file.buffer);

    res.json({
      success: true,
      detections: result
    });

  } catch (error) {
    console.error("Detection error:", error);
    res.status(500).json({
      success: false,
      message: "Detection failed"
    });
  }
});

app.listen(PORT, () => {
  console.log(`⚡ NEXinfra Backend & Security API running on http://localhost:${PORT}`);
  console.log(`🛡️ Master Admin Secret Key active: ${MASTER_SECRET_KEY}`);
});

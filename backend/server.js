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
// ADMIN MANAGEMENT REST API ENDPOINTS
// =========================================================

/**
 * POST /api/admin/create
 * Creates a brand new administrator in Firebase Auth & Firestore DB
 */
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

/**
 * POST /api/admin/promote
 * Elevates an existing user to Administrator status by email
 */
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

/**
 * GET /api/admin/list
 * Returns all registered administrators
 */
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

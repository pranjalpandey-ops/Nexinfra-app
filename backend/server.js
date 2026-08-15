import express from "express";
import cors from "cors";
import multer from "multer";
import { detect } from "./detector.js";

const app = express();

const PORT = 4000;

app.use(cors());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "NEXinfra backend is running"
  });
});

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
  console.log(`NEXinfra backend running on http://localhost:${PORT}`);
});
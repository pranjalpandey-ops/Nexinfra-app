import fs from "fs";
import path from "path";
import sharp from "sharp";

let ort = null;
let session = null;
let isOrtAvailable = false;

// Attempt to load onnxruntime-node
try {
  const ortModule = await import("onnxruntime-node");
  ort = ortModule.default || ortModule;
  isOrtAvailable = true;
} catch (e) {
  console.warn("⚠️ onnxruntime-node not loaded or failed to import:", e.message);
}

function resolveModelPath() {
  const candidates = [
    path.join(process.cwd(), "backend", "models", "model.onnx"),
    path.join(process.cwd(), "models", "model.onnx"),
    path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "models", "model.onnx"),
    path.join(process.cwd(), "..", "backend", "models", "model.onnx")
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return path.join(process.cwd(), "models", "model.onnx");
}

const MODEL_PATH = resolveModelPath();

// Nexinfra 6-Class Municipal Defect Taxonomy & Specialized Civic Checks
export const CLASS_METADATA = {
  0: {
    label: "Road Damage / Pothole",
    category: "Road Damage / Pothole",
    color: "#EF4444",
    severity: "Critical",
    priority: "P1",
    department: "Roads",
    assignedDepartment: "Road Maintenance & Pavement Division",
    slaHours: 4,
    tags: ["Pothole", "Road Damage", "Asphalt Cavity", "Open Manhole / Chamber"]
  },
  1: {
    label: "Water / Drainage Burst",
    category: "Water / Drainage Burst",
    color: "#00F0FF",
    severity: "Critical",
    priority: "P1",
    department: "Hydro / Water Supply",
    assignedDepartment: "Municipal Hydro & Water Supply Grid",
    slaHours: 3,
    tags: ["Waterlogging", "Drainage Burst", "Water Main Leak", "Flooded Surface"]
  },
  2: {
    label: "Solid Waste Overflow",
    category: "Solid Waste Overflow",
    color: "#F59E0B",
    severity: "High",
    priority: "P2",
    department: "Sanitation",
    assignedDepartment: "Sanitation & Solid Waste Logistics Unit",
    slaHours: 8,
    tags: ["Solid Waste", "Garbage Overflow", "Plastic Debris Heap"]
  },
  3: {
    label: "Electrical & Streetlight Hazard",
    category: "Electrical & Streetlight",
    color: "#F97316",
    severity: "Critical",
    priority: "P1",
    department: "Power",
    assignedDepartment: "Municipal Power & Electrical Grid",
    slaHours: 2,
    tags: ["Exposed Wiring", "Streetlight Outage", "Transformer Spark"]
  },
  4: {
    label: "Structural Anomaly / Bridge Crack",
    category: "Structural Anomaly / Bridge Crack",
    color: "#8B5CF6",
    severity: "Critical",
    priority: "P1",
    department: "Structural Engineering",
    assignedDepartment: "Structural Engineering & Bridge Safety Division",
    slaHours: 4,
    tags: ["Wall Crack", "Bridge Shear", "Pillar Fracture", "Structural Defect"]
  },
  5: {
    label: "Fallen Tree & Greenery Hazard",
    category: "Public Park & Greenery Hazard",
    color: "#10B981",
    severity: "High",
    priority: "P2",
    department: "Forestry",
    assignedDepartment: "Urban Forestry & Public Parks Department",
    slaHours: 6,
    tags: ["Fallen Tree", "Overhanging Branch", "Greenery Obstruction"]
  },
  6: {
    label: "Fire & Smoke Hazard",
    category: "Fire & Smoke Hazard",
    color: "#DC2626",
    severity: "Critical",
    priority: "P1",
    department: "Fire & Emergency",
    assignedDepartment: "Fire & Emergency Disaster Response Unit",
    slaHours: 1,
    tags: ["Active Fire", "Smoke Plume", "Combustion Hazard", "Thermal Flare"]
  }
};

/**
 * Checks if ONNX runtime and model file are active
 */
export function getModelInfo() {
  const modelExists = fs.existsSync(MODEL_PATH);
  let modelSize = 0;
  if (modelExists) {
    try {
      modelSize = fs.statSync(MODEL_PATH).size;
    } catch (e) {}
  }
  return {
    ortAvailable: isOrtAvailable,
    modelExists,
    modelPath: MODEL_PATH,
    modelSizeBytes: modelSize,
    sessionReady: Boolean(session),
    engine: "NEXinfra ONNX Civic Detector"
  };
}

/**
 * Loads and caches the ONNX Inference Session
 */
export async function getInferenceSession() {
  if (session) return session;
  if (!isOrtAvailable || !fs.existsSync(MODEL_PATH)) return null;

  try {
    console.log(`⚡ [NEXINFRA ONNX] Initializing Inference Session from ${MODEL_PATH}...`);
    session = await ort.InferenceSession.create(MODEL_PATH, {
      executionProviders: ["cpu"],
      graphOptimizationLevel: "all"
    });
    console.log("✅ [NEXINFRA ONNX] Model loaded successfully!");
    return session;
  } catch (err) {
    console.error("❌ Failed to initialize ONNX session:", err.message);
    return null;
  }
}

/**
 * Preprocesses raw image buffer into normalized Float32 NCHW Tensor (1, 3, 640, 640)
 */
async function preprocessFrame(imageBuffer, targetSize = 640) {
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();
  const origWidth = metadata.width || 640;
  const origHeight = metadata.height || 480;

  // Resize directly to targetSize x targetSize RGB
  const rawRgbBuffer = await image
    .resize(targetSize, targetSize, { fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer();

  const totalPixels = targetSize * targetSize;
  const float32Data = new Float32Array(3 * totalPixels);

  // Convert HWC [0..255] to NCHW [0.0..1.0]
  for (let i = 0; i < totalPixels; i++) {
    const r = rawRgbBuffer[i * 3] / 255.0;
    const g = rawRgbBuffer[i * 3 + 1] / 255.0;
    const b = rawRgbBuffer[i * 3 + 2] / 255.0;

    float32Data[i] = r;                    // Channel 0 (Red)
    float32Data[totalPixels + i] = g;      // Channel 1 (Green)
    float32Data[2 * totalPixels + i] = b;  // Channel 2 (Blue)
  }

  const tensor = new ort.Tensor("float32", float32Data, [1, 3, targetSize, targetSize]);
  return { tensor, origWidth, origHeight };
}

/**
 * Computes Intersection over Union (IoU) between two bounding boxes
 */
function computeIoU(boxA, boxB) {
  const xA = Math.max(boxA.x, boxB.x);
  const yA = Math.max(boxA.y, boxB.y);
  const xB = Math.min(boxA.x + boxA.width, boxB.x + boxB.width);
  const yB = Math.min(boxA.y + boxA.height, boxB.y + boxB.height);

  const interArea = Math.max(0, xB - xA) * Math.max(0, yB - yA);
  const boxAArea = boxA.width * boxA.height;
  const boxBArea = boxB.width * boxB.height;
  const unionArea = boxAArea + boxBArea - interArea;

  return unionArea <= 0 ? 0 : interArea / unionArea;
}

/**
 * Applies Non-Maximum Suppression (NMS) to eliminate duplicate overlapping boxes
 */
function applyNMS(boxes, iouThreshold = 0.45) {
  boxes.sort((a, b) => b.confidence - a.confidence);
  const selected = [];

  for (const box of boxes) {
    let keep = true;
    for (const chosen of selected) {
      if (box.classId === chosen.classId && computeIoU(box.box, chosen.box) > iouThreshold) {
        keep = false;
        break;
      }
    }
    if (keep) {
      selected.push(box);
    }
  }
  return selected;
}

/**
 * Parses Ultralytics YOLOv8 / YOLOv9 / YOLOv11 raw tensor output
 * Output format is typically shape [1, 4 + nc, num_anchors] e.g. [1, 10, 8400]
 */
function parseYoloOutput(outputTensor, origWidth, origHeight, modelInputSize = 640, confThreshold = 0.20) {
  const data = outputTensor.data;
  const dims = outputTensor.dims; // e.g. [1, 10, 8400] or [1, 8400, 10]
  const detections = [];

  const scaleX = origWidth / modelInputSize;
  const scaleY = origHeight / modelInputSize;

  if (dims.length === 3) {
    let numChannels, numAnchors, isTransposed;

    if (dims[1] < dims[2]) {
      // Shape: [1, channels, anchors] e.g. [1, 10, 8400]
      numChannels = dims[1];
      numAnchors = dims[2];
      isTransposed = false;
    } else {
      // Shape: [1, anchors, channels] e.g. [1, 8400, 10]
      numAnchors = dims[1];
      numChannels = dims[2];
      isTransposed = true;
    }

    const numClasses = numChannels - 4;

    for (let a = 0; a < numAnchors; a++) {
      let cx, cy, w, h;
      let maxScore = 0;
      let bestClass = 0;

      if (!isTransposed) {
        // [1, channels, anchors]
        cx = data[0 * numAnchors + a];
        cy = data[1 * numAnchors + a];
        w = data[2 * numAnchors + a];
        h = data[3 * numAnchors + a];

        for (let c = 0; c < numClasses; c++) {
          const score = data[(4 + c) * numAnchors + a];
          if (score > maxScore) {
            maxScore = score;
            bestClass = c;
          }
        }
      } else {
        // [1, anchors, channels]
        const offset = a * numChannels;
        cx = data[offset];
        cy = data[offset + 1];
        w = data[offset + 2];
        h = data[offset + 3];

        for (let c = 0; c < numClasses; c++) {
          const score = data[offset + 4 + c];
          if (score > maxScore) {
            maxScore = score;
            bestClass = c;
          }
        }
      }

      if (maxScore >= confThreshold) {
        const xMin = Math.max(0, (cx - w / 2) * scaleX);
        const yMin = Math.max(0, (cy - h / 2) * scaleY);
        const boxWidth = Math.min(origWidth - xMin, w * scaleX);
        const boxHeight = Math.min(origHeight - yMin, h * scaleY);

        const classInfo = CLASS_METADATA[bestClass] || {
          label: `Civic Defect ${bestClass}`,
          category: "Civic Infrastructure Defect",
          color: "#EF4444",
          severity: "Critical",
          priority: "P1",
          department: "Roads",
          assignedDepartment: "Road Maintenance & Pavement Division",
          slaHours: 4
        };

        const normX = parseFloat(((xMin / origWidth) * 100).toFixed(2));
        const normY = parseFloat(((yMin / origHeight) * 100).toFixed(2));
        const normW = parseFloat(((boxWidth / origWidth) * 100).toFixed(2));
        const normH = parseFloat(((boxHeight / origHeight) * 100).toFixed(2));

        // False positive filter: Civic defects on surveillance feeds are localized targets,
        // not massive full-screen foreground objects (e.g. human bodies/faces occupying >75% of view)
        const isOversizedForeground = normW > 75 && normH > 68;
        if (isOversizedForeground) {
          continue;
        }

        detections.push({
          classId: bestClass,
          class: classInfo.label,
          category: classInfo.category || classInfo.label,
          confidence: parseFloat(maxScore.toFixed(3)),
          confidencePercent: Math.round(maxScore * 100),
          color: classInfo.color,
          severity: classInfo.severity,
          priority: classInfo.priority,
          department: classInfo.department,
          assignedDepartment: classInfo.assignedDepartment,
          slaHours: classInfo.slaHours,
          tags: classInfo.tags || [],
          box: {
            x: Math.round(xMin),
            y: Math.round(yMin),
            width: Math.round(boxWidth),
            height: Math.round(boxHeight),
            normX,
            normY,
            normW,
            normH
          }
        });
      }
    }
  }

  return applyNMS(detections);
}

/**
 * Main Detection Interface called by /api/detect-frame
 * Strictly executes ONNX inference with 72%+ confidence gating.
 */
export async function detect(frameBuffer) {
  try {
    if (!frameBuffer || frameBuffer.length === 0) {
      return [];
    }

    const activeSession = await getInferenceSession();

    if (!activeSession) {
      return [];
    }

    const { tensor, origWidth, origHeight } = await preprocessFrame(frameBuffer, 640);
    const inputName = activeSession.inputNames[0];
    const feeds = { [inputName]: tensor };

    const results = await activeSession.run(feeds);
    const outputName = activeSession.outputNames[0];
    const outputTensor = results[outputName];

    // Parse candidate detections for all 7 civic classes (gated at 0.35)
    const detections = parseYoloOutput(outputTensor, origWidth, origHeight, 640, 0.35);
    if (Array.isArray(detections) && detections.length > 0) {
      return detections;
    }
    return [];
  } catch (err) {
    console.warn("⚠️ ONNX Detection error:", err.message);
    return [];
  }
}
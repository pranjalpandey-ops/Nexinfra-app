import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Camera,
  Video,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle2,
  Maximize2,
  RefreshCw,
  Sliders,
  Radio,
  Zap,
  Activity,
  Layers,
  ShieldAlert,
  Clock,
  Eye,
  Crosshair,
  Volume2,
  VolumeX,
  PlusCircle,
  Download,
  Server,
  Cpu,
  Tv,
  Grid,
  ChevronRight,
  FolderOpen,
  Filter,
  Sparkles,
  Plane,
  ShieldCheck,
  Signal,
  Settings,
  Link,
  HelpCircle
} from "lucide-react";
import {
  checkYoloBackendHealth,
  detectFrameWithBackend,
  CIVIC_TAXONOMY_MAP
} from "../services/visionAiService";
import {
  getCanonicalCategory,
  getCanonicalMetadata,
  CANONICAL_CIVIC_CATEGORIES
} from "../services/aiClassMapping";
import { analyzeWithGeminiVision } from "../services/geminiVisionService";
import { addCivicIssue } from "../services/civicDb";
import { createDroneMissionFromIncident } from "../services/droneMissionService";
import {
  fetchCctvStreams,
  attachHlsStream,
  getStreamStatusBadge
} from "../services/streamService";

// Municipal CCTV Feeds Configuration with HLS Streams & RTSP Gateway mappings
const DEFAULT_CCTV_CHANNELS = [
  {
    id: "CAM-01",
    name: "Western Expressway - Sector 4",
    location: "Ward 4 • Km 14.2 Flyover Approach",
    category: "Road Damage / Pothole",
    latitude: 28.6139,
    longitude: 77.2090,
    ward: "Central District - Ward 4",
    streamType: "hls", // "hls" | "webrtc" | "video" | "rtsp" | "demo"
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    rtspUrl: "rtsp://gateway.nexinfra.local:8554/cam01",
    status: "LIVE",
    resolution: "1080p @ 30fps",
    bitrate: "5.4 Mbps",
    sampleImage: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=1200&auto=format&fit=crop&q=80"
  },
  {
    id: "CAM-02",
    name: "Hydro Main Junction - Sector 7",
    location: "Ward 7 • Subsurface Pipeline Grid",
    category: "Water / Drainage Burst",
    latitude: 28.6220,
    longitude: 77.2140,
    ward: "Sector 18 Ward - Zone A",
    streamType: "hls",
    streamUrl: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
    rtspUrl: "rtsp://gateway.nexinfra.local:8554/cam02",
    status: "LIVE",
    resolution: "1080p @ 30fps",
    bitrate: "4.8 Mbps",
    sampleImage: "https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=1200&auto=format&fit=crop&q=80"
  },
  {
    id: "CAM-03",
    name: "Civic Market Center - South Ward",
    location: "Ward 9 • Central Commercial Plaza",
    category: "Solid Waste Overflow",
    latitude: 28.6060,
    longitude: 77.1945,
    ward: "North Green Corridor - Ward 2",
    streamType: "webrtc",
    streamUrl: "",
    rtspUrl: "",
    status: "NO_STREAM",
    resolution: "720p @ 30fps",
    bitrate: "3.2 Mbps",
    sampleImage: "https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=1200&auto=format&fit=crop&q=80"
  },
  {
    id: "CAM-04",
    name: "Metro Viaduct Pillar #42",
    location: "Ward 12 • Ring Road Transit Corridor",
    category: "Structural Anomaly / Bridge Crack",
    latitude: 28.6290,
    longitude: 77.2020,
    ward: "Cyber Hub Transit Corridor - Ward 12",
    streamType: "hls",
    streamUrl: "https://cph-p2p-msl.akamaized.net/hls/live/200034/test/master.m3u8",
    rtspUrl: "rtsp://gateway.nexinfra.local:8554/cam04",
    status: "LIVE",
    resolution: "4K UHD @ 60fps",
    bitrate: "12.0 Mbps",
    sampleImage: "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=1200&auto=format&fit=crop&q=80"
  },
  {
    id: "CAM-05",
    name: "High-Tension Grid Substation 3",
    location: "Ward 2 • Industrial Power Ring",
    category: "Electrical & Streetlight",
    latitude: 28.6010,
    longitude: 77.2280,
    ward: "East Ring Ward 8",
    streamType: "rtsp",
    streamUrl: "",
    rtspUrl: "rtsp://192.168.1.105:554/live",
    status: "OFFLINE",
    resolution: "1080p @ 30fps",
    bitrate: "0 Mbps",
    sampleImage: "https://images.unsplash.com/photo-1509390144018-8bc7f2868846?w=1200&auto=format&fit=crop&q=80"
  },
  {
    id: "CAM-06",
    name: "City Botanical Green Corridor",
    location: "Ward 15 • Public Park Expressway Perimeter",
    category: "Public Park & Greenery Hazard",
    latitude: 28.6065,
    longitude: 77.1950,
    ward: "South Perimeter Parks - Ward 15",
    streamType: "demo",
    streamUrl: "",
    rtspUrl: "",
    status: "DEMO_SAMPLE",
    resolution: "1080p @ 30fps",
    bitrate: "--",
    sampleImage: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&auto=format&fit=crop&q=80"
  },
  {
    id: "CAM-07",
    name: "Industrial Sector 9 • Thermal Alert Zone",
    location: "Ward 11 • Hazardous Storage Corridor",
    category: "Fire & Smoke Hazard",
    latitude: 28.6350,
    longitude: 77.2180,
    ward: "Industrial District - Ward 11",
    streamType: "demo",
    streamUrl: "",
    rtspUrl: "",
    status: "LIVE",
    resolution: "1080p @ 30fps",
    bitrate: "6.2 Mbps",
    sampleImage: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&auto=format&fit=crop&q=80"
  }
];

/**
 * Calculates 2D Intersection over Union (IoU) between consecutive detection bounding boxes
 * @param {Object} boxA - Previous frame bounding box { normX, normY, normW, normH }
 * @param {Object} boxB - Current frame bounding box { normX, normY, normW, normH }
 * @returns {number} IoU score between 0.0 and 1.0
 */
export function calculateBoxIoU(boxA, boxB) {
  if (!boxA || !boxB) return 0;

  const ax1 = boxA.normX ?? boxA.x ?? 0;
  const ay1 = boxA.normY ?? boxA.y ?? 0;
  const aw = boxA.normW ?? boxA.w ?? 0;
  const ah = boxA.normH ?? boxA.h ?? 0;
  const ax2 = ax1 + aw;
  const ay2 = ay1 + ah;

  const bx1 = boxB.normX ?? boxB.x ?? 0;
  const by1 = boxB.normY ?? boxB.y ?? 0;
  const bw = boxB.normW ?? boxB.w ?? 0;
  const bh = boxB.normH ?? boxB.h ?? 0;
  const bx2 = bx1 + bw;
  const by2 = by1 + bh;

  const interX1 = Math.max(ax1, bx1);
  const interY1 = Math.max(ay1, by1);
  const interX2 = Math.min(ax2, bx2);
  const interY2 = Math.min(ay2, by2);

  const interW = Math.max(0, interX2 - interX1);
  const interH = Math.max(0, interY2 - interY1);
  const interArea = interW * interH;

  const areaA = Math.max(0, aw) * Math.max(0, ah);
  const areaB = Math.max(0, bw) * Math.max(0, bh);
  const unionArea = areaA + areaB - interArea;

  if (unionArea <= 0) return 0;
  return parseFloat((interArea / unionArea).toFixed(3));
}

export default function CCTVMonitor({ user, setActivePage }) {
  // Feed & Video State
  const [cctvChannels, setCctvChannels] = useState(DEFAULT_CCTV_CHANNELS);
  const [selectedSourceType, setSelectedSourceType] = useState("channel"); // "channel" | "webcam" | "file"
  const [activeChannel, setActiveChannel] = useState(DEFAULT_CCTV_CHANNELS[0]);
  const [currentStreamStatus, setCurrentStreamStatus] = useState("CONNECTING"); // "LIVE" | "CONNECTING" | "OFFLINE" | "NO_STREAM" | "DEMO_SAMPLE"
  const [customVideoSrc, setCustomVideoSrc] = useState(null);
  const [isMediaTypeImage, setIsMediaTypeImage] = useState(false);
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false);
  const [showRtspConfigModal, setShowRtspConfigModal] = useState(false);
  const [customRtspInput, setCustomRtspInput] = useState("");

  const [targetDefectFilter, setTargetDefectFilter] = useState("all");

  // Camera & Canvas Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const customFileInputRef = useRef(null);
  const hlsCleanupRef = useRef(null);

  // AI & Multi-Frame Temporal Verification States
  const [isDetecting, setIsDetecting] = useState(true);
  const [scanIntervalMs, setScanIntervalMs] = useState(800);
  const [currentDetection, setCurrentDetection] = useState(null);
  const [recentDetections, setRecentDetections] = useState([]);
  const [backendHealth, setBackendHealth] = useState({ status: "checking", engine: "NEXinfra ONNX Civic Detector" });
  const [isCheckingBackend, setIsCheckingBackend] = useState(false);
  const [audioAlertsEnabled, setAudioAlertsEnabled] = useState(false);
  const [lastLoggedIncident, setLastLoggedIncident] = useState(null);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Verification Pipeline States
  const [verificationState, setVerificationState] = useState("WAITING");
  const [consecutiveCount, setConsecutiveCount] = useState(0);
  const [currentTrackingIou, setCurrentTrackingIou] = useState(null);

  // Concurrency, Spatial IoU Tracking & Cooldown Refs
  const isInferencingRef = useRef(false);
  const consecutiveCountRef = useRef(0);
  const trackedDefectRef = useRef(null); // { canonicalCategory, box, confidence, lastIou, timestamp }
  const cooldownMapRef = useRef({});

  // Performance Telemetry
  const [fps, setFps] = useState(30);
  const [inferenceLatencyMs, setInferenceLatencyMs] = useState(18);
  const [currentTimeStr, setCurrentTimeStr] = useState("");

  // Live Timestamp Clock
  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setCurrentTimeStr(d.toLocaleTimeString("en-US", { hour12: false }));
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // Fetch Live CCTV Streams from Backend Stream Gateway
  useEffect(() => {
    fetchCctvStreams().then((remoteStreams) => {
      if (remoteStreams && remoteStreams.length > 0) {
        setCctvChannels(remoteStreams);
        setActiveChannel((prev) => remoteStreams.find((s) => s.id === prev.id) || remoteStreams[0]);
      }
    });
  }, []);

  // Check ONNX Backend Health
  const checkBackend = useCallback(() => {
    setIsCheckingBackend(true);
    checkYoloBackendHealth().then((res) => {
      setBackendHealth(res);
      setIsCheckingBackend(false);
    });
  }, []);

  useEffect(() => {
    checkBackend();
    const timer = setInterval(checkBackend, 10000);
    return () => clearInterval(timer);
  }, [checkBackend]);

  // WebCam Stream Initializer
  const startWebcam = useCallback(async () => {
    if (hlsCleanupRef.current) {
      hlsCleanupRef.current.destroy();
      hlsCleanupRef.current = null;
    }
    setCameraPermissionDenied(false);
    setSelectedSourceType("webcam");
    setCurrentStreamStatus("CONNECTING");

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Browser does not support getUserMedia camera access");
      }

      if (videoRef.current?.srcObject) {
        try {
          const oldStream = videoRef.current.srcObject;
          oldStream.getTracks().forEach((track) => track.stop());
        } catch (e) {}
        videoRef.current.srcObject = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });

      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        videoRef.current.setAttribute("autoplay", "true");
        videoRef.current.setAttribute("muted", "true");
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch((e) => console.warn("Video play exception:", e));
          setCurrentStreamStatus("LIVE");
        };
        videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.warn("Hardware Webcam Error:", err);
      setCameraPermissionDenied(true);
      setCurrentStreamStatus("OFFLINE");
      setSelectedSourceType("channel");
    }
  }, []);

  // Stream Lifecycle Management for Channel Switching & HLS/WebRTC playback
  useEffect(() => {
    if (selectedSourceType === "channel" && activeChannel) {
      if (hlsCleanupRef.current) {
        hlsCleanupRef.current.destroy();
        hlsCleanupRef.current = null;
      }

      if (videoRef.current?.srcObject) {
        try {
          videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
        } catch (e) {}
        videoRef.current.srcObject = null;
      }

      if (activeChannel.streamType === "demo" || !activeChannel.streamUrl) {
        if (activeChannel.status === "NO_STREAM") {
          setCurrentStreamStatus("NO_STREAM");
        } else if (activeChannel.status === "OFFLINE") {
          setCurrentStreamStatus("OFFLINE");
        } else {
          setCurrentStreamStatus("DEMO_SAMPLE");
        }
      } else if (videoRef.current) {
        const cleanup = attachHlsStream(videoRef.current, activeChannel.streamUrl, (status) => {
          setCurrentStreamStatus(status);
        });
        hlsCleanupRef.current = cleanup;
      }
    } else if (selectedSourceType === "file") {
      if (hlsCleanupRef.current) {
        hlsCleanupRef.current.destroy();
        hlsCleanupRef.current = null;
      }
      setCurrentStreamStatus(isMediaTypeImage ? "DEMO_SAMPLE" : "LIVE");
    }

    return () => {
      if (hlsCleanupRef.current) {
        hlsCleanupRef.current.destroy();
        hlsCleanupRef.current = null;
      }
    };
  }, [selectedSourceType, activeChannel, isMediaTypeImage]);

  // Is Real Video Stream Playing?
  const isRealStreamPlaying = () => {
    if (selectedSourceType === "webcam") {
      return Boolean(videoRef.current?.srcObject && videoRef.current.readyState >= 2);
    }
    if (selectedSourceType === "file") {
      return !isMediaTypeImage && Boolean(videoRef.current && videoRef.current.readyState >= 2 && !videoRef.current.paused);
    }
    if (selectedSourceType === "channel") {
      return currentStreamStatus === "LIVE" && Boolean(videoRef.current && videoRef.current.readyState >= 2 && !videoRef.current.paused);
    }
    return false;
  };

  // Real-Time Frame Capture & Multi-Frame ONNX Detection Loop
  const captureAndDetect = useCallback(async () => {
    if (isInferencingRef.current) return;

    // Only run continuous detection when an actual video stream or webcam is actively playing
    if (!isRealStreamPlaying()) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    let frameBase64 = "";
    try {
      canvas.width = 640;
      canvas.height = 360;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(video, 0, 0, 640, 360);
      frameBase64 = canvas.toDataURL("image/jpeg", 0.75);
    } catch (err) {
      return;
    }

    if (!frameBase64) return;

    isInferencingRef.current = true;
    const startTime = performance.now();

    try {
      const backendRes = await detectFrameWithBackend(frameBase64);
      const elapsed = Math.round(performance.now() - startTime);
      setInferenceLatencyMs(elapsed);

      const camId = selectedSourceType === "webcam" ? "CAM-LIVE" : selectedSourceType === "file" ? "CAM-USER" : activeChannel.id;
      const camName = selectedSourceType === "webcam" ? "Live Integrated Camera" : selectedSourceType === "file" ? "Uploaded Video Stream" : activeChannel.name;
      const camLat = selectedSourceType === "channel" ? activeChannel.latitude : 28.6139;
      const camLng = selectedSourceType === "channel" ? activeChannel.longitude : 77.2090;
      const camLocation = selectedSourceType === "channel" ? activeChannel.location : "Central Command Hub";
      const camWard = selectedSourceType === "channel" ? activeChannel.ward : "Central Command Ward";

      if (!backendRes || !backendRes.success || backendRes.error) {
        setBackendHealth({ status: "offline", modelLoaded: false, engine: "AI DETECTION OFFLINE" });
        setVerificationState("CENTRAL AI SERVER UNAVAILABLE");
        consecutiveCountRef.current = 0;
        setConsecutiveCount(0);
        setCurrentDetection(null);
        return;
      }

      setBackendHealth({ status: "online", modelLoaded: true, engine: backendRes.engine || "NEXinfra ONNX Civic Detector" });

      const rawDetections = Array.isArray(backendRes.detections) ? backendRes.detections : [];
      const filteredDetections = targetDefectFilter === "all"
        ? rawDetections
        : rawDetections.filter((d) => d.class === targetDefectFilter || d.category === targetDefectFilter);

      if (filteredDetections.length > 0) {
        filteredDetections.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
        const top = filteredDetections[0];
        const canonicalCategory = getCanonicalCategory(top.class || top.category || top.rawClass);
        const taxMeta = getCanonicalMetadata(canonicalCategory);

        // Spatial-Temporal Verification: Class + Confidence >= 0.15 + Bounding Box IoU >= 0.35
        const IOU_THRESHOLD = 0.35;
        const CONFIDENCE_THRESHOLD = 0.15;

        let spatialIoU = 1.0;
        let isSpatialMatch = false;

        if (top.confidence >= CONFIDENCE_THRESHOLD) {
          if (trackedDefectRef.current) {
            spatialIoU = calculateBoxIoU(trackedDefectRef.current.box, top.box);
            const isSameClass = trackedDefectRef.current.canonicalCategory === canonicalCategory;
            const hasSufficientOverlap = spatialIoU >= IOU_THRESHOLD;

            if (isSameClass && hasSufficientOverlap) {
              consecutiveCountRef.current += 1;
              isSpatialMatch = true;
              trackedDefectRef.current = {
                canonicalCategory,
                box: top.box,
                confidence: top.confidence,
                lastIou: spatialIoU,
                timestamp: Date.now()
              };
            } else {
              // Reset verification if object moved significantly (IoU < 0.35) or class changed
              console.log(`🔄 [SPATIAL RESET] Defect moved or changed (IoU: ${spatialIoU}, Class: ${canonicalCategory}). Resetting track.`);
              consecutiveCountRef.current = 1;
              trackedDefectRef.current = {
                canonicalCategory,
                box: top.box,
                confidence: top.confidence,
                lastIou: 1.0,
                timestamp: Date.now()
              };
            }
          } else {
            // Initial first detection track
            consecutiveCountRef.current = 1;
            trackedDefectRef.current = {
              canonicalCategory,
              box: top.box,
              confidence: top.confidence,
              lastIou: 1.0,
              timestamp: Date.now()
            };
          }
        } else {
          // Confidence dropped below threshold - reset verification
          consecutiveCountRef.current = 0;
          trackedDefectRef.current = null;
        }

        const count = consecutiveCountRef.current;
        setConsecutiveCount(count);
        setCurrentTrackingIou(spatialIoU);

        let vState = "WAITING";
        if (count === 1) vState = "VERIFYING (1/3)";
        else if (count === 2) vState = `VERIFYING (2/3 • IoU ${Math.round(spatialIoU * 100)}%)`;
        else if (count >= 3) vState = "AI VERIFIED";
        setVerificationState(vState);

        const detectionPayload = {
          success: true,
          isDefect: true,
          class: canonicalCategory,
          category: canonicalCategory,
          defectName: taxMeta.defectName,
          confidence: top.confidence,
          confidencePercent: Math.round(top.confidence * 100),
          priority: taxMeta.priority || "P1",
          priorityLabel: `${taxMeta.priority || "P1"} - Critical Hazard`,
          severity: taxMeta.severity || "Critical",
          department: taxMeta.department,
          assignedDepartment: taxMeta.assignedDepartment,
          slaHours: taxMeta.slaHours,
          problemLevel: top.confidence > 0.85 ? 4 : 3,
          problemLevelLabel: `Level ${top.confidence > 0.85 ? 4 : 3} - Real ONNX Detection`,
          hazardScore: Math.round(top.confidence * 100),
          dimensions: top.box ? `${top.box.width || 240}px x ${top.box.height || 160}px` : "Spatial Anomaly Matrix",
          labelMain: canonicalCategory,
          boundingBox: {
            x: top.box?.normX ?? 25,
            y: top.box?.normY ?? 25,
            w: top.box?.normW ?? 50,
            h: top.box?.normH ?? 40
          },
          boundingBoxes: filteredDetections.map((d, idx) => ({
            id: idx + 1,
            label: `${d.class} (${Math.round(d.confidence * 100)}%)`,
            x: d.box?.normX ?? 25,
            y: d.box?.normY ?? 25,
            w: d.box?.normW ?? 50,
            h: d.box?.normH ?? 40
          })),
          engine: backendRes.engine,
          time: Date.now()
        };

        setCurrentDetection(detectionPayload);

        setRecentDetections((prev) => {
          const isDup = prev[0]?.class === top.class && Date.now() - prev[0]?.time < 3000;
          if (isDup) return prev;
          return [
            {
              ...detectionPayload,
              channelId: camId,
              channelName: camName,
              snapshot: frameBase64
            },
            ...prev.slice(0, 19)
          ];
        });

        // Auto-create incident on 3-frame verification with 60s cooldown
        if (count >= 3) {
          const cooldownKey = `${camId}_${canonicalCategory}`;
          const now = Date.now();
          const lastCreated = cooldownMapRef.current[cooldownKey] || 0;

          if (now - lastCreated > 60000) {
            cooldownMapRef.current[cooldownKey] = now;

            const incident = {
              id: `CCTV-${Date.now()}`,
              title: `[CCTV VERIFIED] ${taxMeta.defectName}`,
              category: canonicalCategory,
              description: `Real-time multi-frame verified civic defect detected by surveillance camera (${camName} • ${camLocation}). Verified across 3 consecutive YOLO frames with ${Math.round(top.confidence * 100)}% confidence. Ready for drone inspection & work order dispatch.`,
              priority: taxMeta.priority || "P1",
              priorityLabel: `${taxMeta.priority || "P1"} - Critical Hazard`,
              severity: taxMeta.severity || "Critical",
              problemLevel: 4,
              hazardScore: Math.round(top.confidence * 100),
              department: taxMeta.department || "Roads",
              assignedDepartment: taxMeta.assignedDepartment || "Road Maintenance & Pavement Division",
              slaHours: taxMeta.slaHours || 4,
              latitude: camLat,
              longitude: camLng,
              targetLatitude: camLat,
              targetLongitude: camLng,
              targetIncidentId: `CCTV-${Date.now()}`,
              address: camLocation,
              ward: camWard,
              status: "AI Verified",
              aiVerified: true,
              aiConfidence: top.confidence,
              verificationMethod: "3-frame consecutive YOLO verification",
              source: "REAL_TIME_CCTV",
              cameraId: camId,
              cameraName: camName,
              detectionEngine: backendRes.engine || "NEXinfra ONNX Civic Detector",
              imageUrl: frameBase64,
              boundingBoxes: detectionPayload.boundingBoxes,
              createdAt: new Date().toISOString(),
              upvotes: 1,
              upvotedBy: ["cctv.ai@nexinfra.gov"],
              createdBy: "cctv.ai@nexinfra.gov"
            };

            const saveRes = await addCivicIssue(incident);
            const firestoreId = saveRes?.id || incident.id;
            createDroneMissionFromIncident({
              ...incident,
              id: firestoreId,
              targetIncidentId: firestoreId
            });

            console.log(`✅ [CCTV INCIDENT FIRESTORE ID]: ${firestoreId}`);
            setLastLoggedIncident(taxMeta.defectName || top.class);
            setTimeout(() => setLastLoggedIncident(null), 5000);
          }
        }
      } else {
        consecutiveCountRef.current = 0;
        setConsecutiveCount(0);
        trackedDefectRef.current = null;
        setCurrentTrackingIou(null);
        setVerificationState("NO DEFECT");
        setCurrentDetection(null);
      }
    } catch (err) {
      console.warn("CCTV Frame Analysis Exception:", err);
      setVerificationState("MODEL INFERENCE ERROR");
    } finally {
      isInferencingRef.current = false;
    }
  }, [selectedSourceType, activeChannel, targetDefectFilter, currentStreamStatus]);

  // Live Continuous Detection Interval
  useEffect(() => {
    if (!isDetecting) return;
    const interval = setInterval(() => {
      captureAndDetect();
    }, scanIntervalMs);
    return () => clearInterval(interval);
  }, [isDetecting, scanIntervalMs, captureAndDetect]);

  // Single-Shot Demo Scan on Static Sample Image (Explicitly Labeled)
  const handleSingleDemoScan = async () => {
    if (!activeChannel?.sampleImage) return;
    setIsSubmittingReport(true);
    try {
      const res = await detectFrameWithBackend(activeChannel.sampleImage);
      if (res && res.success && res.detections?.length > 0) {
        const top = res.detections[0];
        const tax = CIVIC_TAXONOMY_MAP[top.class] || { category: top.class, defectName: top.class, priority: "P1", severity: "Critical", department: "Roads", slaHours: 4 };
        setCurrentDetection({
          success: true,
          isDefect: true,
          class: canonicalCategory,
          category: tax.category,
          defectName: tax.defectName,
          confidence: top.confidence,
          confidencePercent: Math.round(top.confidence * 100),
          priority: tax.priority,
          priorityLabel: `${tax.priority} - Demo Detection`,
          severity: tax.severity,
          department: tax.department,
          slaHours: tax.slaHours,
          boundingBox: { x: top.box?.normX ?? 25, y: top.box?.normY ?? 25, w: top.box?.normW ?? 50, h: top.box?.normH ?? 40 },
          labelMain: top.class
        });
        setVerificationState("DEMO MODE");
      }
    } catch (e) {
      console.warn("Demo Scan error:", e);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // Handle Custom Media Upload
  const handleCustomMediaUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const isImg = file.type.startsWith("image/");
      const reader = new FileReader();
      reader.onload = (evt) => {
        setCustomVideoSrc(evt.target.result);
        setIsMediaTypeImage(isImg);
        setSelectedSourceType("file");
        setCurrentStreamStatus(isImg ? "DEMO_SAMPLE" : "LIVE");
      };
      reader.readAsDataURL(file);
    }
  };

  // Instant Manual Dispatch
  const handleAutoLogIncident = async (detectionItem) => {
    const item = detectionItem || currentDetection;
    if (!item) return;

    setIsSubmittingReport(true);
    try {
      const camId = selectedSourceType === "webcam" ? "CAM-LIVE" : selectedSourceType === "file" ? "CAM-USER" : activeChannel.id;
      const camName = selectedSourceType === "webcam" ? "Live Integrated Camera" : selectedSourceType === "file" ? "Uploaded Video Stream" : activeChannel.name;
      const camLat = selectedSourceType === "channel" ? activeChannel.latitude : 28.6139;
      const camLng = selectedSourceType === "channel" ? activeChannel.longitude : 77.2090;
      const camLocation = selectedSourceType === "channel" ? activeChannel.location : "Central Command Hub";
      const camWard = selectedSourceType === "channel" ? activeChannel.ward : "Central Command Ward";

      const newReport = {
        id: `CCTV-${Date.now()}`,
        title: `[CCTV AI DISPATCH] ${item.defectName || item.category}`,
        category: item.category,
        description: `Manual dispatch from CCTV camera (${camName} • ${camLocation}). Problem: ${item.defectName}. Severity: ${item.priorityLabel || item.priority}. Detected with ${item.confidencePercent || 90}% confidence via ONNX YOLO engine.`,
        priority: item.priority || "P1",
        priorityLabel: item.priorityLabel || "P1 - Critical Hazard",
        severity: item.severity || "Critical",
        department: item.department || "Roads",
        assignedDepartment: item.assignedDepartment || "Road Maintenance Division",
        slaHours: item.slaHours || 4,
        latitude: camLat,
        longitude: camLng,
        targetLatitude: camLat,
        targetLongitude: camLng,
        targetIncidentId: `CCTV-${Date.now()}`,
        address: camLocation,
        ward: camWard,
        status: "AI Verified",
        aiVerified: true,
        aiConfidence: (item.confidencePercent || 90) / 100,
        verificationMethod: "Surveillance Stream ONNX YOLO",
        source: "REAL_TIME_CCTV",
        cameraId: camId,
        cameraName: camName,
        createdAt: new Date().toISOString(),
        upvotes: 1,
        upvotedBy: ["cctv.ai@nexinfra.gov"],
        createdBy: "cctv.ai@nexinfra.gov",
        imageUrl: item.snapshot || item.sampleImage || activeChannel.sampleImage
      };

      const saveRes = await addCivicIssue(newReport);
      const firestoreId = saveRes?.id || newReport.id;
      createDroneMissionFromIncident({
        ...newReport,
        id: firestoreId,
        targetIncidentId: firestoreId
      });

      console.log(`✅ [MANUAL DISPATCH FIRESTORE ID]: ${firestoreId}`);
      setLastLoggedIncident(item.defectName || item.category);
      setTimeout(() => setLastLoggedIncident(null), 5000);
    } catch (err) {
      console.error("Auto incident logging error:", err);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleRegisterRtspStream = () => {
    if (!customRtspInput) return;
    const updated = {
      ...activeChannel,
      rtspUrl: customRtspInput,
      streamType: "rtsp",
      status: "LIVE"
    };
    setCctvChannels((prev) => prev.map((c) => (c.id === activeChannel.id ? updated : c)));
    setActiveChannel(updated);
    setCurrentStreamStatus("LIVE");
    setShowRtspConfigModal(false);
    setCustomRtspInput("");
  };

  const currentCamId = selectedSourceType === "webcam" ? "CAM-LIVE" : selectedSourceType === "file" ? "CAM-USER" : activeChannel.id;
  const statusBadge = getStreamStatusBadge(currentStreamStatus);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#070A12] text-slate-100 font-sans p-6 overflow-y-auto">
      <canvas ref={canvasRef} className="hidden" />

      {/* TOP COMMAND HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10">
              <Camera className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight font-heading flex items-center gap-2">
                NEXINFRA CCTV DEFECT INTELLIGENCE
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-950 border border-cyan-500/60 text-cyan-300">
                  RTSP • HLS • ONNX YOLO
                </span>
              </h1>
              <p className="text-slate-400 text-xs mt-0.5">
                Real-time video stream ingestion, ONNX spatial defect localization, 3-frame temporal verification & UAV readiness
              </p>
            </div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
          {/* STREAM STATUS BADGE */}
          <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 ${statusBadge.color}`}>
            <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`} />
            <span>STREAM:</span>
            <strong>{statusBadge.label}</strong>
          </div>

          {/* CENTRAL AI ENGINE STATUS */}
          <button
            type="button"
            onClick={checkBackend}
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 cursor-pointer transition ${
              backendHealth.status === "online" && backendHealth.modelLoaded
                ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60"
                : isCheckingBackend
                ? "bg-amber-950/60 border-amber-500/50 text-amber-300 animate-pulse"
                : "bg-red-950/60 border-red-500/50 text-red-300 hover:bg-red-900/60 animate-pulse"
            }`}
            title="Click to test & reconnect Central AI Vision Engine"
          >
            <Server className={`w-3.5 h-3.5 ${isCheckingBackend ? "animate-spin text-amber-400" : "text-cyan-400"}`} />
            <span>AI ENGINE:</span>
            <span className={`w-2 h-2 rounded-full ${
              backendHealth.status === "online" && backendHealth.modelLoaded
                ? "bg-emerald-400 animate-pulse"
                : isCheckingBackend
                ? "bg-amber-400 animate-ping"
                : "bg-red-400"
            }`} />
            <strong className={
              backendHealth.status === "online" && backendHealth.modelLoaded
                ? "text-emerald-400"
                : isCheckingBackend
                ? "text-amber-400"
                : "text-red-400"
            }>
              {backendHealth.status === "online" && backendHealth.modelLoaded
                ? "ONLINE"
                : isCheckingBackend
                ? "CONNECTING..."
                : "RECONNECT"}
            </strong>
          </button>

          {/* ACTIVE CAMERA */}
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300 flex items-center gap-1.5">
            <Tv className="w-3.5 h-3.5 text-cyan-400" />
            <span>CAM:</span>
            <strong className="text-white">{currentCamId}</strong>
          </div>

          {/* VERIFICATION STATE */}
          <div
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 ${
              verificationState === "AI VERIFIED"
                ? "bg-red-950/80 border-red-500 text-red-300 font-bold animate-pulse"
                : verificationState.startsWith("VERIFYING")
                ? "bg-amber-950/60 border-amber-500/50 text-amber-300"
                : "bg-slate-900 border-slate-700 text-slate-300"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>VERIFICATION:</span>
            <strong className={verificationState === "AI VERIFIED" ? "text-red-400 font-extrabold" : "text-cyan-300"}>
              {verificationState}
            </strong>
          </div>

          <button
            onClick={() => setShowRtspConfigModal(true)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Configure RTSP / Media Gateway"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Gateway</span>
          </button>

          <button
            onClick={() => setIsDetecting(!isDetecting)}
            className={`px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isDetecting
                ? "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30"
            }`}
          >
            {isDetecting ? (
              <>
                <Pause className="w-3.5 h-3.5" /> Pause
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" /> Resume
              </>
            )}
          </button>
        </div>
      </div>

      {/* AUTO-LOGGED SUCCESS TOAST */}
      {lastLoggedIncident && (
        <div className="mt-4 p-3.5 bg-emerald-950/90 border border-emerald-500 rounded-xl flex items-center justify-between text-emerald-200 text-sm shadow-xl animate-bounce">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              <strong>AI Verified Incident Created:</strong> Automatically saved <em>"{lastLoggedIncident}"</em> with Fixed GPS & staged for UAV drone inspection!
            </span>
          </div>
          <span className="text-xs bg-emerald-900/80 px-2.5 py-1 rounded font-mono">AI VERIFIED • DRONE READY</span>
        </div>
      )}

      {/* RTSP GATEWAY CONFIG MODAL */}
      {showRtspConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0F19] border border-cyan-500/40 rounded-xl p-6 max-w-lg w-full space-y-4 font-mono text-xs text-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Settings className="w-4 h-4" />
                <span>RTSP Stream & Media Gateway Configuration</span>
              </div>
              <button onClick={() => setShowRtspConfigModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">Target Camera Channel</label>
                <input
                  type="text"
                  disabled
                  value={`${activeChannel.id} - ${activeChannel.name}`}
                  className="w-full bg-[#05070D] border border-slate-800 rounded p-2 text-slate-300"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">RTSP Stream Ingestion URL</label>
                <input
                  type="text"
                  placeholder="rtsp://192.168.1.100:554/stream1"
                  value={customRtspInput}
                  onChange={(e) => setCustomRtspInput(e.target.value)}
                  className="w-full bg-[#05070D] border border-cyan-500/50 rounded p-2 text-white focus:outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Supported Gateways: MediaMTX, FFmpeg RTSP-to-HLS, WebRTC WHEP.
                </p>
              </div>

              <div className="p-3 bg-[#05070D] border border-slate-800 rounded text-[11px] text-cyan-300 space-y-1">
                <p className="font-bold text-white">Media Gateway Pipeline:</p>
                <p>• Ingestion: RTSP @ 8554 / WebRTC @ 8889</p>
                <p>• Transcoding: FFmpeg HLS / LL-HLS</p>
                <p>• AI Inference: 640x360 NCHW Tensor &rarr; ONNX YOLO</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRtspConfigModal(false)}
                className="px-4 py-2 rounded bg-slate-900 border border-slate-700 text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleRegisterRtspStream}
                className="px-4 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold"
              >
                Connect Stream
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN DUAL COLUMN VIEW */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        {/* LEFT 2 COLUMNS: VIDEO PLAYER & HUD */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          {/* CAMERA FEED SELECTOR BAR */}
          <div className="bg-[#0D121F] border border-slate-800 p-2.5 rounded-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={startWebcam}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                  selectedSourceType === "webcam"
                    ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                    : "bg-slate-900 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <Video className="w-4 h-4 text-cyan-300" />
                Live Integrated Camera (Webcam)
              </button>

              <button
                onClick={() => setSelectedSourceType("channel")}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                  selectedSourceType === "channel"
                    ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                    : "bg-slate-900 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <Tv className="w-4 h-4 text-cyan-300" />
                Municipal CCTV Stream Grid
              </button>

              <button
                onClick={() => customFileInputRef.current?.click()}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                  selectedSourceType === "file"
                    ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                    : "bg-slate-900 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <FolderOpen className="w-4 h-4 text-cyan-300" />
                Upload Local Video for Dev
              </button>
              <input
                ref={customFileInputRef}
                type="file"
                accept="video/*,image/*"
                className="hidden"
                onChange={handleCustomMediaUpload}
              />
            </div>

            {/* Target Filter & Interval */}
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-cyan-400" />
                <span>Focus:</span>
                <select
                  value={targetDefectFilter}
                  onChange={(e) => setTargetDefectFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-cyan-300 font-bold px-2.5 py-1 rounded-lg focus:outline-none"
                >
                  <option value="all">⚡ All 6 Defect Categories</option>
                  <option value="Road Damage / Pothole">🛣️ Road Damage & Potholes</option>
                  <option value="Water / Drainage Burst">💧 Water Bursts & Waterlogging</option>
                  <option value="Solid Waste Overflow">🗑️ Solid Waste Overflows</option>
                  <option value="Electrical & Streetlight">⚡ Electrical Hazards</option>
                  <option value="Structural Anomaly / Bridge Crack">🧱 Structural Cracks</option>
                  <option value="Public Park & Greenery Hazard">🌳 Greenery Hazards</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span>Rate:</span>
                <select
                  value={scanIntervalMs}
                  onChange={(e) => setScanIntervalMs(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-700 text-slate-200 px-2 py-1 rounded-lg"
                >
                  <option value={500}>500ms</option>
                  <option value={800}>800ms</option>
                  <option value={1200}>1200ms</option>
                </select>
              </div>
            </div>
          </div>

          {/* VIDEO FEED CONTAINER WITH REAL-TIME HUD OVERLAYS */}
          <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-slate-800 shadow-2xl aspect-video flex items-center justify-center group">
            {/* Live Media Playback */}
            {selectedSourceType === "file" && isMediaTypeImage ? (
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                <img src={customVideoSrc} alt="Demo Asset" className="w-full h-full object-contain opacity-70" />
                <div className="absolute top-4 left-4 px-3 py-1 rounded bg-purple-950/90 border border-purple-500/80 text-purple-200 text-xs font-mono font-bold">
                  DEMO MODE (STATIC SAMPLE IMAGE)
                </div>
              </div>
            ) : currentStreamStatus === "NO_STREAM" ? (
              <div className="flex flex-col items-center justify-center text-center p-8 space-y-3">
                <Signal className="w-12 h-12 text-slate-600" />
                <h4 className="text-sm font-bold text-slate-300 font-mono">NO STREAM CONFIGURED</h4>
                <p className="text-xs text-slate-500 max-w-sm font-mono">
                  This CCTV channel does not have an active RTSP or HLS stream URL configured.
                </p>
                <button
                  onClick={() => setShowRtspConfigModal(true)}
                  className="px-4 py-2 rounded bg-cyan-950 border border-cyan-500 text-cyan-300 text-xs font-mono font-bold"
                >
                  + Configure RTSP / HLS Stream
                </button>
              </div>
            ) : currentStreamStatus === "OFFLINE" ? (
              <div className="flex flex-col items-center justify-center text-center p-8 space-y-3">
                <AlertTriangle className="w-12 h-12 text-red-500 animate-pulse" />
                <h4 className="text-sm font-bold text-red-400 font-mono">STREAM OFFLINE</h4>
                <p className="text-xs text-slate-400 max-w-sm font-mono">
                  RTSP camera feed at {activeChannel.rtspUrl || "target IP"} is unreachable or media gateway is offline.
                </p>
                <button
                  onClick={() => setShowRtspConfigModal(true)}
                  className="px-4 py-2 rounded bg-red-950/60 border border-red-500/60 text-red-300 text-xs font-mono font-bold"
                >
                  Edit Stream Connection
                </button>
              </div>
            ) : currentStreamStatus === "DEMO_SAMPLE" ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <img src={activeChannel.sampleImage} alt="Demo Asset" className="w-full h-full object-cover opacity-75" />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex flex-col items-center justify-center space-y-3">
                  <div className="px-3.5 py-1.5 rounded-full bg-purple-950/90 border border-purple-500/80 text-purple-200 text-xs font-mono font-bold flex items-center gap-2 shadow-2xl">
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                    DEMO MODE (STATIC SAMPLE IMAGE)
                  </div>
                  <p className="text-[11px] font-mono text-slate-300 max-w-md text-center">
                    Real-time AI detection requires a live video stream or webcam. Click below to run a single demo analysis on this sample frame.
                  </p>
                  <button
                    onClick={handleSingleDemoScan}
                    disabled={isSubmittingReport}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-lg shadow-purple-600/30 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Run Demo Single Scan</span>
                  </button>
                </div>
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                crossOrigin="anonymous"
                className="w-full h-full object-cover"
              />
            )}

            {/* 1. TOP VIDEO TELEMETRY BAR */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
              <div className="flex items-center gap-2 font-mono text-xs">
                <div className={`px-2.5 py-1 rounded bg-black/80 backdrop-blur-md border font-bold flex items-center gap-1.5 shadow-lg ${statusBadge.color}`}>
                  <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`} />
                  {statusBadge.label}
                </div>
                <div className="px-2.5 py-1 rounded bg-black/80 backdrop-blur-md border border-slate-700 text-cyan-300 font-bold">
                  {currentCamId}
                </div>
                <div className="px-2.5 py-1 rounded bg-black/80 backdrop-blur-md border border-slate-700 text-slate-300">
                  {selectedSourceType === "channel"
                    ? `GPS: ${activeChannel.latitude.toFixed(4)}°N, ${activeChannel.longitude.toFixed(4)}°E`
                    : "GPS: 28.6139°N, 77.2090°E"}
                </div>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                <div className="px-2.5 py-1 rounded bg-black/80 backdrop-blur-md border border-slate-700 text-slate-400">
                  LATENCY: <span className="text-cyan-400 font-bold">{inferenceLatencyMs}ms</span>
                </div>
                <div className="px-2.5 py-1 rounded bg-black/80 backdrop-blur-md border border-slate-700 text-emerald-400 font-bold">
                  ONNX YOLO
                </div>
              </div>
            </div>

            {/* 2. DYNAMIC YOLO BOUNDING BOX & TARGETING HUD */}
            {(() => {
              const activeBox = currentDetection?.boundingBox;
              const isDefect = isDetecting && currentDetection && currentDetection.isDefect && activeBox;

              if (!isDefect) {
                return isDetecting && verificationState === "NO DEFECT" ? (
                  <div className="absolute bottom-16 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/60 backdrop-blur-md text-emerald-300 text-xs font-mono font-bold flex items-center gap-2 pointer-events-none z-20 shadow-xl animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>SURVEILLANCE SCAN: NOMINAL • NO HAZARDS DETECTED</span>
                  </div>
                ) : null;
              }

              const boxColor = "#EF4444";

              return (
                <div
                  className="absolute border-2 transition-all duration-200 pointer-events-none z-30 animate-pulse"
                  style={{
                    left: `${activeBox.x}%`,
                    top: `${activeBox.y}%`,
                    width: `${activeBox.w}%`,
                    height: `${activeBox.h}%`,
                    borderColor: boxColor,
                    boxShadow: "0 0 30px rgba(239, 68, 68, 0.95), inset 0 0 20px rgba(239, 68, 68, 0.35)",
                    backgroundColor: "rgba(239, 68, 68, 0.22)"
                  }}
                >
                  <span className="absolute -top-1.5 -left-1.5 w-4 h-4 border-t-2 border-l-2 border-red-400 shadow-md shadow-red-500/50" />
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 border-t-2 border-r-2 border-red-400 shadow-md shadow-red-500/50" />
                  <span className="absolute -bottom-1.5 -left-1.5 w-4 h-4 border-b-2 border-l-2 border-red-400 shadow-md shadow-red-500/50" />
                  <span className="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b-2 border-r-2 border-red-400 shadow-md shadow-red-500/50" />

                  <div className="absolute inset-0 flex items-center justify-center opacity-60">
                    <Crosshair className="w-7 h-7 text-red-400 animate-spin" />
                  </div>

                  <div className="absolute -top-9 left-0 text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-2xl flex items-center gap-1.5 whitespace-nowrap font-mono bg-red-600 border border-red-400">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    <span>{currentDetection.labelMain || currentDetection.category}</span>
                    <span className="bg-black/50 px-1.5 py-0.2 rounded font-bold text-red-200">
                      {currentDetection.confidencePercent || 94}%
                    </span>
                    <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">
                      {verificationState} {currentTrackingIou !== null ? `(IoU: ${Math.round(currentTrackingIou * 100)}%)` : ""}
                    </span>
                  </div>

                  <div className="absolute -bottom-7 left-0 bg-black/95 border border-red-500/60 text-red-200 text-[10px] px-2 py-0.5 rounded font-mono font-bold shadow-lg">
                    {currentDetection.dimensions || "Active Defect Zone"} • SLA: {currentDetection.slaHours || 4}h
                  </div>
                </div>
              );
            })()}

            {/* 3. BOTTOM CONTROLS */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20 font-mono text-xs">
              <div className="px-2.5 py-1 rounded bg-black/80 backdrop-blur-md border border-slate-800 text-slate-400">
                {currentTimeStr}
              </div>

              <div className="flex items-center gap-2 pointer-events-auto">
                <button
                  onClick={() => setShowRtspConfigModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-black/80 hover:bg-slate-900 border border-slate-700 text-slate-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Link className="w-3.5 h-3.5 text-cyan-400" />
                  <span>RTSP Config</span>
                </button>
              </div>
            </div>
          </div>

          {/* CCTV CHANNELS SELECTOR BAR */}
          {selectedSourceType === "channel" && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {cctvChannels.map((channel) => {
                const isActive = activeChannel.id === channel.id;
                const b = getStreamStatusBadge(channel.status);
                return (
                  <button
                    key={channel.id}
                    onClick={() => setActiveChannel(channel)}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      isActive
                        ? "bg-cyan-950/60 border-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                        : "bg-[#0D121F] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono font-bold text-xs text-cyan-400">{channel.id}</span>
                      <span className={`w-2 h-2 rounded-full ${b.dot}`} />
                    </div>
                    <p className="font-bold text-xs line-clamp-1 text-slate-200">{channel.category}</p>
                    <p className="text-[10px] font-mono text-slate-400 mt-1 truncate">
                      {channel.status} • {channel.streamType.toUpperCase()}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: LIVE RECENT DETECTIONS FEED & EVENT LOG */}
        <div className="flex flex-col gap-4">
          <div className="bg-[#0D121F] border border-slate-800 rounded-2xl p-5 flex flex-col h-full">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white font-heading text-sm">
                  Surveillance Verification Log
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {recentDetections.length} Events Logged
              </span>
            </div>

            {/* Event Log Items */}
            <div className="flex-1 overflow-y-auto space-y-3 mt-4 max-h-[560px] pr-1">
              {recentDetections.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs font-mono space-y-2">
                  <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-slate-600 animate-pulse" />
                  <p>AWAITING DEFECT DETECTIONS...</p>
                  <p className="text-[10px] text-slate-600">
                    Real-time detection runs continuously on live video streams and hardware cameras.
                  </p>
                </div>
              ) : (
                recentDetections.map((event, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                        <span className="font-mono font-bold text-xs text-white">
                          {event.channelId}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(event.time).toLocaleTimeString()}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-500/40">
                        {event.confidencePercent || 94}% CONF
                      </span>
                    </div>

                    <p className="font-bold text-xs text-slate-200 line-clamp-1">
                      {event.defectName || event.category}
                    </p>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                      <span>{event.department || "Roads"}</span>
                      <span className="text-cyan-400 font-bold">
                        SLA: {event.slaHours || 4}h
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleAutoLogIncident(event)}
                        disabled={isSubmittingReport}
                        className="w-full py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-cyan-600/20"
                      >
                        <Plane className="w-3.5 h-3.5" />
                        <span>Dispatch Drone & Log</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

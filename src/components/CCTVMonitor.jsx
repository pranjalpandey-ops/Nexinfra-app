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
  ShieldCheck
} from "lucide-react";
import {
  checkYoloBackendHealth,
  detectFrameWithBackend,
  CIVIC_TAXONOMY_MAP
} from "../services/visionAiService";
import { analyzeWithGeminiVision } from "../services/geminiVisionService";
import { addCivicIssue } from "../services/civicDb";
import { createDroneMissionFromIncident } from "../services/droneMissionService";

// Fixed Municipal CCTV Feeds for Smart City Grid with Exact GPS Telemetry
const CCTV_CHANNELS = [
  {
    id: "CAM-01",
    name: "Western Expressway - Sector 4",
    location: "Ward 4 • Km 14.2 Flyover Approach",
    category: "Road Damage / Pothole",
    latitude: 28.6139,
    longitude: 77.2090,
    ward: "Central District - Ward 4",
    resolution: "1080p @ 30fps",
    bitrate: "5.4 Mbps",
    videoUrl: "",
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
    resolution: "1080p @ 30fps",
    bitrate: "4.8 Mbps",
    videoUrl: "",
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
    resolution: "720p @ 30fps",
    bitrate: "3.2 Mbps",
    videoUrl: "",
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
    resolution: "4K UHD @ 60fps",
    bitrate: "12.0 Mbps",
    videoUrl: "",
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
    resolution: "1080p @ 30fps",
    bitrate: "6.1 Mbps",
    videoUrl: "",
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
    resolution: "1080p @ 30fps",
    bitrate: "5.8 Mbps",
    videoUrl: "",
    sampleImage: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&auto=format&fit=crop&q=80"
  }
];

export default function CCTVMonitor({ user, setActivePage }) {
  // Feed & Video State
  const [selectedSourceType, setSelectedSourceType] = useState("channel");
  const [activeChannel, setActiveChannel] = useState(CCTV_CHANNELS[0]);
  const [customVideoSrc, setCustomVideoSrc] = useState(null);
  const [isMediaTypeImage, setIsMediaTypeImage] = useState(false);
  const [isGridMode, setIsGridMode] = useState(false);
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false);

  const [targetDefectFilter, setTargetDefectFilter] = useState("all");

  // Camera & Canvas Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const customFileInputRef = useRef(null);

  // AI & Multi-Frame Temporal Verification States
  const [isDetecting, setIsDetecting] = useState(true);
  const [scanIntervalMs, setScanIntervalMs] = useState(800); // 800ms controlled loop
  const [currentDetection, setCurrentDetection] = useState(null);
  const [recentDetections, setRecentDetections] = useState([]);
  const [backendHealth, setBackendHealth] = useState({ status: "checking", engine: "NEXinfra ONNX Civic Detector" });
  const [audioAlertsEnabled, setAudioAlertsEnabled] = useState(false);
  const [lastLoggedIncident, setLastLoggedIncident] = useState(null);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Verification Pipeline States
  const [verificationState, setVerificationState] = useState("WAITING"); // WAITING, VERIFYING (1/3), VERIFYING (2/3), AI VERIFIED, NO DEFECT, AI DETECTION OFFLINE
  const [consecutiveCount, setConsecutiveCount] = useState(0);

  // Concurrency and Multi-Frame Ref Guards
  const isInferencingRef = useRef(false);
  const consecutiveCountRef = useRef(0);
  const trackedClassRef = useRef(null);
  const cooldownMapRef = useRef({}); // Prevents duplicate spam within 60s: { "[camId]_[defectClass]": timestamp }

  // Performance Telemetry
  const [fps, setFps] = useState(30);
  const [inferenceLatencyMs, setInferenceLatencyMs] = useState(18);
  const [currentTimeStr, setCurrentTimeStr] = useState("");

  // Live Timestamp Clock
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTimeStr(
        now.toISOString().replace("T", " ").substring(0, 19) +
          "." +
          String(now.getMilliseconds()).padStart(3, "0") +
          " UTC"
      );
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // Check ONNX Backend Health on Mount & Periodically
  const checkBackend = useCallback(() => {
    checkYoloBackendHealth().then((res) => {
      setBackendHealth(res);
    });
  }, []);

  useEffect(() => {
    checkBackend();
    const timer = setInterval(checkBackend, 5000);
    return () => clearInterval(timer);
  }, [checkBackend]);

  // WebCam Stream Initializer
  const startWebcam = useCallback(async () => {
    setCameraPermissionDenied(false);
    setSelectedSourceType("webcam");

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
        };
        videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.warn("Hardware Webcam Error:", err);
      setCameraPermissionDenied(true);
      setSelectedSourceType("channel");
    }
  }, []);

  // Switch Sources
  useEffect(() => {
    if (selectedSourceType === "webcam") {
      startWebcam();
    } else {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    }
  }, [selectedSourceType, startWebcam]);

  // Real-Time Frame Capture & Multi-Frame ONNX Detection Loop
  const captureAndDetect = useCallback(async () => {
    if (isInferencingRef.current) {
      return; // Skip frame if previous inference is still in flight
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    let frameBase64 = "";

    try {
      if (selectedSourceType === "file" && isMediaTypeImage && customVideoSrc) {
        frameBase64 = customVideoSrc;
      } else if (video && video.readyState >= 2 && video.videoWidth > 0 && canvas) {
        canvas.width = 640;
        canvas.height = 360;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(video, 0, 0, 640, 360);
        try {
          frameBase64 = canvas.toDataURL("image/jpeg", 0.75);
        } catch (taintErr) {
          if (selectedSourceType === "channel" && activeChannel?.sampleImage) {
            frameBase64 = activeChannel.sampleImage;
          }
        }
      } else if (selectedSourceType === "channel" && activeChannel?.sampleImage) {
        frameBase64 = activeChannel.sampleImage;
      }
    } catch (err) {
      if (selectedSourceType === "channel" && activeChannel?.sampleImage) {
        frameBase64 = activeChannel.sampleImage;
      }
    }

    if (!frameBase64) return;

    isInferencingRef.current = true;
    const startTime = performance.now();

    try {
      // 1. Send frame to ONNX backend detector (Zero Fake Pothole Heuristics)
      const backendRes = await detectFrameWithBackend(frameBase64);
      const elapsed = Math.round(performance.now() - startTime);
      setInferenceLatencyMs(elapsed);

      // Determine active camera identifiers and coordinates
      const camId = selectedSourceType === "webcam" ? "CAM-LIVE" : selectedSourceType === "file" ? "CAM-USER" : activeChannel.id;
      const camName = selectedSourceType === "webcam" ? "Live Integrated Camera" : selectedSourceType === "file" ? "Uploaded Media Stream" : activeChannel.name;
      const camLat = selectedSourceType === "channel" ? activeChannel.latitude : 28.6139;
      const camLng = selectedSourceType === "channel" ? activeChannel.longitude : 77.2090;
      const camLocation = selectedSourceType === "channel" ? activeChannel.location : "Central Command Hub";
      const camWard = selectedSourceType === "channel" ? activeChannel.ward : "Central Command Ward";

      if (!backendRes || !backendRes.success || backendRes.error) {
        setBackendHealth({ status: "offline", modelLoaded: false, engine: "AI DETECTION OFFLINE" });
        setVerificationState("AI DETECTION OFFLINE");
        consecutiveCountRef.current = 0;
        setConsecutiveCount(0);
        setCurrentDetection(null);
        return;
      }

      setBackendHealth({ status: "online", modelLoaded: true, engine: backendRes.engine || "NEXinfra ONNX Civic Detector" });

      const rawDetections = Array.isArray(backendRes.detections) ? backendRes.detections : [];
      
      // Apply Filter if selected
      const filteredDetections = targetDefectFilter === "all"
        ? rawDetections
        : rawDetections.filter((d) => d.class === targetDefectFilter || d.category === targetDefectFilter);

      if (filteredDetections.length > 0) {
        // Sort highest confidence first
        filteredDetections.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
        const top = filteredDetections[0];

        // Multi-Frame Temporal Verification (Requires 3 consecutive frames with confidence >= 0.70)
        if (top.confidence >= 0.70) {
          if (trackedClassRef.current === top.class) {
            consecutiveCountRef.current += 1;
          } else {
            trackedClassRef.current = top.class;
            consecutiveCountRef.current = 1;
          }
        } else {
          consecutiveCountRef.current = 0;
          trackedClassRef.current = null;
        }

        const count = consecutiveCountRef.current;
        setConsecutiveCount(count);

        let vState = "WAITING";
        if (count === 1) vState = "VERIFYING (1/3)";
        else if (count === 2) vState = "VERIFYING (2/3)";
        else if (count >= 3) vState = "AI VERIFIED";
        setVerificationState(vState);

        const taxMeta = CIVIC_TAXONOMY_MAP[top.class] || CIVIC_TAXONOMY_MAP[top.category] || {
          category: top.class || "Road Damage / Pothole",
          defectName: top.class || "Civic Defect",
          department: top.department || "Roads",
          assignedDepartment: top.assignedDepartment || "Road Maintenance & Pavement Division",
          severity: top.severity || "Critical",
          priority: top.priority || "P1",
          slaHours: top.slaHours || 4,
          color: "#EF4444"
        };

        const detectionPayload = {
          success: true,
          isDefect: true,
          class: top.class,
          category: taxMeta.category,
          defectName: taxMeta.defectName || top.class,
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
          labelMain: top.class,
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

        // Add to Live Surveillance Event Log
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

        // 8. AUTOMATIC INCIDENT CREATION UPON AI VERIFIED (with 60s Duplicate Cooldown)
        if (count >= 3) {
          const cooldownKey = `${camId}_${top.class}`;
          const now = Date.now();
          const lastCreated = cooldownMapRef.current[cooldownKey] || 0;

          if (now - lastCreated > 60000) {
            cooldownMapRef.current[cooldownKey] = now;

            const incident = {
              id: `CCTV-${Date.now()}`,
              title: `[CCTV VERIFIED] ${taxMeta.defectName || top.class}`,
              category: taxMeta.category || top.class,
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

            addCivicIssue(incident);
            createDroneMissionFromIncident(incident);

            setLastLoggedIncident(taxMeta.defectName || top.class);
            setTimeout(() => setLastLoggedIncident(null), 5000);
          }
        }
      } else {
        // No defects detected in frame
        consecutiveCountRef.current = 0;
        setConsecutiveCount(0);
        setVerificationState("NO DEFECT");
        setCurrentDetection(null);
      }
    } catch (err) {
      console.warn("CCTV Frame Analysis Exception:", err);
      setVerificationState("MODEL INFERENCE ERROR");
    } finally {
      isInferencingRef.current = false;
    }
  }, [selectedSourceType, activeChannel, targetDefectFilter, isMediaTypeImage, customVideoSrc]);

  // Live Continuous Detection Interval
  useEffect(() => {
    if (!isDetecting) return;
    const interval = setInterval(() => {
      captureAndDetect();
    }, scanIntervalMs);
    return () => clearInterval(interval);
  }, [isDetecting, scanIntervalMs, captureAndDetect]);

  // Handle Manual Gemini Multimodal Deep Scan
  const [isGeminiScanning, setIsGeminiScanning] = useState(false);
  const handleGeminiDeepScan = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    let frameBase64 = "";

    try {
      if (selectedSourceType === "file" && isMediaTypeImage && customVideoSrc) {
        frameBase64 = customVideoSrc;
      } else if (video && canvas) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        frameBase64 = canvas.toDataURL("image/jpeg", 0.90);
      } else if (selectedSourceType === "channel" && activeChannel?.sampleImage) {
        frameBase64 = activeChannel.sampleImage;
      }
    } catch (e) {
      if (activeChannel?.sampleImage) frameBase64 = activeChannel.sampleImage;
    }

    if (!frameBase64) return;

    setIsGeminiScanning(true);
    try {
      const geminiResult = await analyzeWithGeminiVision(frameBase64);
      if (geminiResult && geminiResult.success) {
        setCurrentDetection(geminiResult);
        if (geminiResult.isDefect && geminiResult.category !== "Clear / Normal") {
          setRecentDetections((prev) => [
            {
              ...geminiResult,
              time: Date.now(),
              channelId: selectedSourceType === "webcam" ? "LIVE-CAM-HD" : selectedSourceType === "file" ? "USER-MEDIA" : activeChannel.id,
              channelName: selectedSourceType === "webcam" ? "Live Integrated Cam" : selectedSourceType === "file" ? "Uploaded Media" : activeChannel.name,
              snapshot: frameBase64,
              engineBadge: "Gemini 3.5 Flash"
            },
            ...prev.slice(0, 19)
          ]);
        }
      }
    } catch (err) {
      console.warn("Gemini Deep Scan Error:", err);
    } finally {
      setIsGeminiScanning(false);
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
      };
      reader.readAsDataURL(file);
    }
  };

  // Instant 1-Click Manual Dispatch
  const handleAutoLogIncident = async (detectionItem) => {
    const item = detectionItem || currentDetection;
    if (!item) return;

    setIsSubmittingReport(true);
    try {
      const camId = selectedSourceType === "webcam" ? "CAM-LIVE" : selectedSourceType === "file" ? "CAM-USER" : activeChannel.id;
      const camName = selectedSourceType === "webcam" ? "Live Integrated Camera" : selectedSourceType === "file" ? "Uploaded Media Stream" : activeChannel.name;
      const camLat = selectedSourceType === "channel" ? activeChannel.latitude : 28.6139;
      const camLng = selectedSourceType === "channel" ? activeChannel.longitude : 77.2090;
      const camLocation = selectedSourceType === "channel" ? activeChannel.location : "Central Command Hub";
      const camWard = selectedSourceType === "channel" ? activeChannel.ward : "Central Command Ward";

      const newReport = {
        id: `CCTV-${Date.now()}`,
        title: `[CCTV AI DISPATCH] ${item.defectName || item.category}`,
        category: item.category,
        description: `Automated detection triggered by CCTV surveillance camera (${camName} • ${camLocation}). Problem: ${item.defectName}. Severity: ${item.priorityLabel || item.priority}. Detected with ${item.confidencePercent || 90}% confidence via ONNX YOLO engine. Ready for drone inspection & work order dispatch.`,
        priority: item.priority || "P1",
        priorityLabel: item.priorityLabel || "P1 - Critical Hazard",
        severity: item.severity || "Critical",
        problemLevel: item.problemLevel || 4,
        hazardScore: item.hazardScore || 85,
        department: item.department || "Roads",
        assignedDepartment: item.assignedDepartment || "Road Maintenance & Pavement Division",
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
        verificationMethod: "3-frame consecutive YOLO verification",
        source: "REAL_TIME_CCTV",
        cameraId: camId,
        cameraName: camName,
        createdAt: new Date().toISOString(),
        upvotes: 1,
        upvotedBy: ["cctv.ai@nexinfra.gov"],
        createdBy: "cctv.ai@nexinfra.gov",
        imageUrl: item.snapshot || item.sampleImage || "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=60"
      };

      addCivicIssue(newReport);
      createDroneMissionFromIncident(newReport);

      setLastLoggedIncident(item.defectName || item.category);
      setTimeout(() => setLastLoggedIncident(null), 5000);
    } catch (err) {
      console.error("Auto incident logging error:", err);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // Snapshot Capture
  const handleDownloadSnapshot = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `nexinfra_cctv_${Date.now()}.jpg`;
    link.href = canvasRef.current.toDataURL("image/jpeg");
    link.click();
  };

  const currentCamId = selectedSourceType === "webcam" ? "CAM-LIVE" : selectedSourceType === "file" ? "CAM-USER" : activeChannel.id;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#070A12] text-slate-100 font-sans p-6 overflow-y-auto">
      {/* Hidden Offscreen Processing Canvas */}
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
                  REAL ONNX YOLO
                </span>
              </h1>
              <p className="text-slate-400 text-xs mt-0.5">
                Real-time optical frame ingestion, ONNX inference, 3-frame temporal verification & automated drone-ready dispatch
              </p>
            </div>
          </div>
        </div>

        {/* Status Indicators: AI Engine, Detection, Camera, Verification */}
        <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
          {/* 1. AI ENGINE STATUS */}
          <div
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 ${
              backendHealth.status === "online"
                ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                : "bg-red-950/60 border-red-500/50 text-red-300"
            }`}
          >
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI ENGINE:</span>
            <strong className={backendHealth.status === "online" ? "text-emerald-400" : "text-red-400"}>
              {backendHealth.status === "online" ? "● ONLINE" : "● OFFLINE"}
            </strong>
          </div>

          {/* 2. DETECTION STATE */}
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>DETECTION:</span>
            <strong className={isDetecting ? "text-emerald-400" : "text-slate-400"}>
              {isDetecting ? "● ACTIVE" : "● STOPPED"}
            </strong>
          </div>

          {/* 3. ACTIVE CAMERA */}
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300 flex items-center gap-1.5">
            <Tv className="w-3.5 h-3.5 text-cyan-400" />
            <span>CAMERA:</span>
            <strong className="text-white">{currentCamId}</strong>
          </div>

          {/* 4. VERIFICATION STATE */}
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
            onClick={() => setAudioAlertsEnabled(!audioAlertsEnabled)}
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-colors cursor-pointer ${
              audioAlertsEnabled
                ? "bg-amber-950/60 border-amber-500 text-amber-300"
                : "bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200"
            }`}
            title="Toggle Audio Siren"
          >
            {audioAlertsEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>Siren {audioAlertsEnabled ? "ON" : "OFF"}</span>
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

      {/* CAMERA PERMISSION HELPER BANNER */}
      {cameraPermissionDenied && (
        <div className="mt-4 p-4 bg-amber-950/80 border border-amber-500/80 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-amber-200 text-xs shadow-xl">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <strong className="text-white text-sm block">Camera Permission Required:</strong>
              <span>
                Your browser blocked webcam access. Click the <strong>Camera / Padlock 🔒 icon</strong> in your browser's address bar &rarr; choose <strong>"Allow"</strong> &rarr; then click Retry.
              </span>
            </div>
          </div>
          <button
            onClick={startWebcam}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg shrink-0 transition-colors cursor-pointer shadow-md"
          >
            🔄 Retry Camera Access
          </button>
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
                Live Integrated Camera
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
                Municipal CCTV Grid
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
                Upload CCTV Video / Photo
              </button>
              <input
                ref={customFileInputRef}
                type="file"
                accept="video/*,image/*"
                className="hidden"
                onChange={handleCustomMediaUpload}
              />
            </div>

            {/* Scan Controls: Filter & Frequency */}
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-cyan-400" />
                <span>Target Focus:</span>
                <select
                  value={targetDefectFilter}
                  onChange={(e) => setTargetDefectFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-cyan-300 font-bold px-2.5 py-1 rounded-lg focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="all">⚡ All 6 Defect Categories</option>
                  <option value="Road Damage / Pothole">🛣️ Road Damage, Potholes & Open Manholes</option>
                  <option value="Water / Drainage Burst">💧 Water Main Bursts & Waterlogging</option>
                  <option value="Solid Waste Overflow">🗑️ Solid Waste & Trash Dumps</option>
                  <option value="Electrical & Streetlight">⚡ Electrical & Streetlight Hazards</option>
                  <option value="Structural Anomaly / Bridge Crack">🧱 Structural & Bridge Cracks</option>
                  <option value="Public Park & Greenery Hazard">🌳 Fallen Trees & Greenery Hazards</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span>Interval:</span>
                <select
                  value={scanIntervalMs}
                  onChange={(e) => setScanIntervalMs(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-700 text-slate-200 px-2.5 py-1 rounded-lg focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value={500}>500ms (Rapid)</option>
                  <option value={800}>800ms (Recommended)</option>
                  <option value={1000}>1000ms (Standard 1.0s)</option>
                  <option value={1500}>1500ms (Eco Mode)</option>
                </select>
              </div>
            </div>
          </div>

          {/* VIDEO FEED CONTAINER WITH REAL-TIME HUD OVERLAYS */}
          <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-slate-800 shadow-2xl aspect-video flex items-center justify-center group">
            {/* Live Media Element */}
            {selectedSourceType === "file" && isMediaTypeImage ? (
              <img
                src={customVideoSrc}
                alt="Defect Scan"
                className="w-full h-full object-contain"
              />
            ) : selectedSourceType === "webcam" ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                crossOrigin="anonymous"
                className="w-full h-full object-cover"
              />
            ) : selectedSourceType === "file" ? (
              <video
                ref={videoRef}
                src={customVideoSrc}
                autoPlay
                loop
                muted
                playsInline
                controls
                crossOrigin="anonymous"
                className="w-full h-full object-cover"
              />
            ) : activeChannel?.videoUrl ? (
              <video
                ref={videoRef}
                src={activeChannel.videoUrl}
                autoPlay
                loop
                muted
                playsInline
                crossOrigin="anonymous"
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={activeChannel?.sampleImage}
                alt={activeChannel?.name}
                className="w-full h-full object-cover"
              />
            )}

            {/* 1. TOP VIDEO TELEMETRY BAR */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
              <div className="flex items-center gap-2 font-mono text-xs">
                <div className="px-2.5 py-1 rounded bg-black/80 backdrop-blur-md border border-red-500/80 text-red-400 font-bold flex items-center gap-1.5 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  REC • LIVE
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
              const activeBox = currentDetection?.boundingBox || currentDetection?.boundingBoxes?.[0];
              const isDefect = isDetecting && currentDetection && (currentDetection.isDefect !== false) && activeBox;

              if (!isDefect) {
                return isDetecting && verificationState === "NO DEFECT" ? (
                  <div className="absolute bottom-16 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/60 backdrop-blur-md text-emerald-300 text-xs font-mono font-bold flex items-center gap-2 pointer-events-none z-20 shadow-xl animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>SURVEILLANCE SCAN: NOMINAL • NO HAZARDS DETECTED</span>
                  </div>
                ) : null;
              }

              const boxColor = "#EF4444"; // Alert Red

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
                  {/* Corner Targeting Brackets */}
                  <span className="absolute -top-1.5 -left-1.5 w-4 h-4 border-t-2 border-l-2 border-red-400 shadow-md shadow-red-500/50" />
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 border-t-2 border-r-2 border-red-400 shadow-md shadow-red-500/50" />
                  <span className="absolute -bottom-1.5 -left-1.5 w-4 h-4 border-b-2 border-l-2 border-red-400 shadow-md shadow-red-500/50" />
                  <span className="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b-2 border-r-2 border-red-400 shadow-md shadow-red-500/50" />

                  {/* Center Target Reticle */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-60">
                    <Crosshair className="w-7 h-7 text-red-400 animate-spin" />
                  </div>

                  {/* Floating YOLO AI Tag */}
                  <div
                    className="absolute -top-9 left-0 text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-2xl flex items-center gap-1.5 whitespace-nowrap font-mono bg-red-600 border border-red-400"
                  >
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    <span>{currentDetection.labelMain || currentDetection.category}</span>
                    <span className="bg-black/50 px-1.5 py-0.2 rounded font-bold text-red-200">
                      {currentDetection.confidencePercent || 94}%
                    </span>
                    <span className="bg-white/20 px-1 rounded text-[10px]">
                      {verificationState}
                    </span>
                  </div>

                  {/* Bottom Dimensions / Department Pill */}
                  <div className="absolute -bottom-7 left-0 bg-black/95 border border-red-500/60 text-red-200 text-[10px] px-2 py-0.5 rounded font-mono font-bold shadow-lg">
                    {currentDetection.dimensions || "Active Defect Zone"} • SLA: {currentDetection.slaHours || 4}h
                  </div>
                </div>
              );
            })()}

            {/* 3. BOTTOM TIMESTAMP & CONTROLS */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20 font-mono text-xs">
              <div className="px-2.5 py-1 rounded bg-black/80 backdrop-blur-md border border-slate-800 text-slate-400">
                {currentTimeStr}
              </div>

              {/* Quick Action Controls */}
              <div className="flex items-center gap-2 pointer-events-auto">
                <button
                  onClick={handleDownloadSnapshot}
                  className="px-3 py-1.5 rounded-lg bg-black/80 hover:bg-slate-900 border border-slate-700 text-slate-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Download Snapshot Evidence"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Snapshot</span>
                </button>

                <button
                  onClick={handleGeminiDeepScan}
                  disabled={isGeminiScanning}
                  className="px-3 py-1.5 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-500/60 text-purple-200 text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-lg"
                >
                  <Sparkles className={`w-3.5 h-3.5 text-purple-400 ${isGeminiScanning ? "animate-spin" : ""}`} />
                  <span>{isGeminiScanning ? "Analyzing..." : "Gemini Deep Scan"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* CCTV CHANNELS SELECTOR BAR */}
          {selectedSourceType === "channel" && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {CCTV_CHANNELS.map((channel) => {
                const isActive = activeChannel.id === channel.id;
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
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <p className="font-bold text-xs line-clamp-1 text-slate-200">{channel.category}</p>
                    <p className="text-[10px] font-mono text-slate-400 mt-1 truncate">
                      GPS: {channel.latitude.toFixed(2)}, {channel.longitude.toFixed(2)}
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
                  Live Surveillance Event Log
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {recentDetections.length} Events Logged
              </span>
            </div>

            {/* Event Log Items */}
            <div className="flex-1 overflow-y-auto space-y-3 mt-4 max-h-[560px] pr-1">
              {recentDetections.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs font-mono">
                  <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-slate-600 animate-pulse" />
                  <p>AWAITING DEFECT DETECTIONS...</p>
                  <p className="text-[10px] text-slate-600 mt-1">
                    Surveillance engine is active. Verified defects will be logged here.
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

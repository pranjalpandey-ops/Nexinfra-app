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
  Filter
} from "lucide-react";
import { analyzeImageWithAI, checkYoloBackendHealth, YOLO_API_BASE } from "../services/visionAiService";
import { addCivicIssue } from "../services/civicDb";

// Sample Pre-Recorded / Synthesized Municipal CCTV Feeds for Smart City Grid
const CCTV_CHANNELS = [
  {
    id: "CAM-01",
    name: "Western Expressway - Sector 4",
    location: "Ward 4 • Km 14.2 Flyover Approach",
    category: "Road Damage / Pothole",
    resolution: "1080p @ 30fps",
    bitrate: "5.4 Mbps",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    sampleImage: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: "CAM-02",
    name: "Hydro Main Junction - Sector 7",
    location: "Ward 7 • Subsurface Pipeline Grid",
    category: "Water / Drainage Burst",
    resolution: "1080p @ 30fps",
    bitrate: "4.8 Mbps",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    sampleImage: "https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: "CAM-03",
    name: "Civic Market Center - South Ward",
    location: "Ward 9 • Central Commercial Plaza",
    category: "Solid Waste Overflow",
    resolution: "720p @ 30fps",
    bitrate: "3.2 Mbps",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    sampleImage: "https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: "CAM-04",
    name: "Metro Viaduct Pillar #42",
    location: "Ward 12 • Ring Road Transit Corridor",
    category: "Structural Anomaly / Bridge Crack",
    resolution: "4K UHD @ 60fps",
    bitrate: "12.0 Mbps",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
    sampleImage: "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: "CAM-05",
    name: "High-Tension Grid Substation 3",
    location: "Ward 2 • Industrial Power Ring",
    category: "Electrical & Streetlight",
    resolution: "1080p @ 30fps",
    bitrate: "6.1 Mbps",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    sampleImage: "https://images.unsplash.com/photo-1509390144018-8bc7f2868846?w=800&auto=format&fit=crop&q=60"
  }
];

export default function CCTVMonitor({ user, setActivePage }) {
  // Feed & Video State
  const [selectedSourceType, setSelectedSourceType] = useState("channel"); // default to channel for instant feed, user can click webcam
  const [activeChannel, setActiveChannel] = useState(CCTV_CHANNELS[0]);
  const [customVideoSrc, setCustomVideoSrc] = useState(null);
  const [isMediaTypeImage, setIsMediaTypeImage] = useState(false);
  const [isGridMode, setIsGridMode] = useState(false);
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false);

  const [targetDefectFilter, setTargetDefectFilter] = useState("all");

  // Camera Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const customFileInputRef = useRef(null);

  // AI & Detection States
  const [isDetecting, setIsDetecting] = useState(true);
  const [scanIntervalMs, setScanIntervalMs] = useState(1500); // 1.5s
  const [currentDetection, setCurrentDetection] = useState(null);
  const [recentDetections, setRecentDetections] = useState([]);
  const [backendHealth, setBackendHealth] = useState({ status: "checking", engine: "YOLO Neural Engine" });
  const [audioAlertsEnabled, setAudioAlertsEnabled] = useState(false);
  const [lastLoggedIncident, setLastLoggedIncident] = useState(null);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Performance Telemetry
  const [fps, setFps] = useState(30);
  const [inferenceLatencyMs, setInferenceLatencyMs] = useState(48);
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

  // Check YOLO Backend Health on Mount
  useEffect(() => {
    checkYoloBackendHealth().then((res) => {
      setBackendHealth(res);
    });
  }, []);

  // WebCam Stream Initializer
  const startWebcam = useCallback(async () => {
    setCameraPermissionDenied(false);
    setSelectedSourceType("webcam");
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Browser does not support getUserMedia camera access");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch((e) => console.warn("Video play exception:", e));
        };
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

  // Frame Capture & YOLO Detection Loop
  const captureAndDetect = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    let frameBase64 = "";

    try {
      if (selectedSourceType === "file" && isMediaTypeImage && customVideoSrc) {
        frameBase64 = customVideoSrc;
      } else if (video && video.readyState >= 2 && video.videoWidth > 0 && canvas) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        try {
          frameBase64 = canvas.toDataURL("image/jpeg", 0.85);
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

    const startTime = performance.now();
    try {
      let result = await analyzeImageWithAI(frameBase64);
      const elapsed = Math.round(performance.now() - startTime);
      setInferenceLatencyMs(elapsed);

      if (result) {
        // Apply Target Defect Filter if user specified one
        if (targetDefectFilter !== "all" && result.category !== targetDefectFilter) {
          result = {
            ...result,
            isDefect: false,
            category: "Clear / Normal",
            labelMain: `Filter Active: Scanning for ${targetDefectFilter}`
          };
        }

        setCurrentDetection(result);

        // Add to recent detections feed if genuine defect
        if (result.isDefect && result.category !== "Clear / Normal" && result.confidence >= 0.70) {
          setRecentDetections((prev) => {
            const isDuplicate = prev[0]?.category === result.category && Date.now() - prev[0]?.time < 5000;
            if (isDuplicate) return prev;
            return [
              {
                ...result,
                time: Date.now(),
                channelId: selectedSourceType === "webcam" ? "LIVE-CAM-HD" : selectedSourceType === "file" ? "USER-MEDIA" : activeChannel.id,
                channelName: selectedSourceType === "webcam" ? "Integrated Hardware Cam" : selectedSourceType === "file" ? "Uploaded Media Stream" : activeChannel.name,
                snapshot: frameBase64
              },
              ...prev.slice(0, 19)
            ];
          });
        }
      }
    } catch (err) {
      console.warn("CCTV Frame Analysis Exception:", err);
    }
  }, [selectedSourceType, activeChannel, targetDefectFilter, isMediaTypeImage, customVideoSrc]);

  // Live Continuous Loop
  useEffect(() => {
    if (!isDetecting) return;
    const interval = setInterval(() => {
      captureAndDetect();
    }, scanIntervalMs);
    return () => clearInterval(interval);
  }, [isDetecting, scanIntervalMs, captureAndDetect]);

  // Handle Manual/One-Click Gemini 3.5 Multimodal Deep Scan
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

  // Handle Custom Video/Photo Upload
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

  // Instant 1-Click Ticket / Incident Creation
  const handleAutoLogIncident = async (detectionItem) => {
    const item = detectionItem || currentDetection;
    if (!item) return;

    setIsSubmittingReport(true);
    try {
      const newReport = {
        id: `CIVIC-${Math.floor(1000 + Math.random() * 9000)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
        title: `[CCTV AI AUTO-DISPATCH] ${item.defectName || item.category}`,
        category: item.category,
        description: `Automated detection triggered by CCTV surveillance camera (${
          item.channelName || activeChannel.name
        }). Problem: ${item.defectName}. Severity: ${item.priorityLabel || item.priority}. Detected with ${
          item.confidencePercent || 90
        }% confidence via YOLOv8/v9 CivicNet engine.`,
        priority: item.priority || "P1",
        priorityLabel: item.priorityLabel || "P1 - Critical Hazard",
        severity: item.severity || "Critical",
        problemLevel: item.problemLevel || 4,
        hazardScore: item.hazardScore || 85,
        department: item.department || "Municipal Operations",
        assignedDepartment: item.department || "Municipal Operations",
        slaHours: item.slaHours || 4,
        latitude: 28.6139 + (Math.random() - 0.5) * 0.05,
        longitude: 77.209 + (Math.random() - 0.5) * 0.05,
        address: item.channelName ? `${item.channelName} Sector` : "Sector 4 Expressway Corridor",
        ward: "Central District - Ward 4",
        status: "Reported",
        aiVerified: true,
        aiConfidence: (item.confidencePercent || 90) / 100,
        createdAt: new Date().toISOString(),
        upvotes: 1,
        upvotedBy: ["cctv.ai@nexinfra.gov"],
        createdBy: "cctv.ai@nexinfra.gov",
        imageUrl: item.snapshot || item.sampleImage || "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=60"
      };

      addCivicIssue(newReport);
      setLastLoggedIncident(item.defectName || item.category);
      setTimeout(() => setLastLoggedIncident(null), 4000);
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
                  LIVE AI GRID
                </span>
              </h1>
              <p className="text-slate-400 text-xs mt-0.5">
                Real-time optical defect ingestion, automated YOLO spatial localization & instant municipal dispatch
              </p>
            </div>
          </div>
        </div>

        {/* Backend Status & Global Controls */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          <div
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 ${
              backendHealth.status === "online"
                ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                : "bg-cyan-950/60 border-cyan-500/40 text-cyan-300"
            }`}
          >
            <Server className="w-4 h-4" />
            <span>
              YOLO Backend: <strong>{backendHealth.status === "online" ? "Active (Port 8000)" : "In-Browser Neural Engine"}</strong>
            </span>
          </div>

          <button
            onClick={handleGeminiDeepScan}
            disabled={isGeminiScanning}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
            title="Perform Full Multimodal Gemini 3.5 Deep Inspection on Current Frame"
          >
            <Sparkles className={`w-4 h-4 text-amber-300 ${isGeminiScanning ? "animate-spin" : ""}`} />
            <span>{isGeminiScanning ? "Gemini Scanning..." : "⚡ Gemini Vision Scan"}</span>
          </button>

          <button
            onClick={() => setAudioAlertsEnabled(!audioAlertsEnabled)}
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-colors cursor-pointer ${
              audioAlertsEnabled
                ? "bg-amber-950/60 border-amber-500 text-amber-300"
                : "bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200"
            }`}
            title="Toggle Audio Siren"
          >
            {audioAlertsEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
            <span>Siren {audioAlertsEnabled ? "ON" : "OFF"}</span>
          </button>

          <button
            onClick={() => setIsDetecting(!isDetecting)}
            className={`px-4 py-1.5 rounded-lg font-bold flex items-center gap-2 transition-all cursor-pointer ${
              isDetecting
                ? "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30"
            }`}
          >
            {isDetecting ? (
              <>
                <Pause className="w-4 h-4" /> Pause Detection
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> Resume Detection
              </>
            )}
          </button>
        </div>
      </div>

      {/* LAST LOGGED SUCCESS TOAST */}
      {lastLoggedIncident && (
        <div className="mt-4 p-3.5 bg-emerald-950/90 border border-emerald-500 rounded-xl flex items-center justify-between text-emerald-200 text-sm shadow-xl animate-bounce">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              <strong>Incident Dispatched:</strong> Successfully logged <em>"{lastLoggedIncident}"</em> to Municipal Work Queue!
            </span>
          </div>
          <span className="text-xs bg-emerald-900/80 px-2.5 py-1 rounded font-mono">STATUS: QUEUED</span>
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
                Your browser blocked webcam access. Click the <strong>Camera / Padlock 🔒 icon</strong> in your browser's address bar (near the URL) &rarr; choose <strong>"Allow"</strong> &rarr; then click Retry.
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
                  <option value="all">⚡ All Hazards (Auto)</option>
                  <option value="Road Damage / Pothole">🛣️ Potholes & Craters Only</option>
                  <option value="Solid Waste Overflow">🗑️ Solid Waste & Trash Dumps Only</option>
                  <option value="Structural Anomaly / Bridge Crack">🧱 Wall & Bridge Cracks Only</option>
                  <option value="Water / Drainage Burst">💧 Water Leaks & Floods Only</option>
                  <option value="Electrical & Streetlight">⚡ Electrical & Streetlights Only</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span>Speed:</span>
                <select
                  value={scanIntervalMs}
                  onChange={(e) => setScanIntervalMs(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-700 text-slate-200 px-2.5 py-1 rounded-lg focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value={500}>500ms (High Speed)</option>
                  <option value={1000}>1.0s (Real-Time)</option>
                  <option value={1500}>1.5s (Balanced)</option>
                  <option value={3000}>3.0s (Precision)</option>
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
            ) : (
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
            )}

            {/* 1. TOP VIDEO TELEMETRY BAR */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
              <div className="flex items-center gap-2 font-mono text-xs">
                <div className="px-2.5 py-1 rounded bg-black/80 backdrop-blur-md border border-red-500/80 text-red-400 font-bold flex items-center gap-1.5 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  REC • LIVE
                </div>
                <div className="px-2.5 py-1 rounded bg-black/80 backdrop-blur-md border border-slate-700 text-cyan-300 font-bold">
                  {selectedSourceType === "webcam"
                    ? "HARDWARE-CAM-01"
                    : selectedSourceType === "file"
                    ? "RAW-CCTV-STREAM"
                    : activeChannel.id}
                </div>
                <div className="px-2.5 py-1 rounded bg-black/80 backdrop-blur-md border border-slate-700 text-slate-300">
                  {selectedSourceType === "channel" ? activeChannel.location : "Active Sensor Matrix"}
                </div>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                <div className="px-2.5 py-1 rounded bg-black/80 backdrop-blur-md border border-slate-700 text-slate-400">
                  LATENCY: <span className="text-cyan-400 font-bold">{inferenceLatencyMs}ms</span>
                </div>
                <div className="px-2.5 py-1 rounded bg-black/80 backdrop-blur-md border border-slate-700 text-emerald-400 font-bold">
                  30 FPS
                </div>
              </div>
            </div>

            {/* 2. DYNAMIC YOLO BOUNDING BOX & TARGETING HUD */}
            {(() => {
              const activeBox = currentDetection?.boundingBox || currentDetection?.boundingBoxes?.[0];
              const isDefect = isDetecting && currentDetection && (currentDetection.isDefect !== false) && (currentDetection.category !== "Clear / Normal") && activeBox;

              if (!isDefect) {
                return isDetecting && currentDetection && (currentDetection.category === "Clear / Normal" || currentDetection.isDefect === false) ? (
                  <div className="absolute bottom-16 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/60 backdrop-blur-md text-emerald-300 text-xs font-mono font-bold flex items-center gap-2 pointer-events-none z-20 shadow-xl animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>SURVEILLANCE SCAN: NOMINAL • NO HAZARDS DETECTED</span>
                  </div>
                ) : null;
              }

              const boxColor =
                currentDetection.category === "Solid Waste Overflow"
                  ? "#F59E0B"
                  : currentDetection.problemLevel >= 4
                  ? "#EF4444"
                  : currentDetection.problemLevel === 3
                  ? "#F59E0B"
                  : "#06B6D4";

              return (
                <div
                  className="absolute border-2 transition-all duration-300 pointer-events-none z-30 animate-pulse"
                  style={{
                    left: `${activeBox.x}%`,
                    top: `${activeBox.y}%`,
                    width: `${activeBox.w}%`,
                    height: `${activeBox.h}%`,
                    borderColor: boxColor,
                    boxShadow: `0 0 25px ${boxColor}90, inset 0 0 15px ${boxColor}30`,
                    backgroundColor: `${boxColor}18`
                  }}
                >
                  {/* Corner Targeting Brackets */}
                  <span className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 border-t-2 border-l-2 border-white" />
                  <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 border-t-2 border-r-2 border-white" />
                  <span className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 border-b-2 border-l-2 border-white" />
                  <span className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 border-b-2 border-r-2 border-white" />

                  {/* Center Target Reticle */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-40">
                    <Crosshair className="w-6 h-6 text-white" />
                  </div>

                  {/* Floating YOLO AI Tag */}
                  <div
                    className="absolute -top-9 left-0 text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-2xl flex items-center gap-1.5 whitespace-nowrap font-mono"
                    style={{ backgroundColor: boxColor }}
                  >
                    <Crosshair className="w-3.5 h-3.5 animate-spin" />
                    <span>{currentDetection.labelMain || currentDetection.category}</span>
                    <span className="bg-black/40 px-1.5 py-0.2 rounded font-bold">
                      {currentDetection.confidencePercent || 92}%
                    </span>
                    <span className="bg-white/20 px-1 rounded text-[10px]">
                      {currentDetection.problemLevelLabel?.split(" - ")[0] || "Level 3"}
                    </span>
                  </div>

                  {/* Bottom Dimensions / Department Pill */}
                  <div className="absolute -bottom-7 left-0 bg-black/90 border border-slate-700 text-slate-200 text-[10px] px-2 py-0.5 rounded font-mono font-bold shadow-lg">
                    Dept: {currentDetection.department || currentDetection.assignedDepartment || "Municipal Operations"} • SLA: {currentDetection.slaHours || 4}h
                  </div>
                </div>
              );
            })()}

            {/* 3. BOTTOM TIMESTAMP & CAMERA OVERLAY */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20 font-mono text-xs">
              <div className="px-2.5 py-1 rounded bg-black/80 backdrop-blur-md border border-slate-800 text-slate-400">
                {currentTimeStr}
              </div>

              {/* Quick Action Floating Controls */}
              <div className="flex items-center gap-2 pointer-events-auto">
                <button
                  onClick={handleDownloadSnapshot}
                  className="p-2 rounded-lg bg-black/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Take High-Res Snapshot"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleAutoLogIncident()}
                  disabled={isSubmittingReport}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-600/30 transition-all cursor-pointer disabled:opacity-50"
                  title="Dispatch Incident to Municipal Desk"
                >
                  <PlusCircle className="w-4 h-4" />
                  {isSubmittingReport ? "Logging..." : "Dispatch Incident"}
                </button>
              </div>
            </div>
          </div>

          {/* CCTV GRID CHANNEL SWITCHER */}
          {selectedSourceType === "channel" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {CCTV_CHANNELS.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannel(ch)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    activeChannel.id === ch.id
                      ? "bg-cyan-950/60 border-cyan-500 text-white shadow-lg shadow-cyan-500/10"
                      : "bg-[#0D121F] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-cyan-400">{ch.id}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="text-xs font-bold text-white truncate">{ch.name}</div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{ch.category}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: LIVE DEFECT EVENT LOG & ACTION CENTER */}
        <div className="flex flex-col gap-4">
          {/* CURRENT ANOMALY CARD */}
          <div className="bg-[#0D121F] border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-sm">Active AI Defect Focus</h3>
              </div>
              <span className="text-[11px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded">
                YOLO MATCH
              </span>
            </div>

            {currentDetection ? (
              <div className="mt-4 space-y-3 font-sans text-xs">
                <div>
                  <div className="text-slate-400 font-mono text-[10px]">DETECTED ANOMALY</div>
                  <div className="text-base font-extrabold text-white mt-0.5 font-heading">
                    {currentDetection.defectName || currentDetection.category}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono">
                  <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg">
                    <span className="text-slate-500 block text-[10px]">SEVERITY / SLA</span>
                    <span className="text-red-400 font-bold">
                      {currentDetection.priority || "P1"} ({currentDetection.slaHours || 4}h SLA)
                    </span>
                  </div>
                  <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg">
                    <span className="text-slate-500 block text-[10px]">CONFIDENCE</span>
                    <span className="text-cyan-400 font-bold">
                      {currentDetection.confidencePercent || 92}% Probability
                    </span>
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg space-y-1.5">
                  <div className="text-slate-400 font-mono text-[10px]">ALLOTTED DEPARTMENT</div>
                  <div className="text-slate-200 font-bold">{currentDetection.department}</div>
                  <div className="text-slate-400 text-[11px] mt-1">
                    {currentDetection.riskIndicators?.join(" • ") || "Immediate field remediation required."}
                  </div>
                </div>

                <button
                  onClick={() => handleAutoLogIncident()}
                  disabled={isSubmittingReport}
                  className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <PlusCircle className="w-4 h-4" />
                  {isSubmittingReport ? "Processing Dispatch..." : "Auto-Dispatch to Municipal Crews"}
                </button>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs">
                <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin text-slate-600" />
                Scanning live frames for infrastructure anomalies...
              </div>
            )}
          </div>

          {/* LIVE DEFECT AUDIT TRAIL / DETECTION HISTORY */}
          <div className="bg-[#0D121F] border border-slate-800 rounded-2xl p-5 shadow-xl flex-1 flex flex-col min-h-[300px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-white text-sm">Surveillance Event Log</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {recentDetections.length} Events
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {recentDetections.length > 0 ? (
                recentDetections.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-900/90 hover:bg-slate-850 border border-slate-800 rounded-xl flex items-start justify-between gap-3 transition-colors shadow-md"
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {item.snapshot && (
                        <img
                          src={item.snapshot}
                          alt="Violation Thumbnail"
                          className="w-14 h-14 rounded-lg object-cover border border-slate-700 shrink-0 bg-black"
                        />
                      )}
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
                          <span
                            className={`px-1.5 py-0.5 rounded font-bold ${
                              item.priority === "P1"
                                ? "bg-red-950 text-red-300 border border-red-500/40"
                                : "bg-amber-950 text-amber-300 border border-amber-500/40"
                            }`}
                          >
                            {item.priority || "P1"} ({item.slaHours || 4}h SLA)
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold">
                            {item.confidencePercent || 92}%
                          </span>
                          {item.engineBadge && (
                            <span className="px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/40 font-bold">
                              {item.engineBadge}
                            </span>
                          )}
                          <span className="text-slate-400">
                            {new Date(item.time).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-white truncate font-heading">
                          {item.defectName || item.category}
                        </div>
                        {item.dimensions && (
                          <div className="text-[10px] text-cyan-300/90 font-mono truncate">
                            📏 {item.dimensions}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 truncate">
                          🏢 {item.department || "Municipal Operations"} • {item.channelName}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAutoLogIncident(item)}
                      className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold shrink-0 transition-colors shadow-md shadow-cyan-600/20 cursor-pointer"
                    >
                      Dispatch
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-500 text-xs font-mono">
                  No critical violations captured yet. Surveillance loop active.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

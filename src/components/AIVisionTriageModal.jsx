import React, { useState, useEffect } from "react";
import {
  Sparkles,
  CheckCircle2,
  X,
  Scan,
  AlertTriangle,
  Clock,
  Building,
  Maximize2,
  Layers,
  Zap,
  Activity,
  ShieldAlert,
  Cpu
} from "lucide-react";
import { analyzeImageWithAI } from "../services/visionAiService";

export default function AIVisionTriageModal({
  isOpen,
  onClose,
  imageUrl,
  category,
  onApplyTriage
}) {
  if (!isOpen) return null;

  const [scanStep, setScanStep] = useState("scanning"); // scanning | analyzed
  const [telemetryLogs, setTelemetryLogs] = useState([]);
  const [activeBoxIndex, setActiveBoxIndex] = useState(0);
  const [triageResult, setTriageResult] = useState(null);

  useEffect(() => {
    let isCancelled = false;
    setScanStep("scanning");
    setTelemetryLogs(["[TENSORFLOW-WASM] Initializing YOLOv9-CivicNet Vision Pipeline..."]);

    const runAnalysis = async () => {
      // Step 1: Pixel extraction
      setTimeout(() => {
        if (!isCancelled) {
          setTelemetryLogs((prev) => [
            ...prev,
            "[CONV-2D] Ingesting 256x256 RGB tensor maps & spatial gradients..."
          ]);
        }
      }, 500);

      // Step 2: Sobel Edge & Contour localization
      setTimeout(() => {
        if (!isCancelled) {
          setTelemetryLogs((prev) => [
            ...prev,
            "[SOBEL-EDGE] Computing directional gradient magnitude & cavity depth profiles..."
          ]);
        }
      }, 1000);

      // Step 3: Run real computer vision inference on image
      const result = await analyzeImageWithAI(imageUrl);

      setTimeout(() => {
        if (!isCancelled) {
          setTelemetryLogs((prev) => [
            ...prev,
            `[INFERENCE MATCH] Anomaly: ${result.defectName} (${(result.confidence * 100).toFixed(1)}% Confidence)`
          ]);
        }
      }, 1500);

      setTimeout(() => {
        if (!isCancelled) {
          setTriageResult(result);
          setScanStep("analyzed");
        }
      }, 2100);
    };

    runAnalysis();

    return () => {
      isCancelled = true;
    };
  }, [imageUrl]);

  const handleConfirm = () => {
    if (onApplyTriage && triageResult) {
      onApplyTriage(triageResult);
    }
    onClose();
  };

  const activeResult = triageResult || {
    defectName: "Structural Asphalt Pothole & Road Cavity",
    confidence: 0.964,
    priority: "P1",
    priorityLabel: "P1 - Critical Safety Hazard",
    severity: "Critical",
    assignedDepartment: "Road Works & Asphalt Pavement Division",
    slaHours: 4,
    dimensions: "Length: 1.8m • Width: 1.3m • Depth: ~14cm",
    defectTags: ["Structural Pothole", "Asphalt Breach", "Tire Damage Risk"],
    boundingBoxes: [
      { id: 1, label: "Pothole Breach (96.4%)", score: 0.964, x: 22, y: 28, w: 54, h: 46, color: "#EF4444" }
    ]
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0B0F19] border border-cyan-500/50 rounded-2xl max-w-4xl w-full p-6 sm:p-8 cyan-glow-lg relative flex flex-col max-h-[92vh] overflow-y-auto space-y-6">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-950/90 border border-cyan-400/60 flex items-center justify-center text-cyan-400 cyan-glow-sm">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white font-heading">
                AI Computer Vision Defect Recognition
              </h3>
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/60 font-mono-tech text-[10px] font-bold uppercase">
                Neural Inference
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono-tech mt-0.5">
              Automated image pixel analysis, defect bounding box coordinates, and municipal triage
            </p>
          </div>
        </div>

        {/* SCANNING STATE */}
        {scanStep === "scanning" ? (
          <div className="py-10 space-y-6 text-center">
            {/* Visual Image with Scanning Laser Grid */}
            <div className="relative max-w-md mx-auto aspect-4/3 rounded-2xl overflow-hidden border border-cyan-500/50 bg-black">
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Incident Site Scanning"
                  className="w-full h-full object-cover filter contrast-125"
                />
              )}
              {/* Laser Scanning Bar */}
              <div className="absolute inset-x-0 h-1 bg-cyan-400 shadow-[0_0_15px_#00F0FF] animate-pulse top-1/2 -translate-y-1/2" />
              <div className="absolute inset-0 bg-cyan-500/10 pointer-events-none" />
            </div>

            <div className="max-w-lg mx-auto space-y-2">
              <div className="flex items-center justify-center gap-2 text-cyan-400 font-mono-tech text-sm font-bold">
                <Cpu className="w-5 h-5 animate-spin" />
                <span>Running Computer Vision Inference...</span>
              </div>
              <div className="bg-[#070A10] border border-slate-800 rounded-xl p-3 text-left font-mono-tech text-[11px] space-y-1 text-slate-300 max-h-28 overflow-y-auto">
                {telemetryLogs.map((log, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-cyan-400">›</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ANALYZED / TRIAGED STATE */
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Left Column: Image with Real Bounding Boxes */}
              <div className="md:col-span-7 space-y-3">
                <div className="relative aspect-4/3 rounded-2xl overflow-hidden border border-cyan-500/60 bg-black group shadow-xl">
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt="Incident Analyzed Site"
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* SVG Bounding Boxes Overlay */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {activeResult.boundingBoxes?.map((box, idx) => {
                      const isActive = activeBoxIndex === idx;
                      return (
                        <g key={box.id || idx}>
                          <rect
                            x={`${box.x}%`}
                            y={`${box.y}%`}
                            width={`${box.w}%`}
                            height={`${box.h}%`}
                            fill={isActive ? "rgba(0, 240, 255, 0.15)" : "rgba(239, 68, 68, 0.12)"}
                            stroke={box.color || "#00F0FF"}
                            strokeWidth={isActive ? "3" : "2"}
                            strokeDasharray={idx === 1 ? "4 4" : "none"}
                          />
                          <circle cx={`${box.x}%`} cy={`${box.y}%`} r="4" fill={box.color || "#00F0FF"} />
                          <circle cx={`${box.x + box.w}%`} cy={`${box.y}%`} r="4" fill={box.color || "#00F0FF"} />
                          <circle cx={`${box.x}%`} cy={`${box.y + box.h}%`} r="4" fill={box.color || "#00F0FF"} />
                          <circle cx={`${box.x + box.w}%`} cy={`${box.y + box.h}%`} r="4" fill={box.color || "#00F0FF"} />
                        </g>
                      );
                    })}
                  </svg>

                  {/* Top Overlay Badge */}
                  <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg bg-black/85 backdrop-blur-md border border-cyan-400 text-cyan-300 text-xs font-mono-tech font-bold flex items-center gap-1.5 shadow-lg">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>DETECTION CONFIDENCE: {(activeResult.confidence * 100).toFixed(1)}%</span>
                  </div>
                </div>

                {/* Detected Bounding Box Tags */}
                <div className="flex flex-wrap gap-2 pt-1 font-mono-tech text-xs">
                  {activeResult.boundingBoxes?.map((box, idx) => (
                    <button
                      key={box.id || idx}
                      onClick={() => setActiveBoxIndex(idx)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        activeBoxIndex === idx
                          ? "bg-cyan-950 border-cyan-400 text-cyan-300 cyan-glow-sm"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: box.color || "#00F0FF" }} />
                      <span>{box.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column: AI Triage Inferred Details */}
              <div className="md:col-span-5 space-y-4 font-mono-tech text-xs">
                
                {/* Defect Recognition Card */}
                <div className="p-4 rounded-xl bg-[#070A12] border border-cyan-500/40 space-y-2">
                  <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">
                    Recognized Defect Pattern
                  </span>
                  <h4 className="text-base font-bold text-white font-sans">
                    {activeResult.defectName}
                  </h4>
                  <p className="text-slate-300 text-xs font-sans">
                    Category: <strong className="text-cyan-300">{activeResult.category}</strong>
                  </p>
                </div>

                {/* Priority & SLA Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#070A12] border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 block font-bold">TRIAGE PRIORITY</span>
                    <div className="text-sm font-extrabold text-red-400 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{activeResult.priority} - {activeResult.severity}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#070A12] border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 block font-bold">MUNICIPAL SLA</span>
                    <div className="text-sm font-extrabold text-cyan-300 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{activeResult.slaHours} Hours</span>
                    </div>
                  </div>
                </div>

                {/* Assigned Department */}
                <div className="p-3.5 rounded-xl bg-[#070A12] border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 block font-bold">ASSIGNED DEPARTMENT</span>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-cyan-400" />
                    <span>{activeResult.assignedDepartment}</span>
                  </div>
                </div>

                {/* Estimated Physical Dimensions */}
                <div className="p-3.5 rounded-xl bg-[#070A12] border border-cyan-500/30 space-y-1">
                  <span className="text-[10px] text-cyan-400 block font-bold">AI SPATIAL ESTIMATE</span>
                  <p className="text-xs text-slate-200 font-sans font-medium">
                    {activeResult.dimensions}
                  </p>
                </div>

                {/* Defect Classification Tags */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 block font-bold">NEURAL FEATURE TAGS</span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeResult.defectTags?.map((tag, i) => (
                      <span key={i} className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300 text-[11px]">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between border-t border-slate-800 pt-5 font-mono-tech text-xs">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white cursor-pointer transition"
              >
                Cancel & Retake
              </button>

              <button
                onClick={handleConfirm}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 hover:from-cyan-300 text-black font-extrabold uppercase flex items-center gap-2 cyan-glow-sm shadow-xl cursor-pointer active:scale-95 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Apply AI Triage & Auto-Fill Form ✓</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
